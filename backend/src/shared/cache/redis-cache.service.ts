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
  private isReadOnly = false;

  constructor(@Inject('REDIS_CLIENT') private readonly redisService: Redis) {}

  async onModuleInit() {
    try {
      if (!this.redisService.status || this.redisService.status === 'wait') {
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
    if (this.isReadOnly) {
      this.logger.debug(`Skipping idempotency cache write for key ${key} - Redis is in read-only mode`);
      return;
    }

    try {
      await this.redisService.setex(
        `${this.IDEMPOTENCY_PREFIX}${key}`,
        ttlSeconds,
        JSON.stringify(value),
      );
      this.isReadOnly = false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (this.isReadOnlyError(errorMessage)) {
        this.isReadOnly = true;
        this.logger.warn(`Failed to set key ${key}: Redis is in read-only mode`);
        return;
      }
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
    if (this.isReadOnly) {
      this.logger.debug(`Skipping idempotency cache delete for key ${key} - Redis is in read-only mode`);
      return;
    }

    try {
      await this.redisService.del(`${this.IDEMPOTENCY_PREFIX}${key}`);
      this.isReadOnly = false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (this.isReadOnlyError(errorMessage)) {
        this.isReadOnly = true;
        this.logger.warn(`Failed to delete key ${key}: Redis is in read-only mode`);
        return;
      }
      this.logger.error(`Failed to delete key ${key}:`, error as Error);
    }
  }

  async clearExpired(): Promise<void> {
    if (this.isReadOnly) {
      this.logger.debug('Skipping clear expired - Redis is in read-only mode');
      return;
    }

    try {
      const keys = await this.redisService.keys(`${this.IDEMPOTENCY_PREFIX}*`);
      for (const key of keys) {
        const ttl = await this.redisService.ttl(key);
        if (ttl === -1) {
          await this.redisService.expire(key, this.DEFAULT_TTL);
        }
      }
      this.isReadOnly = false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (this.isReadOnlyError(errorMessage)) {
        this.isReadOnly = true;
        this.logger.warn('Failed to clear expired keys: Redis is in read-only mode');
        return;
      }
      this.logger.error('Failed to clear expired keys:', error as Error);
    }
  }

  /**
   * Check if error is a READONLY error
   */
  private isReadOnlyError(error: string | Error): boolean {
    const message = error instanceof Error ? error.message : String(error);
    return /READONLY/i.test(message) || /read only/i.test(message);
  }
}
