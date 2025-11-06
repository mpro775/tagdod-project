import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';
import { format } from 'date-fns';
import { ConfigService } from '@nestjs/config';
import { ClientIPService } from '../services/client-ip.service';

@Injectable()
export class SecurityLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SecurityLoggingInterceptor.name);
  private readonly isDevelopment: boolean;
  private readonly enableSecurityLogging: boolean;
  private readonly verboseLogging: boolean;
  private readonly sensitiveHeaders = [
    'authorization',
    'x-api-key',
    'cookie',
    'set-cookie',
  ];

  constructor(
    private readonly configService: ConfigService,
    private readonly clientIPService: ClientIPService,
  ) {
    this.isDevelopment = this.configService.get<string>('NODE_ENV', 'development') === 'development';
    
    // Allow enabling security logging in development via ENABLE_SECURITY_LOGGING env var
    // Default: enabled in development for better debugging, can be disabled if needed
    this.enableSecurityLogging = this.configService.get<string>('ENABLE_SECURITY_LOGGING', 'true') === 'true';
    
    // Verbose logging shows all requests, non-verbose only shows important events
    this.verboseLogging = this.configService.get<string>('VERBOSE_SECURITY_LOGGING', this.isDevelopment ? 'true' : 'false') === 'true';
    
    if (this.isDevelopment) {
      if (this.enableSecurityLogging) {
        this.logger.log(`🔍 Development mode - Security logging is ENABLED (verbose: ${this.verboseLogging})`);
      } else {
        this.logger.warn('🚧 Development mode detected - Security logging is DISABLED (set ENABLE_SECURITY_LOGGING=true to enable)');
      }
    }
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // Skip security logging if explicitly disabled
    if (!this.enableSecurityLogging) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const startTime = Date.now();

    // Extract request information
    const requestInfo = this.extractRequestInfo(request);

    return next.handle().pipe(
      tap({
        next: (data: unknown) => {
          const duration = Date.now() - startTime;
          const responseInfo = this.extractResponseInfo(response, data, duration);

          // Log all requests in verbose mode (development), or only important events in production
          if (this.verboseLogging) {
            this.logger.debug(`${requestInfo.method} ${requestInfo.path} [${responseInfo.statusCode}] - ${duration}ms`, {
              ip: requestInfo.ip,
              userId: requestInfo.userId,
              requestId: requestInfo.requestId,
            });
          }

          // Log security events
          this.logSecurityEvent(requestInfo, responseInfo);

          // Log performance issues (lower threshold in development)
          const slowRequestThreshold = this.isDevelopment ? 1000 : 5000; // 1s in dev, 5s in prod
          if (duration > slowRequestThreshold) {
            this.logger.warn(`Slow request: ${requestInfo.method} ${requestInfo.path} took ${duration}ms`, {
              ...requestInfo,
              ...responseInfo,
            });
          }

          // Log unusual response sizes
          if (responseInfo.responseSize > 10000000) { // 10MB
            this.logger.warn(`Large response: ${responseInfo.responseSize} bytes`, {
              ...requestInfo,
              ...responseInfo,
            });
          }
        },
        error: (error: unknown) => {
          const duration = Date.now() - startTime;
          const errorInfo = this.extractErrorInfo(error, duration);

          // Log security incidents
          this.logSecurityIncident(requestInfo, errorInfo);

          // Log authentication failures
          if (errorInfo.statusCode === 401 || errorInfo.statusCode === 403) {
            this.logger.warn(`Authentication/Authorization failure: ${requestInfo.method} ${requestInfo.path}`, {
              ...requestInfo,
              error: errorInfo,
            });
          }

          // Log rate limiting
          if (errorInfo.statusCode === 429) {
            this.logger.warn(`Rate limit exceeded: ${requestInfo.ip}`, {
              ...requestInfo,
              error: errorInfo,
            });
          }
        },
      }),
    );
  }

  private extractRequestInfo(request: Request) {
    const headers = this.sanitizeHeaders(request.headers);
    const userAgent = request.get('User-Agent') || '';
    const referer = request.get('Referer') || '';
    const reqWithUser = request as Request & { user?: { sub: string }; deviceFingerprint?: string };

    return {
      timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      method: request.method,
      path: request.path,
      query: request.query,
      ip: this.clientIPService.getClientIP(request),
      userAgent: userAgent.substring(0, 200), // Truncate long user agents
      referer: referer.substring(0, 200),
      headers,
      bodySize: request.headers['content-length'] || 0,
      requestId: request.headers['x-request-id'] || 'unknown',
      userId: reqWithUser.user?.sub || 'anonymous',
      deviceFingerprint: reqWithUser.deviceFingerprint || 'unknown',
    };
  }

  private extractResponseInfo(response: Response, data: unknown, duration: number) {
    return {
      statusCode: response.statusCode,
      duration,
      responseSize: this.calculateResponseSize(data),
      headers: this.sanitizeHeaders(response.getHeaders() as Record<string, unknown>),
    };
  }

  private extractErrorInfo(error: unknown, duration: number) {
    const e = error as { status?: number; message?: string; stack?: string };
    return {
      statusCode: e?.status ?? 500,
      message: e?.message ?? 'Unknown error',
      duration,
      stack: e?.stack ? e.stack.substring(0, 500) : undefined,
    };
  }

  private sanitizeHeaders(headers: Record<string, unknown>): Record<string, string> {
    const sanitized: Record<string, string> = {};

    for (const [key, value] of Object.entries(headers)) {
      if (!this.sensitiveHeaders.includes(key.toLowerCase())) {
        sanitized[key] = Array.isArray(value) ? value.join(', ') : String(value);
      } else {
        sanitized[key] = '[REDACTED]';
      }
    }

    return sanitized;
  }


  private calculateResponseSize(data: unknown): number {
    try {
      if (typeof data === 'string') {
        return Buffer.byteLength(data, 'utf8');
      }
      const jsonString = JSON.stringify(data);
      return Buffer.byteLength(jsonString, 'utf8');
    } catch {
      return 0;
    }
  }

  private logSecurityEvent(requestInfo: Record<string, unknown>, responseInfo: Record<string, unknown>): void {
    // Log important security events
    const merged = { ...requestInfo, ...responseInfo } as { method: string; path: string; ip: string; userId: string; statusCode: number };
    const { method, path, ip, userId, statusCode } = merged;

    // Log admin actions
    if (path.includes('/admin/') && userId !== 'anonymous') {
      this.logger.log(`Admin action: ${method} ${path} by user ${userId} from ${ip}`, {
        userId,
        ip,
        method,
        path,
        statusCode,
      });
    }

    // Log authentication events
    if (path.includes('/auth/')) {
      if (statusCode === 200) {
        this.logger.log(`Successful authentication: ${method} ${path} from ${ip}`);
      } else if (statusCode === 401 || statusCode === 403) {
        this.logger.warn(`Failed authentication: ${method} ${path} from ${ip}`, {
          ip,
          method,
          path,
          statusCode,
        });
      }
    }

    // Log file upload events
    if (path.includes('/upload/') && statusCode === 200) {
      this.logger.log(`File uploaded: ${method} ${path} by user ${userId} from ${ip}`, {
        userId,
        ip,
        method,
        path,
      });
    }

    // Log sensitive data access
    if (path.includes('/analytics/') || path.includes('/admin/')) {
      this.logger.log(`Sensitive data access: ${method} ${path} by user ${userId} from ${ip}`, {
        userId,
        ip,
        method,
        path,
        statusCode,
      });
    }

    // In development, also log errors and warnings with more detail
    if (this.isDevelopment && (statusCode >= 400)) {
      this.logger.debug(`Request error: ${method} ${path} [${statusCode}]`, {
        ip,
        userId,
        method,
        path,
        statusCode,
        query: requestInfo.query,
      });
    }
  }

  private logSecurityIncident(requestInfo: Record<string, unknown>, errorInfo: Record<string, unknown>): void {
    const merged = { ...requestInfo, ...errorInfo } as { method: string; path: string; ip: string; userId: string; statusCode: number; timestamp?: string };
    const { method, path, ip, userId, statusCode } = merged;

    // Log potential security incidents
    if (statusCode === 401 || statusCode === 403) {
      this.logger.warn(`Security incident: Unauthorized access attempt`, {
        method,
        path,
        ip,
        userId,
        statusCode,
        timestamp: requestInfo.timestamp,
      });
    }

    // Log potential attacks
    if (statusCode === 429) {
      this.logger.warn(`Security incident: Rate limit exceeded`, {
        method,
        path,
        ip,
        userId,
        statusCode,
      });
    }

    // Log server errors that might indicate attacks
    if (statusCode >= 500) {
      this.logger.error(`Security incident: Server error`, {
        method,
        path,
        ip,
        userId,
        statusCode,
        error: errorInfo.message,
      });
    }
  }
}
