import { UserRole } from '../enums/user-role.enum';
export declare class User {
    id: string;
    email: string;
    password: string;
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
    hashPassword(): Promise<void>;
    comparePassword(attempt: string): Promise<boolean>;
    get fullName(): string;
}
