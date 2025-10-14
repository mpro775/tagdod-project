import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CacheHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Set default cache headers
    const isCacheEnabled = process.env.CACHE_ENABLED !== 'false';

    if (isCacheEnabled) {
      // Default cache control for static resources
      if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year
        return next();
      }

      // API responses - no cache by default
      if (req.path.startsWith('/api/')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }

      // Specific cache headers for catalog endpoints
      if (req.path.includes('/catalog/')) {
        // These will be overridden by the interceptor if caching is applied
        res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes default
      }

      // Analytics endpoints - shorter cache
      if (req.path.includes('/analytics/')) {
        res.setHeader('Cache-Control', 'private, max-age=60'); // 1 minute
      }
    } else {
      // Disable caching globally
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }

    // Add cache status header if not already set
    if (!res.getHeader('X-Cache-Status')) {
      res.setHeader('X-Cache-Status', 'DISABLED');
    }

    next();
  }
}
