import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../../../shared/cache/cache.service';

@Injectable()
export class AnalyticsCacheService {
  private readonly logger = new Logger(AnalyticsCacheService.name);
  private readonly CACHE_TTL = {
    DASHBOARD_DATA: 300, // 5 minutes
    ANALYTICS_DATA: 600, // 10 minutes
    PERFORMANCE_METRICS: 180, // 3 minutes
    REPORT_DATA: 3600, // 1 hour
    USER_ANALYTICS: 900, // 15 minutes
    PRODUCT_ANALYTICS: 900, // 15 minutes
    ORDER_ANALYTICS: 300, // 5 minutes
    SERVICE_ANALYTICS: 600, // 10 minutes
    SUPPORT_ANALYTICS: 600, // 10 minutes
  };

  constructor(private readonly cacheService: CacheService) {}

  /**
   * Generate cache key for analytics data
   */
  private generateCacheKey(type: string, params: Record<string, unknown>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}:${params[key]}`)
      .join('|');
    return `analytics:${type}:${sortedParams}`;
  }

  /**
   * Get cached analytics data
   */
  async getCachedData<T>(type: string, params: Record<string, unknown>): Promise<T | null> {
    try {
      const cacheKey = this.generateCacheKey(type, params);
      const cached = await this.cacheService.get<T>(cacheKey);

      if (cached) {
        this.logger.debug(`Cache hit for ${type}: ${cacheKey}`);
        return cached;
      }

      return null;
    } catch (error) {
      this.logger.error(`Error getting cached data for ${type}:`, error);
      return null;
    }
  }

  /**
   * Set cached analytics data
   */
  async setCachedData<T>(
    type: string,
    params: Record<string, unknown>,
    data: T,
    ttl?: number,
  ): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey(type, params);
      const cacheTtl =
        ttl || this.CACHE_TTL[type as keyof typeof this.CACHE_TTL] || this.CACHE_TTL.ANALYTICS_DATA;

      await this.cacheService.set(cacheKey, data, { ttl: cacheTtl });
      this.logger.debug(`Cache set for ${type}: ${cacheKey} (TTL: ${cacheTtl}s)`);
    } catch (error) {
      this.logger.error(`Error setting cached data for ${type}:`, error);
    }
  }

  /**
   * Get cached dashboard data
   */
  async getCachedDashboardData(params: Record<string, unknown>): Promise<unknown | null> {
    return this.getCachedData('DASHBOARD_DATA', params);
  }

  /**
   * Set cached dashboard data
   */
  async setCachedDashboardData(params: Record<string, unknown>, data: unknown): Promise<void> {
    return this.setCachedData('DASHBOARD_DATA', params, data);
  }

  /**
   * Get cached user analytics
   */
  async getCachedUserAnalytics(params: Record<string, unknown>): Promise<unknown | null> {
    return this.getCachedData('USER_ANALYTICS', params);
  }

  /**
   * Set cached user analytics
   */
  async setCachedUserAnalytics(params: Record<string, unknown>, data: unknown): Promise<void> {
    return this.setCachedData('USER_ANALYTICS', params, data);
  }

  /**
   * Get cached product analytics
   */
  async getCachedProductAnalytics(params: Record<string, unknown>): Promise<unknown | null> {
    return this.getCachedData('PRODUCT_ANALYTICS', params);
  }

  /**
   * Set cached product analytics
   */
  async setCachedProductAnalytics(params: Record<string, unknown>, data: unknown): Promise<void> {
    return this.setCachedData('PRODUCT_ANALYTICS', params, data);
  }

  /**
   * Get cached order analytics
   */
  async getCachedOrderAnalytics(params: Record<string, unknown>): Promise<unknown | null> {
    return this.getCachedData('ORDER_ANALYTICS', params);
  }

  /**
   * Set cached order analytics
   */
  async setCachedOrderAnalytics(params: Record<string, unknown>, data: unknown): Promise<void> {
    return this.setCachedData('ORDER_ANALYTICS', params, data);
  }

  /**
   * Get cached service analytics
   */
  async getCachedServiceAnalytics(params: Record<string, unknown>): Promise<unknown | null> {
    return this.getCachedData('SERVICE_ANALYTICS', params);
  }

  /**
   * Set cached service analytics
   */
  async setCachedServiceAnalytics(params: Record<string, unknown>, data: unknown): Promise<void> {
    return this.setCachedData('SERVICE_ANALYTICS', params, data);
  }

  /**
   * Get cached support analytics
   */
  async getCachedSupportAnalytics(params: Record<string, unknown>): Promise<unknown | null> {
    return this.getCachedData('SUPPORT_ANALYTICS', params);
  }

  /**
   * Set cached support analytics
   */
  async setCachedSupportAnalytics(params: Record<string, unknown>, data: unknown): Promise<void> {
    return this.setCachedData('SUPPORT_ANALYTICS', params, data);
  }

  /**
   * Get cached performance metrics
   */
  async getCachedPerformanceMetrics(params: Record<string, unknown>): Promise<unknown | null> {
    return this.getCachedData('PERFORMANCE_METRICS', params);
  }

  /**
   * Set cached performance metrics
   */
  async setCachedPerformanceMetrics(params: Record<string, unknown>, data: unknown): Promise<void> {
    return this.setCachedData('PERFORMANCE_METRICS', params, data);
  }

  /**
   * Clear cache for specific type and params
   */
  async clearCache(type: string, params: Record<string, unknown>): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey(type, params);
      await this.cacheService.delete(cacheKey);
      this.logger.debug(`Cache cleared for ${type}: ${cacheKey}`);
    } catch (error) {
      this.logger.error(`Error clearing cache for ${type}:`, error);
    }
  }

  /**
   * Clear all analytics cache
   */
  async clearAllAnalyticsCache(): Promise<void> {
    try {
      await this.cacheService.clear('analytics:*');
      this.logger.log('Successfully cleared all analytics cache');
    } catch (error) {
      this.logger.error('Error clearing all analytics cache:', error);
      throw error;
    }
  }

  /**
   * Clear dashboard cache
   */
  async clearDashboardCache(params?: Record<string, unknown>): Promise<void> {
    if (params) {
      await this.clearCache('DASHBOARD_DATA', params);
    } else {
      // Note: Bulk clearing not implemented - only individual keys can be cleared
      this.logger.warn('Bulk dashboard cache clearing not implemented');
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
    hitRate: number;
  }> {
    try {
      const client = this.cacheService.getClient();
      const info = await client.info('memory');
      const keys = await client.keys('analytics:*');

      return {
        totalKeys: keys.length,
        memoryUsage: info,
        hitRate: 0, // This would need to be tracked separately
      };
    } catch (error) {
      this.logger.error('Error getting cache stats:', error);
      return {
        totalKeys: 0,
        memoryUsage: 'N/A',
        hitRate: 0,
      };
    }
  }
}
