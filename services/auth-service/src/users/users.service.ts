import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from './enums/user-role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { v4 as uuidv4 } from 'uuid';
import { hash, compare } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { EventsService } from '../events/events.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly eventsService: EventsService,
  ) {
    this.logger.log('UsersService constructor called, EventsService injected');
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log('Creating user and will publish event afterward');
    const { email, password } = createUserDto;

    // Check if user already exists
    const userExists = await this.usersRepository.findOne({
      where: { email },
    });

    if (userExists) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10);
    const hashedPassword = await hash(password, saltRounds);

    // Generate verification token
    const verificationToken = uuidv4();

    // Create user
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      verificationToken,
      isVerified: false,
    });

    const savedUser = await this.usersRepository.save(user);
    
    // Publish user created event
    this.logger.log(`User created with ID ${savedUser.id}, attempting to publish event`);
    try {
      await this.eventsService.publishUserCreated(savedUser);
      this.logger.log('Successfully called publishUserCreated method');
    } catch (error) {
      this.logger.error('Error calling publishUserCreated method', error);
    }
    
    return savedUser;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // If updating password, hash it
    if (updateUserDto.password) {
      const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10);
      updateUserDto.password = await hash(updateUserDto.password, saltRounds);
    }

    // Update user
    const updatedUser = { ...user, ...updateUserDto };
    const savedUser = await this.usersRepository.save(updatedUser);
    
    // Publish user updated event
    await this.eventsService.publishUserUpdated(savedUser);
    
    return savedUser;
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    
    // Publish user deleted event
    await this.eventsService.publishUserDeleted(id);
  }

  async verifyEmail(token: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    user.isVerified = true;
    user.verificationToken = null;
    
    const savedUser = await this.usersRepository.save(user);
    
    // Publish user verified event
    await this.eventsService.publishUserVerified(savedUser.id);
    
    return savedUser;
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists for security reasons
      return;
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token valid for 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetTokenExpiry;
    await this.usersRepository.save(user);

    // In a real app, you would send an email with the reset token here
  }

  async resetPassword(token: string, newPassword: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { passwordResetToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid reset token');
    }

    const now = new Date();
    if (user.passwordResetExpires < now) {
      throw new BadRequestException('Reset token has expired');
    }

    const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10);
    user.password = await hash(newPassword, saltRounds);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    
    const savedUser = await this.usersRepository.save(user);
    
    // Publish password reset event
    await this.eventsService.publishPasswordReset(savedUser.id);
    
    return savedUser;
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async addAdminRole(userId: string): Promise<User> {
    const user = await this.findOne(userId);
    
    if (user.roles.includes(UserRole.ADMIN)) {
      return user; // Already an admin
    }
    
    user.roles = [...user.roles, UserRole.ADMIN];
    const savedUser = await this.usersRepository.save(user);
    
    // Publish user updated event
    await this.eventsService.publishUserUpdated(savedUser);
    
    return savedUser;
  }

  async removeAdminRole(userId: string): Promise<User> {
    const user = await this.findOne(userId);
    
    if (!user.roles.includes(UserRole.ADMIN)) {
      return user; // Not an admin
    }
    
    user.roles = user.roles.filter(role => role !== UserRole.ADMIN);
    const savedUser = await this.usersRepository.save(user);
    
    // Publish user updated event
    await this.eventsService.publishUserUpdated(savedUser);
    
    return savedUser;
  }
} 