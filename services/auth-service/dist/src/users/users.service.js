"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const user_role_enum_1 = require("./enums/user-role.enum");
const uuid_1 = require("uuid");
const bcrypt_1 = require("bcrypt");
const config_1 = require("@nestjs/config");
const events_service_1 = require("../events/events.service");
let UsersService = UsersService_1 = class UsersService {
    constructor(usersRepository, configService, eventsService) {
        this.usersRepository = usersRepository;
        this.configService = configService;
        this.eventsService = eventsService;
        this.logger = new common_1.Logger(UsersService_1.name);
        this.logger.log('UsersService constructor called, EventsService injected');
    }
    async create(createUserDto) {
        this.logger.log('Creating user and will publish event afterward');
        const { email, password } = createUserDto;
        const userExists = await this.usersRepository.findOne({
            where: { email },
        });
        if (userExists) {
            throw new common_1.ConflictException('Email already registered');
        }
        const saltRounds = this.configService.get('BCRYPT_SALT_ROUNDS', 10);
        const hashedPassword = await (0, bcrypt_1.hash)(password, saltRounds);
        const verificationToken = (0, uuid_1.v4)();
        const user = this.usersRepository.create({
            ...createUserDto,
            password: hashedPassword,
            verificationToken,
            isVerified: false,
        });
        const savedUser = await this.usersRepository.save(user);
        this.logger.log(`User created with ID ${savedUser.id}, attempting to publish event`);
        try {
            await this.eventsService.publishUserCreated(savedUser);
            this.logger.log('Successfully called publishUserCreated method');
        }
        catch (error) {
            this.logger.error('Error calling publishUserCreated method', error);
        }
        return savedUser;
    }
    async findAll() {
        return this.usersRepository.find();
    }
    async findOne(id) {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID "${id}" not found`);
        }
        return user;
    }
    async findByEmail(email) {
        return this.usersRepository.findOne({ where: { email } });
    }
    async update(id, updateUserDto) {
        const user = await this.findOne(id);
        if (updateUserDto.password) {
            const saltRounds = this.configService.get('BCRYPT_SALT_ROUNDS', 10);
            updateUserDto.password = await (0, bcrypt_1.hash)(updateUserDto.password, saltRounds);
        }
        const updatedUser = { ...user, ...updateUserDto };
        const savedUser = await this.usersRepository.save(updatedUser);
        await this.eventsService.publishUserUpdated(savedUser);
        return savedUser;
    }
    async remove(id) {
        const result = await this.usersRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`User with ID "${id}" not found`);
        }
        await this.eventsService.publishUserDeleted(id);
    }
    async verifyEmail(token) {
        const user = await this.usersRepository.findOne({
            where: { verificationToken: token },
        });
        if (!user) {
            throw new common_1.BadRequestException('Invalid verification token');
        }
        user.isVerified = true;
        user.verificationToken = null;
        const savedUser = await this.usersRepository.save(user);
        await this.eventsService.publishUserVerified(savedUser.id);
        return savedUser;
    }
    async requestPasswordReset(email) {
        const user = await this.findByEmail(email);
        if (!user) {
            return;
        }
        const resetToken = (0, uuid_1.v4)();
        const resetTokenExpiry = new Date();
        resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1);
        user.passwordResetToken = resetToken;
        user.passwordResetExpires = resetTokenExpiry;
        await this.usersRepository.save(user);
    }
    async resetPassword(token, newPassword) {
        const user = await this.usersRepository.findOne({
            where: { passwordResetToken: token },
        });
        if (!user) {
            throw new common_1.BadRequestException('Invalid reset token');
        }
        const now = new Date();
        if (user.passwordResetExpires < now) {
            throw new common_1.BadRequestException('Reset token has expired');
        }
        const saltRounds = this.configService.get('BCRYPT_SALT_ROUNDS', 10);
        user.password = await (0, bcrypt_1.hash)(newPassword, saltRounds);
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        const savedUser = await this.usersRepository.save(user);
        await this.eventsService.publishPasswordReset(savedUser.id);
        return savedUser;
    }
    async validateUser(email, password) {
        const user = await this.findByEmail(email);
        if (!user) {
            return null;
        }
        const isPasswordValid = await (0, bcrypt_1.compare)(password, user.password);
        if (!isPasswordValid) {
            return null;
        }
        return user;
    }
    async addAdminRole(userId) {
        const user = await this.findOne(userId);
        if (user.roles.includes(user_role_enum_1.UserRole.ADMIN)) {
            return user;
        }
        user.roles = [...user.roles, user_role_enum_1.UserRole.ADMIN];
        const savedUser = await this.usersRepository.save(user);
        await this.eventsService.publishUserUpdated(savedUser);
        return savedUser;
    }
    async removeAdminRole(userId) {
        const user = await this.findOne(userId);
        if (!user.roles.includes(user_role_enum_1.UserRole.ADMIN)) {
            return user;
        }
        user.roles = user.roles.filter(role => role !== user_role_enum_1.UserRole.ADMIN);
        const savedUser = await this.usersRepository.save(user);
        await this.eventsService.publishUserUpdated(savedUser);
        return savedUser;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService,
        events_service_1.EventsService])
], UsersService);
//# sourceMappingURL=users.service.js.map