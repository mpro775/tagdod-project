import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface CORSConfig {
  origin: string | string[] | ((origin: string) => boolean);
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  credentials: boolean;
  maxAge: number;
  preflightContinue: boolean;
  optionsSuccessStatus: number;
}

@Injectable()
export class CORSService {
  private readonly logger = new Logger(CORSService.name);
  private config: CORSConfig;

  constructor(private configService: ConfigService) {
    this.config = this.buildCORSConfig();
  }

  private buildCORSConfig(): CORSConfig {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    const allowedOrigins = this.parseAllowedOrigins();
    const isDevelopment = nodeEnv === 'development';

    return {
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        // Check if origin is allowed
        if (this.isOriginAllowed(origin, allowedOrigins)) {
          return callback(null, true);
        }

        // Log blocked origin in development
        if (isDevelopment) {
          this.logger.warn(`CORS: Blocked origin: ${origin}`);
        }

        return callback(new Error('Not allowed by CORS'), false);
      },
      methods: [
        'GET',
        'POST',
        'PUT',
        'DELETE',
        'PATCH',
        'OPTIONS',
        'HEAD',
      ],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-Request-ID',
        'X-API-Key',
        'X-Forwarded-For',
        'X-Real-IP',
        'CF-Connecting-IP',
        'User-Agent',
        'Accept-Language',
        'Accept-Encoding',
        'Cache-Control',
        'If-None-Match',
        'If-Modified-Since',
      ],
      exposedHeaders: [
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset',
        'X-Request-ID',
        'X-Total-Count',
        'X-Page-Count',
        'X-Page-Size',
        'Content-Range',
      ],
      credentials: true, // Allow cookies and authorization headers
      maxAge: 86400, // 24 hours - cache preflight requests
      preflightContinue: false,
      optionsSuccessStatus: 204, // Return 204 for OPTIONS requests
    };
  }

  private parseAllowedOrigins(): string[] {
    const origins = this.configService.get<string>('CORS_ORIGINS', '');
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');

    if (!origins) {
      // Default origins based on environment
      if (nodeEnv === 'development') {
        return [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:8080',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:3001',
          'http://127.0.0.1:8080',
          'https://localhost:3000',
          'https://localhost:3001',
          'https://localhost:8080',
        ];
      } else {
        // In production, be more restrictive
        return [
          'https://your-frontend-domain.com',
          'https://admin.your-frontend-domain.com',
        ];
      }
    }

    // Parse comma-separated origins
    return origins.split(',').map(origin => origin.trim());
  }

  private isOriginAllowed(origin: string, allowedOrigins: string[]): boolean {
    // Check exact matches
    if (allowedOrigins.includes(origin)) {
      return true;
    }

    // Check wildcard patterns
    for (const allowedOrigin of allowedOrigins) {
      if (allowedOrigin.includes('*')) {
        const pattern = allowedOrigin.replace(/\*/g, '.*');
        const regex = new RegExp(`^${pattern}$`);
        if (regex.test(origin)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Get current CORS configuration
   */
  getConfig(): CORSConfig {
    return this.config;
  }

  /**
   * Update CORS configuration dynamically
   */
  updateConfig(newConfig: Partial<CORSConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger.log('CORS configuration updated');
  }

  /**
   * Add allowed origin
   */
  addAllowedOrigin(origin: string): void {
    const origins = Array.isArray(this.config.origin)
      ? [...this.config.origin, origin]
      : [origin];

    this.config.origin = origins;
    this.logger.log(`Added allowed origin: ${origin}`);
  }

  /**
   * Remove allowed origin
   */
  removeAllowedOrigin(origin: string): boolean {
    if (Array.isArray(this.config.origin)) {
      const index = this.config.origin.indexOf(origin);
      if (index > -1) {
        this.config.origin.splice(index, 1);
        this.logger.log(`Removed allowed origin: ${origin}`);
        return true;
      }
    }
    return false;
  }

  /**
   * Get allowed origins list
   */
  getAllowedOrigins(): string[] {
    if (typeof this.config.origin === 'function') {
      return ['dynamic function'];
    }
    return Array.isArray(this.config.origin) ? this.config.origin : [this.config.origin];
  }

  /**
   * Validate CORS setup
   */
  validateSetup(): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check if credentials are enabled with wildcard origin
    if (this.config.credentials && this.config.origin === '*') {
      issues.push('CORS credentials cannot be enabled with wildcard (*) origin');
    }

    // Check for secure headers
    const requiredHeaders = ['Authorization', 'Content-Type'];
    const missingHeaders = requiredHeaders.filter(
      header => !this.config.allowedHeaders.includes(header)
    );

    if (missingHeaders.length > 0) {
      issues.push(`Missing required headers: ${missingHeaders.join(', ')}`);
    }

    // Check exposed headers for rate limiting
    const rateLimitHeaders = ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'];
    const missingExposedHeaders = rateLimitHeaders.filter(
      header => !this.config.exposedHeaders.includes(header)
    );

    if (missingExposedHeaders.length > 0) {
      issues.push(`Missing rate limit headers in exposed headers: ${missingExposedHeaders.join(', ')}`);
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Get CORS statistics
   */
  getStatistics(): {
    allowedOriginsCount: number;
    allowedMethodsCount: number;
    allowedHeadersCount: number;
    exposedHeadersCount: number;
    credentialsEnabled: boolean;
    maxAge: number;
  } {
    return {
      allowedOriginsCount: Array.isArray(this.config.origin) ? this.config.origin.length : 1,
      allowedMethodsCount: this.config.methods.length,
      allowedHeadersCount: this.config.allowedHeaders.length,
      exposedHeadersCount: this.config.exposedHeaders.length,
      credentialsEnabled: this.config.credentials,
      maxAge: this.config.maxAge,
    };
  }
}
