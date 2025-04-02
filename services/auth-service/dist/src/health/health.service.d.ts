import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
export declare class HealthService {
    private configService;
    private usersRepository;
    constructor(configService: ConfigService, usersRepository: Repository<User>);
    getHealth(): Promise<{
        status: string;
        timestamp: string;
        service: string;
        version: string;
    }>;
    getReadiness(): Promise<{
        status: string;
        timestamp: string;
        checks: {
            database: string;
        };
        error?: undefined;
    } | {
        status: string;
        timestamp: string;
        checks: {
            database: string;
        };
        error: any;
    }>;
    getLiveness(): Promise<{
        status: string;
        timestamp: string;
        uptime: number;
        memory: {
            rss: string;
            heapTotal: string;
            heapUsed: string;
        };
    }>;
}
