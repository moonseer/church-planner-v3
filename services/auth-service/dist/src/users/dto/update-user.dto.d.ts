import { UserRole } from '../enums/user-role.enum';
export declare class UpdateUserDto {
    email?: string;
    firstName?: string;
    lastName?: string;
    password?: string;
    phoneNumber?: string;
    profilePicture?: string;
    role?: UserRole;
    isActive?: boolean;
}
