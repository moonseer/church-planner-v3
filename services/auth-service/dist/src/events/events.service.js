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
var EventsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = exports.AuthEvents = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
var AuthEvents;
(function (AuthEvents) {
    AuthEvents["USER_CREATED"] = "auth.user.created";
    AuthEvents["USER_UPDATED"] = "auth.user.updated";
    AuthEvents["USER_DELETED"] = "auth.user.deleted";
    AuthEvents["USER_VERIFIED"] = "auth.user.verified";
    AuthEvents["USER_PASSWORD_RESET"] = "auth.user.password_reset";
})(AuthEvents || (exports.AuthEvents = AuthEvents = {}));
let EventsService = EventsService_1 = class EventsService {
    constructor(natsClient) {
        this.natsClient = natsClient;
        this.logger = new common_1.Logger(EventsService_1.name);
        this.logger.log('EventsService constructor called');
    }
    async onModuleInit() {
        this.logger.log('EventsService initializing - attempting to connect to NATS');
        try {
            await this.natsClient.connect();
            this.logger.log('Successfully connected to NATS server');
        }
        catch (error) {
            this.logger.error('Failed to connect to NATS server', error);
        }
    }
    async publishUserCreated(user) {
        this.logger.log(`Attempting to publish ${AuthEvents.USER_CREATED} event for user ${user.id}`);
        const payload = this.sanitizeUser(user);
        try {
            await this.natsClient.emit(AuthEvents.USER_CREATED, payload);
            this.logger.log(`Published ${AuthEvents.USER_CREATED} event for user ${user.id}`);
        }
        catch (error) {
            this.logger.error(`Error publishing ${AuthEvents.USER_CREATED} event`, error);
        }
    }
    async publishUserUpdated(user) {
        this.logger.log(`Attempting to publish ${AuthEvents.USER_UPDATED} event for user ${user.id}`);
        const payload = this.sanitizeUser(user);
        try {
            await this.natsClient.emit(AuthEvents.USER_UPDATED, payload);
            this.logger.log(`Published ${AuthEvents.USER_UPDATED} event for user ${user.id}`);
        }
        catch (error) {
            this.logger.error(`Error publishing ${AuthEvents.USER_UPDATED} event`, error);
        }
    }
    async publishUserDeleted(userId) {
        this.logger.log(`Attempting to publish ${AuthEvents.USER_DELETED} event for user ${userId}`);
        try {
            await this.natsClient.emit(AuthEvents.USER_DELETED, { userId });
            this.logger.log(`Published ${AuthEvents.USER_DELETED} event for user ${userId}`);
        }
        catch (error) {
            this.logger.error(`Error publishing ${AuthEvents.USER_DELETED} event`, error);
        }
    }
    async publishUserVerified(userId) {
        this.logger.log(`Attempting to publish ${AuthEvents.USER_VERIFIED} event for user ${userId}`);
        try {
            await this.natsClient.emit(AuthEvents.USER_VERIFIED, { userId });
            this.logger.log(`Published ${AuthEvents.USER_VERIFIED} event for user ${userId}`);
        }
        catch (error) {
            this.logger.error(`Error publishing ${AuthEvents.USER_VERIFIED} event`, error);
        }
    }
    async publishPasswordReset(userId) {
        this.logger.log(`Attempting to publish ${AuthEvents.USER_PASSWORD_RESET} event for user ${userId}`);
        try {
            await this.natsClient.emit(AuthEvents.USER_PASSWORD_RESET, { userId });
            this.logger.log(`Published ${AuthEvents.USER_PASSWORD_RESET} event for user ${userId}`);
        }
        catch (error) {
            this.logger.error(`Error publishing ${AuthEvents.USER_PASSWORD_RESET} event`, error);
        }
    }
    sanitizeUser(user) {
        this.logger.log('Sanitizing user data for event payload');
        const { password, passwordResetToken, verificationToken, ...safeUser } = user;
        return safeUser;
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = EventsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('NATS_CLIENT')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy])
], EventsService);
//# sourceMappingURL=events.service.js.map