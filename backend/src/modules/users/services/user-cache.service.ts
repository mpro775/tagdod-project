import { Injectable, Logger } from '@nestjs/common';

export interface CacheConfig {
  defaultTTL: number; // الوقت الافتراضي للانتهاء (بالثواني)
  maxSize: number; // الحد الأقصى لعدد العناصر المخزنة
}

export interface CacheItem {
  data: unknown;
  expiresAt: number;
  createdAt: number;
  accessCount: number;
  lastAccessed: number;
}

@Injectable()
export class UserCacheService {
  private readonly logger = new Logger(UserCacheService.name);
  private readonly cache = new Map<string, CacheItem>();
  private readonly config: CacheConfig = {
    defaultTTL: 300, // 5 دقائق
    maxSize: 1000, // 1000 عنصر
  };

  /**
   * تخزين بيانات في الكاش
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.config.defaultTTL) * 1000;

    // تنظيف الكاش إذا وصل للحد الأقصى
    if (this.cache.size >= this.config.maxSize) {
      this.cleanup();
    }

    this.cache.set(key, {
      data,
      expiresAt,
      createdAt: now,
      accessCount: 0,
      lastAccessed: now,
    });

    this.logger.debug(`Cache set: ${key}`);
  }

  /**
   * جلب بيانات من الكاش
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // التحقق من انتهاء الصلاحية
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.logger.debug(`Cache expired: ${key}`);
      return null;
    }

    // تحديث إحصائيات الوصول
    item.accessCount++;
    item.lastAccessed = Date.now();

    this.logger.debug(`Cache hit: ${key}`);
    return item.data as T;
  }

  /**
   * التحقق من وجود مفتاح في الكاش
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    // التحقق من انتهاء الصلاحية
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * حذف مفتاح من الكاش
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.logger.debug(`Cache deleted: ${key}`);
    }
    return deleted;
  }

  /**
   * مسح جميع البيانات من الكاش
   */
  clear(): void {
    this.cache.clear();
    this.logger.debug('Cache cleared');
  }

  /**
   * تنظيف الكاش من العناصر المنتهية الصلاحية
   */
  cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    // إذا كان الكاش لا يزال ممتلئاً، احذف العناصر الأقل استخداماً
    if (this.cache.size >= this.config.maxSize) {
      const sortedItems = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.accessCount - b.accessCount);

      const itemsToRemove = Math.floor(this.config.maxSize * 0.1); // إزالة 10%
      for (let i = 0; i < itemsToRemove; i++) {
        const [key] = sortedItems[i];
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.debug(`Cache cleaned: ${cleanedCount} items removed`);
    }
  }

  /**
   * الحصول على إحصائيات الكاش
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    totalAccesses: number;
    expiredItems: number;
  } {
    const now = Date.now();
    let totalAccesses = 0;
    let expiredItems = 0;

    for (const item of this.cache.values()) {
      totalAccesses += item.accessCount;
      if (now > item.expiresAt) {
        expiredItems++;
      }
    }

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: totalAccesses > 0 ? totalAccesses / this.cache.size : 0,
      totalAccesses,
      expiredItems,
    };
  }

  /**
   * تحديث إعدادات الكاش
   */
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config.defaultTTL = newConfig.defaultTTL ?? this.config.defaultTTL;
    this.config.maxSize = newConfig.maxSize ?? this.config.maxSize;
    
    // تنظيف الكاش إذا قل الحد الأقصى
    if (this.cache.size > this.config.maxSize) {
      this.cleanup();
    }
  }

  /**
   * الحصول على إعدادات الكاش
   */
  getConfig(): CacheConfig {
    return { ...this.config };
  }

  /**
   * إنشاء مفتاح كاش للمستخدم
   */
  createUserKey(userId: string, suffix?: string): string {
    return `user:${userId}${suffix ? `:${suffix}` : ''}`;
  }

  /**
   * إنشاء مفتاح كاش للتحليل
   */
  createAnalyticsKey(type: string, params?: Record<string, unknown>): string {
    const paramString = params ? `:${JSON.stringify(params)}` : '';
    return `analytics:${type}${paramString}`;
  }

  /**
   * إنشاء مفتاح كاش للترتيب
   */
  createRankingKey(limit: number): string {
    return `ranking:${limit}`;
  }

  /**
   * إنشاء مفتاح كاش للإحصائيات العامة
   */
  createOverviewKey(): string {
    return 'analytics:overview';
  }
}
