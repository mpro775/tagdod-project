import { Injectable, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { CacheService } from '../cache/cache.service';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

export const CACHE_KEY = 'cache';
export const CACHE_TTL_KEY = 'cache_ttl';

export interface CacheOptions {
  key?: string;
  ttl?: number;
  condition?: (context: ExecutionContext) => boolean;
}

@Injectable()
export class ResponseCacheInterceptor {
  private readonly logger = new Logger(ResponseCacheInterceptor.name);
  private readonly isDevelopment: boolean;

  constructor(
    private cacheService: CacheService,
    private reflector: Reflector,
    private configService: ConfigService,
  ) {
    this.isDevelopment = this.configService.get<string>('NODE_ENV', 'development') === 'development';
    
    if (this.isDevelopment) {
      this.logger.warn('🚧 Development mode detected - Response caching is DISABLED');
    }
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse<Response>();

    // Skip caching in development mode
    if (this.isDevelopment) {
      return next.handle();
    }

    // Check if caching is enabled globally
    const isCacheEnabled = process.env.CACHE_ENABLED !== 'false';

    if (!isCacheEnabled) {
      return next.handle();
    }

    // Get cache options from metadata
    const cacheOptions = this.reflector.getAllAndOverride<CacheOptions>(CACHE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!cacheOptions) {
      return next.handle();
    }

    // Check custom condition
    if (cacheOptions.condition && !cacheOptions.condition(context)) {
      return next.handle();
    }

    // Generate cache key
    const cacheKey = this.generateCacheKey(request, cacheOptions.key);

    try {
      // Try to get cached response
      const cachedResponse = await this.cacheService.get(cacheKey);
      if (cachedResponse) {
        this.logger.debug(`Response cache hit for key: ${cacheKey}`);

        // Set cache headers
        response.setHeader('X-Cache-Status', 'HIT');
        response.setHeader('X-Cache-Time', new Date().toISOString());
        response.setHeader('Cache-Control', `public, max-age=${cacheOptions.ttl || 3600}`);

        // Return cached response
        return of(cachedResponse);
      }

      this.logger.debug(`Response cache miss for key: ${cacheKey}`);

      // Set cache miss header
      response.setHeader('X-Cache-Status', 'MISS');
    } catch (error) {
      this.logger.error(`Cache read error for key ${cacheKey}:`, error);
      // Continue without caching
    }

    // Execute the request and cache the response
    return next.handle().pipe(
      tap(async (responseData) => {
        try {
          const ttl = cacheOptions.ttl || parseInt(process.env.CACHE_TTL || '3600');
          await this.cacheService.set(cacheKey, responseData, { ttl });

          this.logger.debug(`Response cached for key: ${cacheKey} with TTL: ${ttl}s`);
        } catch (error) {
          this.logger.error(`Cache write error for key ${cacheKey}:`, error);
        }
      }),
    );
  }

  private generateCacheKey(request: Request, customKey?: string): string {
    if (customKey) {
      return `response:${customKey}`;
    }

    // Generate key based on request
    const { method, url, query, body } = request;
    const userObj = (request as Request & { user?: Record<string, unknown> }).user;
    const userId =
      typeof userObj?.['id'] === 'string' ? (userObj['id'] as string) :
      typeof userObj?.['_id'] === 'string' ? String(userObj['_id']) :
      typeof userObj?.['userId'] === 'string' ? (userObj['userId'] as string) :
      'anonymous';

    // Create a hash of the request parameters
    const keyComponents = [
      method,
      url,
      userId,
      JSON.stringify(query || {}),
      // Don't include body in cache key for security, except for GET requests
      method === 'GET' ? '' : this.hashRequestBody(body),
    ];

    const keyString = keyComponents.join(':');
    return `response:${this.hashString(keyString)}`;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private hashRequestBody(body: unknown): string {
    if (!body || typeof body !== 'object') return '';

    // For sensitive operations, create a simplified hash
    const safeBody: Record<string, unknown> = { ...(body as Record<string, unknown>) };
    // Remove sensitive fields
    delete safeBody['password'];
    delete safeBody['token'];
    delete safeBody['creditCard'];
    delete safeBody['cvv'];

    return this.hashString(JSON.stringify(safeBody));
  }
}

// Decorator to enable response caching
export function CacheResponse(options?: CacheOptions) {
  return (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(CACHE_KEY, options || {}, descriptor.value);
  };
}

// Decorator to set cache TTL
export function CacheTTL(ttl: number) {
  return (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => {
    const existingOptions = Reflect.getMetadata(CACHE_KEY, descriptor.value) || {};
    Reflect.defineMetadata(CACHE_KEY, { ...existingOptions, ttl }, descriptor.value);
  };
}
