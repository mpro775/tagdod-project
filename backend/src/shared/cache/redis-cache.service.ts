import { Injectable, Logger, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';

export interface CachedResponse {
  status: number;
  body: unknown;
  timestamp: number;
}

@Injectable()
export class RedisCacheService {
  private readonly logger = new Logger(RedisCacheService.name);
  private readonly IDEMPOTENCY_PREFIX = 'idempotency:';
  private readonly DEFAULT_TTL = 3600; // 1 hour

  constructor(@Inject('REDIS_CLIENT') private readonly redisService: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redisService.get(`${this.IDEMPOTENCY_PREFIX}${key}`);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Failed to get key ${key}:`, error);
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
      this.logger.error(`Failed to set key ${key}:`, error);
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      const exists = await this.redisService.exists(`${this.IDEMPOTENCY_PREFIX}${key}`);
      return exists === 1;
    } catch (error) {
      this.logger.error(`Failed to check key ${key}:`, error);
      return false;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redisService.del(`${this.IDEMPOTENCY_PREFIX}${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete key ${key}:`, error);
    }
  }

  async clearExpired(): Promise<void> {
    try {
      const keys = await this.redisService.keys(`${this.IDEMPOTENCY_PREFIX}*`);

      for (const key of keys) {
        const ttl = await this.redisService.ttl(key);
        if (ttl === -1) {
          // Key exists but has no expiration
          await this.redisService.expire(key, this.DEFAULT_TTL);
        }
      }
    } catch (error) {
      this.logger.error('Failed to clear expired keys:', error);
    }
  }
}
