import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { EventsService } from '../events/events.service';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly configService;
    private readonly eventsService;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService, eventsService: EventsService);
    validateUser(email: string, password: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        profilePicture: string;
        roles: UserRole[];
        isVerified: boolean;
        verificationToken: string | null;
        passwordResetToken: string | null;
        passwordResetExpires: Date | null;
        isActive: boolean;
        metadata: Record<string, any>;
        createdAt: Date;
        updatedAt: Date;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phoneNumber: string;
            profilePicture: string;
            roles: UserRole[];
            isVerified: boolean;
            verificationToken: string | null;
            passwordResetToken: string | null;
            passwordResetExpires: Date | null;
            isActive: boolean;
            metadata: Record<string, any>;
            createdAt: Date;
            updatedAt: Date;
        };
        accessToken: string;
    }>;
    register(registerDto: RegisterDto): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        profilePicture: string;
        roles: UserRole[];
        isVerified: boolean;
        verificationToken: string | null;
        passwordResetToken: string | null;
        passwordResetExpires: Date | null;
        isActive: boolean;
        metadata: Record<string, any>;
        createdAt: Date;
        updatedAt: Date;
    }>;
    verifyEmail(token: string): Promise<User>;
    requestPasswordReset(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    verifyToken(token: string): any;
    refreshToken(userId: string): Promise<{
        accessToken: string;
    }>;
    private generateToken;
}
