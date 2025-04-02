import { ConfigService } from '@nestjs/config';
export declare class MetricsService {
    private configService;
    private startTime;
    private requestCount;
    private errorCount;
    constructor(configService: ConfigService);
    trackRequest(): void;
    trackError(): void;
    getMetrics(): Promise<string>;
}
