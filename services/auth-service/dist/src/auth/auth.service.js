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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const users_service_1 = require("../users/users.service");
const bcrypt = require("bcrypt");
const events_service_1 = require("../events/events.service");
let AuthService = class AuthService {
    constructor(usersService, jwtService, configService, eventsService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.eventsService = eventsService;
    }
    async validateUser(email, password) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            return null;
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return null;
        }
        const { password: _, ...result } = user;
        return result;
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.usersService.validateUser(email, password);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isVerified) {
            throw new common_1.UnauthorizedException('Email not verified');
        }
        const token = this.generateToken(user);
        const { password: _, ...result } = user;
        return {
            user: result,
            accessToken: token,
        };
    }
    async register(registerDto) {
        const user = await this.usersService.create(registerDto);
        const { password, ...result } = user;
        return result;
    }
    async verifyEmail(token) {
        return this.usersService.verifyEmail(token);
    }
    async requestPasswordReset(email) {
        await this.usersService.requestPasswordReset(email);
        return { message: 'If your email is registered, you will receive a password reset link' };
    }
    async resetPassword(token, newPassword) {
        if (!token || !newPassword) {
            throw new common_1.BadRequestException('Token and new password are required');
        }
        await this.usersService.resetPassword(token, newPassword);
        return { message: 'Password has been reset successfully' };
    }
    verifyToken(token) {
        try {
            const payload = this.jwtService.verify(token);
            return payload;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
    async refreshToken(userId) {
        const user = await this.usersService.findOne(userId);
        const token = this.generateToken(user);
        return {
            accessToken: token,
        };
    }
    generateToken(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            roles: user.roles,
        };
        return this.jwtService.sign(payload);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService,
        events_service_1.EventsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map