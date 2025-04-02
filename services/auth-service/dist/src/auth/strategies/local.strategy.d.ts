import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
declare const LocalStrategy_base: new (...args: any[]) => Strategy;
export declare class LocalStrategy extends LocalStrategy_base {
    private authService;
    constructor(authService: AuthService);
    validate(email: string, password: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        profilePicture: string;
        roles: import("../../users/enums/user-role.enum").UserRole[];
        isVerified: boolean;
        verificationToken: string | null;
        passwordResetToken: string | null;
        passwordResetExpires: Date | null;
        isActive: boolean;
        metadata: Record<string, any>;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export {};
