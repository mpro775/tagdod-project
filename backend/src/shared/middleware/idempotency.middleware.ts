import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { RedisCacheService, CachedResponse } from '../cache/redis-cache.service';

interface RequestWithIdempotency extends Request {
  idempotencyKey?: string;
}

/**
 * Idempotency Middleware
 * 
 * Ensures that duplicate requests with the same Idempotency-Key header
 * return the same response without executing the operation again.
 * 
 * Usage: Send requests with header: "Idempotency-Key: unique-key-here"
 * 
 * Note: Uses Redis cache for distributed idempotency across multiple instances.
 */
@Injectable()
export class IdempotencyMiddleware implements NestMiddleware {
  constructor(private readonly redisCacheService: RedisCacheService) {}

  async use(req: RequestWithIdempotency, res: Response, next: () => void) {
    // Apply only to POST requests
    if (req.method !== 'POST') return next();
    
    const headerValue = req.header('Idempotency-Key');
    const key = Array.isArray(headerValue) ? headerValue[0] : headerValue;
    if (!key) return next();
    
    // Check if we already have a response for this key
    const cachedResponse = await this.redisCacheService.get<CachedResponse>(key);
    if (cachedResponse) {
      return res.status(cachedResponse.status).json(cachedResponse.body);
    }
    
    // Intercept the response to cache it
    const originalJson = res.json.bind(res);
    const originalStatus = res.status.bind(res);
    let responseStatus = 200;
    
    res.status = (code: number) => {
      responseStatus = code;
      return originalStatus(code);
    };
    
    res.json = (body: unknown) => {
      const cachedResponse: CachedResponse = {
        status: responseStatus,
        body,
        timestamp: Date.now()
      };
      // Cache asynchronously without blocking the response
      this.redisCacheService.set(key, cachedResponse).catch((error) => {
        console.error('Failed to cache idempotency response:', error);
      });
      return originalJson(body);
    };
    
    next();
  }
}
