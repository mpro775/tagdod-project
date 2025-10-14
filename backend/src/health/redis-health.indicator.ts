import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { Inject } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Ping Redis
      const result = await this.redis.ping();
      
      if (result === 'PONG') {
        return this.getStatus(key, true, {
          status: 'up',
          message: 'Redis is responsive',
        });
      }
      
      throw new Error('Redis ping failed');
    } catch (error) {
      throw new HealthCheckError(
        'Redis check failed',
        this.getStatus(key, false, {
          status: 'down',
          message: error.message,
        }),
      );
    }
  }
}

