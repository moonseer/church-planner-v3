import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        profilePicture: string;
        roles: import("../users/enums/user-role.enum").UserRole[];
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
            roles: import("../users/enums/user-role.enum").UserRole[];
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
    getProfile(user: any): Promise<any>;
    verifyEmail(token: string): Promise<import("../users/entities/user.entity").User>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    refreshToken(user: any): Promise<{
        accessToken: string;
    }>;
}
