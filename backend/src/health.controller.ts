import { Controller, Get } from '@nestjs/common';
import { 
  HealthCheck, 
  HealthCheckService, 
  MongooseHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { RedisHealthIndicator } from './health/redis-health.indicator';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: MongooseHealthIndicator,
    private redis: RedisHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Check MongoDB connection
      () => this.db.pingCheck('database'),
      
      // Check Redis connection
      () => this.redis.isHealthy('redis'),
      
      // Check memory heap (should not exceed 150MB)
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      
      // Check memory RSS (should not exceed 300MB)
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
      
      // Check disk storage (should have at least 50GB free)
      () => this.disk.checkStorage('storage', { 
        threshold: 50 * 1024 * 1024 * 1024,
        path: '/' 
      }),
    ]);
  }

  @Get('simple')
  simple() {
    return { 
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Get('ready')
  @HealthCheck()
  ready() {
    // Readiness check - only critical services
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.redis.isHealthy('redis'),
    ]);
  }

  @Get('live')
  live() {
    // Liveness check - just check if process is alive
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
