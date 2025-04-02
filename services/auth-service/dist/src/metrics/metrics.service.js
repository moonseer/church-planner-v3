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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let MetricsService = class MetricsService {
    constructor(configService) {
        this.configService = configService;
        this.requestCount = 0;
        this.errorCount = 0;
        this.startTime = Date.now();
    }
    trackRequest() {
        this.requestCount++;
    }
    trackError() {
        this.errorCount++;
    }
    async getMetrics() {
        const uptime = Math.floor((Date.now() - this.startTime) / 1000);
        const memoryUsage = process.memoryUsage();
        return `
# HELP auth_service_uptime_seconds The uptime of the service in seconds
# TYPE auth_service_uptime_seconds gauge
auth_service_uptime_seconds ${uptime}

# HELP auth_service_requests_total The total number of HTTP requests
# TYPE auth_service_requests_total counter
auth_service_requests_total ${this.requestCount}

# HELP auth_service_errors_total The total number of HTTP errors
# TYPE auth_service_errors_total counter
auth_service_errors_total ${this.errorCount}

# HELP auth_service_memory_usage_bytes Memory usage statistics
# TYPE auth_service_memory_usage_bytes gauge
auth_service_memory_usage_bytes{type="rss"} ${memoryUsage.rss}
auth_service_memory_usage_bytes{type="heapTotal"} ${memoryUsage.heapTotal}
auth_service_memory_usage_bytes{type="heapUsed"} ${memoryUsage.heapUsed}
auth_service_memory_usage_bytes{type="external"} ${memoryUsage.external}
`;
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MetricsService);
//# sourceMappingURL=metrics.service.js.map