import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityHeadersMiddleware.name);
  private readonly nodeEnv: string;

  constructor(private configService: ConfigService) {
    this.nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Security Headers
    // ملاحظة: helmet يقوم بوضع معظم هذه الأشياء، لكن لا ضرر من وجودها هنا للتأكيد باستثناء CSP
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    // ❌❌❌ تم حذف قسم Content Security Policy (CSP) من هنا ❌❌❌
    // السبب: أنت تستخدم helmet في main.ts وهذا يسبب تضارباً وأخطاء في الصياغة

    // HTTPS Only Headers (when HTTPS is enabled)
    if (req.secure || req.get('x-forwarded-proto') === 'https') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    // Remove server information
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');

    // Add custom security headers
    res.setHeader('X-API-Version', '1.0.0');
    res.setHeader('X-Environment', this.nodeEnv);
    res.setHeader('X-Timestamp', new Date().toISOString());

    // Request ID for tracing
    const requestId = req.headers['x-request-id'] || this.generateRequestId();
    res.setHeader('X-Request-ID', (Array.isArray(requestId) ? requestId[0] : requestId) || this.generateRequestId());

    // Log security headers application (occasionally)
    if (Math.random() < 0.001) {
      this.logger.debug(`Security headers applied for ${req.method} ${req.path}`);
    }

    next();
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}