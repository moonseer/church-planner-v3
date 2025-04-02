import { OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { User } from '../users/entities/user.entity';
export declare enum AuthEvents {
    USER_CREATED = "auth.user.created",
    USER_UPDATED = "auth.user.updated",
    USER_DELETED = "auth.user.deleted",
    USER_VERIFIED = "auth.user.verified",
    USER_PASSWORD_RESET = "auth.user.password_reset"
}
export declare class EventsService implements OnModuleInit {
    private natsClient;
    private readonly logger;
    constructor(natsClient: ClientProxy);
    onModuleInit(): Promise<void>;
    publishUserCreated(user: Partial<User>): Promise<void>;
    publishUserUpdated(user: Partial<User>): Promise<void>;
    publishUserDeleted(userId: string): Promise<void>;
    publishUserVerified(userId: string): Promise<void>;
    publishPasswordReset(userId: string): Promise<void>;
    private sanitizeUser;
}
