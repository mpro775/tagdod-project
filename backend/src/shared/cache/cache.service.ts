import { Injectable, Logger, Inject, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string; // Key prefix
  compress?: boolean; // Enable compression
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  hitRate: number;
  uptime: number;
  memoryUsed: number;
  connectedClients: number;
}

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly redis: Redis;
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
  };

  constructor(
    @Inject('REDIS_CLIENT') private redisClient: Redis,
    private configService: ConfigService,
  ) {
    this.redis = redisClient;
  }

  async onModuleInit() {
    this.logger.log('Cache service initialized');
    this.setupEventHandlers();
  }

  async onModuleDestroy() {
    await this.redis.quit();
    this.logger.log('Cache service destroyed');
  }

  private setupEventHandlers() {
    this.redis.on('connect', () => {
      this.logger.log('Connected to Redis');
    });

    this.redis.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
    });

    this.redis.on('ready', () => {
      this.logger.log('Redis is ready');
    });
  }

  /**
   * Generate cache key with prefix
   */
  private generateKey(key: string, prefix?: string): string {
    const keyPrefix = prefix || this.configService.get('CACHE_PREFIX', 'solar:');
    return `${keyPrefix}${key}`;
  }

  /**
   * Serialize value for storage
   */
  private serialize(value: any): string {
    return JSON.stringify(value);
  }

  /**
   * Deserialize value from storage
   */
  private deserialize(value: string): any {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  /**
   * Set cache value
   */
  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    const cacheKey = this.generateKey(key, options.prefix);
    const serializedValue = this.serialize(value);
    const ttl = options.ttl || this.configService.get('CACHE_TTL', 3600);

    try {
      if (ttl > 0) {
        await this.redis.setex(cacheKey, ttl, serializedValue);
      } else {
        await this.redis.set(cacheKey, serializedValue);
      }
      this.stats.sets++;
    } catch (error) {
      this.logger.error(`Failed to set cache key ${cacheKey}:`, error);
      throw error;
    }
  }

  /**
   * Get cache value
   */
  async get<T = any>(key: string, prefix?: string): Promise<T | null> {
    const cacheKey = this.generateKey(key, prefix);

    try {
      const value = await this.redis.get(cacheKey);
      if (value === null) {
        this.stats.misses++;
        return null;
      }

      this.stats.hits++;
      return this.deserialize(value);
    } catch (error) {
      this.logger.error(`Failed to get cache key ${cacheKey}:`, error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Delete cache key
   */
  async delete(key: string, prefix?: string): Promise<boolean> {
    const cacheKey = this.generateKey(key, prefix);

    try {
      const result = await this.redis.del(cacheKey);
      this.stats.deletes++;
      return result > 0;
    } catch (error) {
      this.logger.error(`Failed to delete cache key ${cacheKey}:`, error);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string, prefix?: string): Promise<boolean> {
    const cacheKey = this.generateKey(key, prefix);

    try {
      const result = await this.redis.exists(cacheKey);
      return result > 0;
    } catch (error) {
      this.logger.error(`Failed to check existence of cache key ${cacheKey}:`, error);
      return false;
    }
  }

  /**
   * Set multiple cache values
   */
  async mset(keyValuePairs: Record<string, any>, options: CacheOptions = {}): Promise<void> {
    const pipeline = this.redis.pipeline();

    for (const [key, value] of Object.entries(keyValuePairs)) {
      const cacheKey = this.generateKey(key, options.prefix);
      const serializedValue = this.serialize(value);
      const ttl = options.ttl || this.configService.get('CACHE_TTL', 3600);

      if (ttl > 0) {
        pipeline.setex(cacheKey, ttl, serializedValue);
      } else {
        pipeline.set(cacheKey, serializedValue);
      }
    }

    try {
      await pipeline.exec();
      this.stats.sets += Object.keys(keyValuePairs).length;
    } catch (error) {
      this.logger.error('Failed to set multiple cache keys:', error);
      throw error;
    }
  }

  /**
   * Get multiple cache values
   */
  async mget<T = any>(keys: string[], prefix?: string): Promise<(T | null)[]> {
    const cacheKeys = keys.map(key => this.generateKey(key, prefix));

    try {
      const values = await this.redis.mget(...cacheKeys);
      const results = values.map(value => {
        if (value === null) {
          this.stats.misses++;
          return null;
        }
        this.stats.hits++;
        return this.deserialize(value);
      });
      return results;
    } catch (error) {
      this.logger.error('Failed to get multiple cache keys:', error);
      this.stats.misses += keys.length;
      return new Array(keys.length).fill(null);
    }
  }

  /**
   * Delete multiple cache keys
   */
  async mdelete(keys: string[], prefix?: string): Promise<number> {
    const cacheKeys = keys.map(key => this.generateKey(key, prefix));

    try {
      const result = await this.redis.del(...cacheKeys);
      this.stats.deletes += keys.length;
      return result;
    } catch (error) {
      this.logger.error('Failed to delete multiple cache keys:', error);
      return 0;
    }
  }

  /**
   * Set cache value with hash
   */
  async hset(hash: string, field: string, value: any, options: CacheOptions = {}): Promise<void> {
    const cacheKey = this.generateKey(hash, options.prefix);
    const serializedValue = this.serialize(value);

    try {
      await this.redis.hset(cacheKey, field, serializedValue);
      if (options.ttl) {
        await this.redis.expire(cacheKey, options.ttl);
      }
      this.stats.sets++;
    } catch (error) {
      this.logger.error(`Failed to set hash field ${cacheKey}:${field}:`, error);
      throw error;
    }
  }

  /**
   * Get hash field value
   */
  async hget<T = any>(hash: string, field: string, prefix?: string): Promise<T | null> {
    const cacheKey = this.generateKey(hash, prefix);

    try {
      const value = await this.redis.hget(cacheKey, field);
      if (value === null) {
        this.stats.misses++;
        return null;
      }

      this.stats.hits++;
      return this.deserialize(value);
    } catch (error) {
      this.logger.error(`Failed to get hash field ${cacheKey}:${field}:`, error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Get all hash fields
   */
  async hgetall<T = any>(hash: string, prefix?: string): Promise<Record<string, T> | null> {
    const cacheKey = this.generateKey(hash, prefix);

    try {
      const result = await this.redis.hgetall(cacheKey);
      if (Object.keys(result).length === 0) {
        this.stats.misses++;
        return null;
      }

      this.stats.hits++;
      const deserialized: Record<string, T> = {};
      for (const [field, value] of Object.entries(result)) {
        deserialized[field] = this.deserialize(value);
      }
      return deserialized;
    } catch (error) {
      this.logger.error(`Failed to get hash ${cacheKey}:`, error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Delete hash field
   */
  async hdel(hash: string, field: string, prefix?: string): Promise<boolean> {
    const cacheKey = this.generateKey(hash, prefix);

    try {
      const result = await this.redis.hdel(cacheKey, field);
      this.stats.deletes++;
      return result > 0;
    } catch (error) {
      this.logger.error(`Failed to delete hash field ${cacheKey}:${field}:`, error);
      return false;
    }
  }

  /**
   * Set expiration time for key
   */
  async expire(key: string, ttl: number, prefix?: string): Promise<boolean> {
    const cacheKey = this.generateKey(key, prefix);

    try {
      const result = await this.redis.expire(cacheKey, ttl);
      return result > 0;
    } catch (error) {
      this.logger.error(`Failed to set expiration for key ${cacheKey}:`, error);
      return false;
    }
  }

  /**
   * Get time to live for key
   */
  async ttl(key: string, prefix?: string): Promise<number> {
    const cacheKey = this.generateKey(key, prefix);

    try {
      return await this.redis.ttl(cacheKey);
    } catch (error) {
      this.logger.error(`Failed to get TTL for key ${cacheKey}:`, error);
      return -1;
    }
  }

  /**
   * Clear all cache keys with prefix
   */
  async clear(prefix?: string): Promise<void> {
    const pattern = this.generateKey('*', prefix);

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.stats.deletes += keys.length;
        this.logger.log(`Cleared ${keys.length} cache keys with prefix ${prefix}`);
      }
    } catch (error) {
      this.logger.error(`Failed to clear cache with prefix ${prefix}:`, error);
      throw error;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    try {
      const info = await this.redis.info();
      const memoryMatch = info.match(/used_memory:(\d+)/);
      const clientsMatch = info.match(/connected_clients:(\d+)/);

      const total = this.stats.hits + this.stats.misses;
      const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

      return {
        hits: this.stats.hits,
        misses: this.stats.misses,
        sets: this.stats.sets,
        deletes: this.stats.deletes,
        hitRate,
        uptime: process.uptime(),
        memoryUsed: memoryMatch ? parseInt(memoryMatch[1]) : 0,
        connectedClients: clientsMatch ? parseInt(clientsMatch[1]) : 0,
      };
    } catch (error) {
      this.logger.error('Failed to get cache stats:', error);
      return {
        hits: this.stats.hits,
        misses: this.stats.misses,
        sets: this.stats.sets,
        deletes: this.stats.deletes,
        hitRate: 0,
        uptime: process.uptime(),
        memoryUsed: 0,
        connectedClients: 0,
      };
    }
  }

  /**
   * Reset cache statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
    };
    this.logger.log('Cache statistics reset');
  }

  /**
   * Check Redis connection health
   */
  async ping(): Promise<boolean> {
    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }

  /**
   * Get Redis client for advanced operations
   */
  getClient(): Redis {
    return this.redis;
  }

  /**
   * Cache HTTP response
   */
  async cacheResponse(key: string, response: any, ttl?: number): Promise<void> {
    const cacheKey = `response:${key}`;
    const finalTtl = ttl || parseInt(process.env.CACHE_TTL || '3600');

    await this.set(cacheKey, response, { ttl: finalTtl });
  }

  /**
   * Get cached HTTP response
   */
  async getCachedResponse(key: string): Promise<any | null> {
    const cacheKey = `response:${key}`;
    return this.get(cacheKey);
  }

  /**
   * Clear all response caches
   */
  async clearResponseCaches(): Promise<void> {
    await this.clear('response:*');
    this.logger.log('Cleared all response caches');
  }

  /**
   * Clear response cache by pattern
   */
  async clearResponseCachePattern(pattern: string): Promise<void> {
    await this.clear(`response:${pattern}`);
    this.logger.log(`Cleared response caches with pattern: ${pattern}`);
  }
}
