import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConfigService } from '@nestjs/config';
import { EventsService } from '../events/events.service';
export declare class UsersService {
    private readonly usersRepository;
    private readonly configService;
    private readonly eventsService;
    private readonly logger;
    constructor(usersRepository: Repository<User>, configService: ConfigService, eventsService: EventsService);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    remove(id: string): Promise<void>;
    verifyEmail(token: string): Promise<User>;
    requestPasswordReset(email: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<User>;
    validateUser(email: string, password: string): Promise<User | null>;
    addAdminRole(userId: string): Promise<User>;
    removeAdminRole(userId: string): Promise<User>;
}
