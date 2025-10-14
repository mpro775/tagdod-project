import { Injectable, Inject, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';
import { ConfigService } from '@nestjs/config';

export interface RateLimitConfig {
  keyPrefix: string;
  points: number; // Number of requests
  duration: number; // Per duration in seconds
  blockDuration?: number; // Block duration in seconds
  skipFailedRequests?: boolean;
  skipSuccessfulRequests?: boolean;
}

export interface RateLimitResult {
  remainingPoints: number;
  msBeforeNext: number;
  isBlocked: boolean;
  blockExpiresAt?: Date;
}

@Injectable()
export class RateLimitingService {
  private readonly logger = new Logger(RateLimitingService.name);
  private rateLimiters: Map<string, RateLimiterRedis | RateLimiterMemory> = new Map();
  private readonly redis: Redis;

  constructor(
    @Inject('REDIS_CLIENT') private redisClient: Redis,
    private configService: ConfigService,
  ) {
    this.redis = redisClient;
    this.initializeRateLimiters();
  }

  private initializeRateLimiters() {
    // General API rate limiter
    this.createRateLimiter('api', {
      keyPrefix: 'api',
      points: 1000, // 1000 requests
      duration: 60 * 15, // per 15 minutes
      blockDuration: 60 * 5, // block for 5 minutes
    });

    // Authentication endpoints
    this.createRateLimiter('auth', {
      keyPrefix: 'auth',
      points: 10, // 10 attempts
      duration: 60 * 15, // per 15 minutes
      blockDuration: 60 * 30, // block for 30 minutes
    });

    // Login attempts
    this.createRateLimiter('login', {
      keyPrefix: 'login',
      points: 5, // 5 attempts
      duration: 60 * 15, // per 15 minutes
      blockDuration: 60 * 60, // block for 1 hour
    });

    // Password reset
    this.createRateLimiter('password_reset', {
      keyPrefix: 'password_reset',
      points: 3, // 3 attempts
      duration: 60 * 60, // per hour
      blockDuration: 60 * 60 * 2, // block for 2 hours
    });

    // File upload
    this.createRateLimiter('upload', {
      keyPrefix: 'upload',
      points: 50, // 50 uploads
      duration: 60 * 60, // per hour
      blockDuration: 60 * 30, // block for 30 minutes
    });

    // Search endpoints
    this.createRateLimiter('search', {
      keyPrefix: 'search',
      points: 200, // 200 searches
      duration: 60 * 15, // per 15 minutes
    });

    // Admin endpoints
    this.createRateLimiter('admin', {
      keyPrefix: 'admin',
      points: 500, // 500 requests
      duration: 60 * 15, // per 15 minutes
      blockDuration: 60 * 10, // block for 10 minutes
    });

    // Analytics endpoints
    this.createRateLimiter('analytics', {
      keyPrefix: 'analytics',
      points: 100, // 100 requests
      duration: 60 * 30, // per 30 minutes
    });

    this.logger.log('Rate limiters initialized');
  }

  private createRateLimiter(name: string, config: RateLimitConfig) {
    try {
      const limiter = new RateLimiterRedis({
        storeClient: this.redis,
        keyPrefix: config.keyPrefix,
        points: config.points,
        duration: config.duration,
        blockDuration: config.blockDuration,
        inmemoryBlockOnConsumed: config.points,
        inmemoryBlockDuration: config.blockDuration,
        insuranceLimiter: new RateLimiterMemory({
          keyPrefix: config.keyPrefix,
          points: config.points,
          duration: config.duration,
          blockDuration: config.blockDuration,
        }),
      });

      this.rateLimiters.set(name, limiter);
      this.logger.log(`Rate limiter '${name}' created with ${config.points} points per ${config.duration}s`);
    } catch (error) {
      this.logger.error(`Failed to create rate limiter '${name}':`, error);
    }
  }

  /**
   * Check rate limit for a key
   */
  async checkLimit(
    limiterName: string,
    key: string,
    points: number = 1,
  ): Promise<RateLimitResult> {
    const limiter = this.rateLimiters.get(limiterName);
    if (!limiter) {
      this.logger.warn(`Rate limiter '${limiterName}' not found`);
      return {
        remainingPoints: 999,
        msBeforeNext: 0,
        isBlocked: false,
      };
    }

    try {
      const result = await limiter.consume(key, points);

      return {
        remainingPoints: result.remainingPoints,
        msBeforeNext: result.msBeforeNext,
        isBlocked: false,
      };
    } catch (rejRes) {
      if (rejRes instanceof Error) {
        // Unexpected error
        this.logger.error('Rate limiting error:', rejRes);
        return {
          remainingPoints: 0,
          msBeforeNext: 60000, // 1 minute fallback
          isBlocked: true,
        };
      }

      // Rate limit exceeded
      const msBeforeNext = rejRes.msBeforeNext;
      const blockExpiresAt = new Date(Date.now() + msBeforeNext);

      this.logger.warn(`Rate limit exceeded for key '${key}' on limiter '${limiterName}'`);

      return {
        remainingPoints: 0,
        msBeforeNext,
        isBlocked: true,
        blockExpiresAt,
      };
    }
  }

  /**
   * Get rate limit status for a key
   */
  async getLimitStatus(limiterName: string, key: string): Promise<RateLimitResult | null> {
    const limiter = this.rateLimiters.get(limiterName);
    if (!limiter) return null;

    try {
      const result = await limiter.get(key);
      if (!result) return null;

      return {
        remainingPoints: result.remainingPoints,
        msBeforeNext: result.msBeforeNext,
        isBlocked: result.blocked || false,
        blockExpiresAt: result.blocked ? new Date(Date.now() + result.msBeforeNext) : undefined,
      };
    } catch (error) {
      this.logger.error('Error getting rate limit status:', error);
      return null;
    }
  }

  /**
   * Reset rate limit for a key
   */
  async resetLimit(limiterName: string, key: string): Promise<boolean> {
    const limiter = this.rateLimiters.get(limiterName);
    if (!limiter) return false;

    try {
      await limiter.delete(key);
      this.logger.log(`Rate limit reset for key '${key}' on limiter '${limiterName}'`);
      return true;
    } catch (error) {
      this.logger.error('Error resetting rate limit:', error);
      return false;
    }
  }

  /**
   * Get all rate limiters status
   */
  async getAllLimitersStatus(): Promise<Record<string, any>> {
    const status: Record<string, any> = {};

    for (const [name, limiter] of this.rateLimiters) {
      try {
        const limiterStatus = await limiter.get('');
        status[name] = {
          active: true,
          points: (limiter as any).points,
          duration: (limiter as any).duration,
          blockDuration: (limiter as any).blockDuration,
          totalKeys: limiterStatus ? 1 : 0, // Simplified
        };
      } catch (error) {
        status[name] = {
          active: false,
          error: error.message,
        };
      }
    }

    return status;
  }

  /**
   * Clean up expired keys (maintenance)
   */
  async cleanup(): Promise<void> {
    try {
      // Redis TTL will automatically clean up expired keys
      // This is just for logging
      const status = await this.getAllLimitersStatus();
      this.logger.log('Rate limiting cleanup completed', { limiterCount: Object.keys(status).length });
    } catch (error) {
      this.logger.error('Rate limiting cleanup failed:', error);
    }
  }

  /**
   * Get rate limiting statistics
   */
  async getStatistics(): Promise<{
    totalLimiters: number;
    activeLimiters: number;
    redisConnected: boolean;
    uptime: number;
  }> {
    const status = await this.getAllLimitersStatus();
    const activeLimiters = Object.values(status).filter(s => s.active).length;

    return {
      totalLimiters: Object.keys(status).length,
      activeLimiters,
      redisConnected: this.redis.status === 'ready',
      uptime: process.uptime(),
    };
  }

  /**
   * Dynamic rate limiter creation
   */
  createDynamicLimiter(name: string, config: RateLimitConfig): void {
    if (this.rateLimiters.has(name)) {
      this.logger.warn(`Rate limiter '${name}' already exists`);
      return;
    }

    this.createRateLimiter(name, config);
  }

  /**
   * Remove rate limiter
   */
  removeLimiter(name: string): boolean {
    const removed = this.rateLimiters.delete(name);
    if (removed) {
      this.logger.log(`Rate limiter '${name}' removed`);
    }
    return removed;
  }
}
