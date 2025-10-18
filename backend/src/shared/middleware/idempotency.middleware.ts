import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';

const cache = new Map<string, any>(); // استبدله بـ Redis في الإنتاج

/**
 * Idempotency Middleware
 * 
 * Ensures that duplicate requests with the same Idempotency-Key header
 * return the same response without executing the operation again.
 * 
 * Usage: Send requests with header: "Idempotency-Key: unique-key-here"
 * 
 * Note: Currently uses in-memory cache. In production, replace with Redis.
 */
@Injectable()
export class IdempotencyMiddleware implements NestMiddleware {
  async use(req: any, res: any, next: () => void) {
    // Apply only to POST requests
    if (req.method !== 'POST') return next();
    
    const key = req.header('Idempotency-Key');
    if (!key) return next();
    
    // Check if we already have a response for this key
    if (cache.has(key)) {
      const cachedResponse = cache.get(key);
      return res.status(200).json(cachedResponse);
    }
    
    // Intercept the response to cache it
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      cache.set(key, body);
      return originalJson(body);
    };
    
    next();
  }
}
