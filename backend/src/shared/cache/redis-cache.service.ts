import { Injectable, Logger, Inject, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

export interface CachedResponse {
  status: number;
  body: unknown;
  timestamp: number;
}

@Injectable()
export class RedisCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheService.name);
  private readonly IDEMPOTENCY_PREFIX = 'idempotency:';
  private readonly DEFAULT_TTL = 3600; // 1 hour

  constructor(@Inject('REDIS_CLIENT') private readonly redisService: Redis) {}

  async onModuleInit() {
    try {
      if (!(this.redisService as any).status || (this.redisService as any).status === 'wait') {
        await this.redisService.connect();
      }
      const pong = await this.redisService.ping();
      this.logger.log(`Redis PING: ${pong}`);
    } catch (error) {
      this.logger.error('Failed to connect to Redis on init:', error as Error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.redisService.quit();
    } catch {
      await this.redisService.disconnect();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redisService.get(`${this.IDEMPOTENCY_PREFIX}${key}`);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Failed to get key ${key}:`, error as Error);
      return null;
    }
  }

  async set(
    key: string,
    value: CachedResponse,
    ttlSeconds: number = this.DEFAULT_TTL,
  ): Promise<void> {
    try {
      await this.redisService.setex(
        `${this.IDEMPOTENCY_PREFIX}${key}`,
        ttlSeconds,
        JSON.stringify(value),
      );
    } catch (error) {
      this.logger.error(`Failed to set key ${key}:`, error as Error);
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      const exists = await this.redisService.exists(`${this.IDEMPOTENCY_PREFIX}${key}`);
      return exists === 1;
    } catch (error) {
      this.logger.error(`Failed to check key ${key}:`, error as Error);
      return false;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redisService.del(`${this.IDEMPOTENCY_PREFIX}${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete key ${key}:`, error as Error);
    }
  }

  async clearExpired(): Promise<void> {
    try {
      const keys = await this.redisService.keys(`${this.IDEMPOTENCY_PREFIX}*`);
      for (const key of keys) {
        const ttl = await this.redisService.ttl(key);
        if (ttl === -1) {
          await this.redisService.expire(key, this.DEFAULT_TTL);
        }
      }
    } catch (error) {
      this.logger.error('Failed to clear expired keys:', error as Error);
    }
  }
}
