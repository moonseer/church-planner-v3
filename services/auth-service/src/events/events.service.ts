import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { User } from '../users/entities/user.entity';

export enum AuthEvents {
  USER_CREATED = 'auth.user.created',
  USER_UPDATED = 'auth.user.updated',
  USER_DELETED = 'auth.user.deleted',
  USER_VERIFIED = 'auth.user.verified',
  USER_PASSWORD_RESET = 'auth.user.password_reset',
}

@Injectable()
export class EventsService implements OnModuleInit {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @Inject('NATS_CLIENT') private natsClient: ClientProxy,
  ) {
    this.logger.log('EventsService constructor called');
  }

  async onModuleInit() {
    this.logger.log('EventsService initializing - attempting to connect to NATS');
    try {
      await this.natsClient.connect();
      this.logger.log('Successfully connected to NATS server');
    } catch (error) {
      this.logger.error('Failed to connect to NATS server', error);
    }
  }

  async publishUserCreated(user: Partial<User>) {
    this.logger.log(`Attempting to publish ${AuthEvents.USER_CREATED} event for user ${user.id}`);
    const payload = this.sanitizeUser(user);
    
    try {
      await this.natsClient.emit(AuthEvents.USER_CREATED, payload);
      this.logger.log(`Published ${AuthEvents.USER_CREATED} event for user ${user.id}`);
    } catch (error) {
      this.logger.error(`Error publishing ${AuthEvents.USER_CREATED} event`, error);
    }
  }

  async publishUserUpdated(user: Partial<User>) {
    this.logger.log(`Attempting to publish ${AuthEvents.USER_UPDATED} event for user ${user.id}`);
    const payload = this.sanitizeUser(user);
    
    try {
      await this.natsClient.emit(AuthEvents.USER_UPDATED, payload);
      this.logger.log(`Published ${AuthEvents.USER_UPDATED} event for user ${user.id}`);
    } catch (error) {
      this.logger.error(`Error publishing ${AuthEvents.USER_UPDATED} event`, error);
    }
  }

  async publishUserDeleted(userId: string) {
    this.logger.log(`Attempting to publish ${AuthEvents.USER_DELETED} event for user ${userId}`);
    try {
      await this.natsClient.emit(AuthEvents.USER_DELETED, { userId });
      this.logger.log(`Published ${AuthEvents.USER_DELETED} event for user ${userId}`);
    } catch (error) {
      this.logger.error(`Error publishing ${AuthEvents.USER_DELETED} event`, error);
    }
  }

  async publishUserVerified(userId: string) {
    this.logger.log(`Attempting to publish ${AuthEvents.USER_VERIFIED} event for user ${userId}`);
    try {
      await this.natsClient.emit(AuthEvents.USER_VERIFIED, { userId });
      this.logger.log(`Published ${AuthEvents.USER_VERIFIED} event for user ${userId}`);
    } catch (error) {
      this.logger.error(`Error publishing ${AuthEvents.USER_VERIFIED} event`, error);
    }
  }

  async publishPasswordReset(userId: string) {
    this.logger.log(`Attempting to publish ${AuthEvents.USER_PASSWORD_RESET} event for user ${userId}`);
    try {
      await this.natsClient.emit(AuthEvents.USER_PASSWORD_RESET, { userId });
      this.logger.log(`Published ${AuthEvents.USER_PASSWORD_RESET} event for user ${userId}`);
    } catch (error) {
      this.logger.error(`Error publishing ${AuthEvents.USER_PASSWORD_RESET} event`, error);
    }
  }

  private sanitizeUser(user: Partial<User>) {
    this.logger.log('Sanitizing user data for event payload');
    // Remove sensitive information before sending over the message bus
    const { password, passwordResetToken, verificationToken, ...safeUser } = user;
    return safeUser;
  }
} 