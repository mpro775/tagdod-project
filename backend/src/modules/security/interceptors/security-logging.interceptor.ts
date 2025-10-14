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

@Injectable()
export class SecurityLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SecurityLoggingInterceptor.name);
  private readonly sensitiveHeaders = [
    'authorization',
    'x-api-key',
    'cookie',
    'set-cookie',
  ];

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const startTime = Date.now();

    // Extract request information
    const requestInfo = this.extractRequestInfo(request);

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          const responseInfo = this.extractResponseInfo(response, data, duration);

          // Log security events
          this.logSecurityEvent(requestInfo, responseInfo);

          // Log performance issues
          if (duration > 5000) { // Log slow requests > 5 seconds
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
        error: (error) => {
          const duration = Date.now() - startTime;
          const errorInfo = this.extractErrorInfo(error, duration);

          // Log security incidents
          this.logSecurityIncident(requestInfo, errorInfo);

          // Log authentication failures
          if (error.status === 401 || error.status === 403) {
            this.logger.warn(`Authentication/Authorization failure: ${requestInfo.method} ${requestInfo.path}`, {
              ...requestInfo,
              error: errorInfo,
            });
          }

          // Log rate limiting
          if (error.status === 429) {
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

    return {
      timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      method: request.method,
      path: request.path,
      query: request.query,
      ip: this.getClientIP(request),
      userAgent: userAgent.substring(0, 200), // Truncate long user agents
      referer: referer.substring(0, 200),
      headers,
      bodySize: request.headers['content-length'] || 0,
      requestId: request.headers['x-request-id'] || 'unknown',
      userId: (request as any).user?.sub || 'anonymous',
      deviceFingerprint: (request as any).deviceFingerprint || 'unknown',
    };
  }

  private extractResponseInfo(response: Response, data: any, duration: number) {
    return {
      statusCode: response.statusCode,
      duration,
      responseSize: this.calculateResponseSize(data),
      headers: this.sanitizeHeaders(response.getHeaders()),
    };
  }

  private extractErrorInfo(error: any, duration: number) {
    return {
      statusCode: error.status || 500,
      message: error.message || 'Unknown error',
      duration,
      stack: error.stack ? error.stack.substring(0, 500) : undefined,
    };
  }

  private sanitizeHeaders(headers: any): Record<string, string> {
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

  private getClientIP(request: Request): string {
    const forwarded = request.get('x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    const realIP = request.get('x-real-ip');
    if (realIP) {
      return realIP;
    }

    return request.connection.remoteAddress || request.socket.remoteAddress || 'unknown';
  }

  private calculateResponseSize(data: any): number {
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

  private logSecurityEvent(requestInfo: any, responseInfo: any): void {
    // Log important security events
    const { method, path, ip, userId, statusCode } = { ...requestInfo, ...responseInfo };

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
        this.logger.warn(`Failed authentication: ${method} ${path} from ${ip}`);
      }
    }

    // Log file upload events
    if (path.includes('/upload/') && statusCode === 200) {
      this.logger.log(`File uploaded: ${method} ${path} by user ${userId} from ${ip}`);
    }

    // Log sensitive data access
    if (path.includes('/analytics/') || path.includes('/admin/')) {
      this.logger.log(`Sensitive data access: ${method} ${path} by user ${userId} from ${ip}`);
    }
  }

  private logSecurityIncident(requestInfo: any, errorInfo: any): void {
    const { method, path, ip, userId, statusCode } = { ...requestInfo, ...errorInfo };

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
