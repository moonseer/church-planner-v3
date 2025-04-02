import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MetricsService {
  private startTime: number;
  private requestCount: number = 0;
  private errorCount: number = 0;

  constructor(private configService: ConfigService) {
    this.startTime = Date.now();
  }

  // Track a new request
  trackRequest() {
    this.requestCount++;
  }

  // Track an error
  trackError() {
    this.errorCount++;
  }

  // Get all metrics in Prometheus format
  async getMetrics() {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    const memoryUsage = process.memoryUsage();

    // Return metrics in Prometheus format
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
} 