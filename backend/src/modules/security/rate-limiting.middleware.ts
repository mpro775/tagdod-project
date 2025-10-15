import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RateLimitingService } from './rate-limiting.service';

@Injectable()
export class RateLimitingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RateLimitingMiddleware.name);

  constructor(private rateLimitingService: RateLimitingService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const clientIP = this.getClientIP(req);
    const path = req.path;
    const method = req.method;

    // Skip rate limiting for health checks and docs
    if (path === '/health' || path.startsWith('/docs')) {
      return next();
    }

    try {
      // Determine which rate limiter to use based on path
      const limiterName = this.getLimiterName(
        path,
        method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD',
      );
      const key = this.generateKey(clientIP, path, method);

      // Check rate limit
      const result = await this.rateLimitingService.checkLimit(limiterName, key);

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': this.getLimiterPoints(limiterName),
        'X-RateLimit-Remaining': result.remainingPoints,
        'X-RateLimit-Reset': Math.floor((Date.now() + result.msBeforeNext) / 1000),
      });

      if (result.isBlocked) {
        this.logger.warn(`Rate limit exceeded for ${clientIP} on ${method} ${path}`);

        res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'تم تجاوز حد الطلبات المسموح به. يرجى المحاولة لاحقاً.',
            details: {
              retryAfter: Math.ceil(result.msBeforeNext / 1000),
              limit: this.getLimiterPoints(limiterName),
              remaining: 0,
            },
          },
          requestId: req.headers['x-request-id'] || 'unknown',
        });
        return;
      }

      // Log successful requests occasionally (1% of requests)
      if (Math.random() < 0.01) {
        this.logger.debug(
          `Rate limit check passed for ${clientIP} on ${method} ${path} (${result.remainingPoints} remaining)`,
        );
      }

      next();
    } catch (error) {
      this.logger.error('Rate limiting middleware error:', error);
      // Continue with request if rate limiting fails
      next();
    }
  }

  private getClientIP(req: Request): string {
    // Check for forwarded IP headers
    const forwarded = req.get('x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    const realIP = req.get('x-real-ip');
    if (realIP) {
      return realIP;
    }

    const cfConnectingIP = req.get('cf-connecting-ip');
    if (cfConnectingIP) {
      return cfConnectingIP;
    }

    // Fallback to connection remote address
    return req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
  }

  private getLimiterName(path: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD'): string {
    // Authentication endpoints

    void method;
    if (path.includes('/auth/') || path.includes('/otp/')) {
      if (path.includes('/login') || path.includes('/signin')) {
        return 'login';
      }
      if (path.includes('/reset-password') || path.includes('/forgot-password')) {
        return 'password_reset';
      }
      return 'auth';
    }

    // File upload endpoints
    if (path.includes('/upload/')) {
      return 'upload';
    }

    // Search endpoints
    if (path.includes('/search/')) {
      return 'search';
    }

    // Admin endpoints
    if (path.includes('/admin/') || path.includes('/analytics/')) {
      return 'admin';
    }

    // Analytics endpoints
    if (path.includes('/analytics/')) {
      return 'analytics';
    }

    // Default API limiter
    return 'api';
  }

  private generateKey(clientIP: string, path: string, method: string): string {
    // Create a unique key based on IP, path pattern, and method
    const pathPattern = path.replace(/\/[0-9a-f]{24}/g, '/:id'); // Replace MongoDB ObjectIds
    return `${clientIP}:${method}:${pathPattern}`;
  }

  private getLimiterPoints(limiterName: string): number {
    const limits = {
      api: 1000,
      auth: 10,
      login: 5,
      password_reset: 3,
      upload: 50,
      search: 200,
      admin: 500,
      analytics: 100,
    };

    return limits[limiterName as keyof typeof limits] || 1000;
  }
}
