import { UserRole } from '../enums/user-role.enum';
export declare class CreateUserDto {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    phoneNumber?: string;
    role?: UserRole;
}
