import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { DomainException, ErrorCode } from '../../shared/exceptions';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import { ClientIPService } from './services/client-ip.service';

@Injectable()
export class ThreatDetectionMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ThreatDetectionMiddleware.name);
  private readonly isDevelopment: boolean;
  private readonly isThreatDetectionDisabled: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly clientIPService: ClientIPService,
  ) {
    this.isDevelopment = this.configService.get<string>('NODE_ENV', 'development') === 'development';
    this.isThreatDetectionDisabled = this.configService.get<string>('DISABLE_THREAT_DETECTION', 'false') === 'true';
    
    if (this.isDevelopment || this.isThreatDetectionDisabled) {
      this.logger.warn('🚧 Threat detection is DISABLED for easier development');
    }
  }

  // SQL Injection patterns
  private readonly sqlInjectionPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/i,
    /('|(\\x27)|(\\x2D\\x2D)|(\\\\x)|(\\x23)|(\\x27)|(\\x3B)|(\\x2F\\x2A)|(\\x2A\\x2F))/i,
    /(-|=|--|#|\/\*|\*\/|;|'|"|`|\\|xp_|sp_|exec|union|select|insert|update|delete|drop|create|alter)/i,
    /(\b(or|and)\b\s+\d+\s*=\s*\d+)/i,
    /(\b(or|and)\b\s+['"]\w+['"]\s*=\s*['"]\w+['"])/i,
  ];

  // XSS patterns
  private readonly xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi,
    /onmouseover\s*=/gi,
    /<iframe[^>]*>/gi,
    /<object[^>]*>/gi,
    /<embed[^>]*>/gi,
    /<form[^>]*>/gi,
    /<meta[^>]*>/gi,
    /<link[^>]*>/gi,
    /expression\s*\(/gi,
    /vbscript\s*:/gi,
    /data\s*:\s*text\/html/gi,
  ];

  // Path traversal patterns
  private readonly pathTraversalPatterns = [
    /\.\.\//g,
    /\.\\/g,
    /%2e%2e%2f/g,
    /%2e%2e\//g,
    /\.\.%5c/g,
    /%2e%2e%5c/g,
  ];

  // Command injection patterns
  private readonly commandInjectionPatterns = [
    /[;&|`$()]/g,
    /\\n|\\r/g,
    /rm\s+/g,
    /del\s+/g,
    /format\s+/g,
    /shutdown\s+/g,
  ];

  use(req: Request, res: Response, next: NextFunction) {
    try {
      // Skip threat detection in development mode or if explicitly disabled
      if (this.isDevelopment || this.isThreatDetectionDisabled) {
        this.logger.debug('Threat detection skipped', {
          path: req.path,
          method: req.method,
          reason: this.isDevelopment ? 'development mode' : 'explicitly disabled',
        });
        next();
        return;
      }

      // Check query parameters
      this.checkForThreats(req.query, 'query parameters', req);

      // Check request body
      if (req.body && typeof req.body === 'object') {
        this.checkForThreats(req.body, 'request body', req);
      }

      // Check headers - استثناء headers آمنة من Nginx و Postman
      const safeHeaders = [
        'host',
        'user-agent',
        'accept',
        'accept-language',
        'accept-encoding',
        'connection',
        'content-type',
        'content-length',
        'authorization',
        'x-forwarded-for',
        'x-forwarded-proto',
        'x-real-ip',
        'x-forwarded-host',
        'x-forwarded-port',
        'cache-control',
        'origin',
        'referer',
        'referrer-policy',
        'sec-fetch-site',
        'sec-fetch-mode',
        'sec-fetch-dest',
        'sec-ch-ua',
        'sec-ch-ua-mobile',
        'sec-ch-ua-platform',
        'upgrade-insecure-requests',
        'dnt',
        'x-requested-with',
        'x-api-key',
        'x-request-id',
        'x-correlation-id',
      ];

      const filteredHeaders: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(req.headers)) {
        const lowerKey = key.toLowerCase();
        // فحص فقط الـ headers غير الآمنة
        if (!safeHeaders.includes(lowerKey)) {
          filteredHeaders[key] = value;
        }
      }

      // فحص فقط الـ headers غير الآمنة
      if (Object.keys(filteredHeaders).length > 0) {
        this.checkForThreats(filteredHeaders, 'headers', req);
      }

      // Check URL path
      if (this.containsPathTraversal(req.path)) {
        this.logThreat('Path Traversal', req.path, req);
        throw new DomainException(ErrorCode.VALIDATION_ERROR, { reason: 'invalid_path' });
      }

      // Additional security checks
      this.performAdditionalChecks(req);

      next();
    } catch (error) {
      if (error instanceof DomainException) {
        this.logger.warn(`Threat detected and blocked: ${error instanceof Error ? error.message : 'Unknown threat'}`, {
          ip: this.clientIPService.getClientIP(req),
          path: req.path,
          method: req.method,
          userAgent: req.get('User-Agent'),
        });
      }
      throw error;
    }
  }

  private checkForThreats(data: Record<string, unknown>, source: string, req: Request): void {
    const threats = this.scanForThreats(data);

    if (threats.length > 0) {
      const threatDetails = threats.map(t => `${t.type}: ${t.pattern}`).join(', ');
      this.logThreat(`Multiple threats in ${source}`, threatDetails, req);
      throw new DomainException(ErrorCode.VALIDATION_ERROR, { source, reason: 'invalid_input' });
    }
  }

  private scanForThreats(data: unknown): Array<{ type: string; pattern: string; value: string }> {
    const threats: Array<{ type: string; pattern: string; value: string }> = [];

    const scanValue = (value: unknown, path: string = ''): void => {
      if (typeof value === 'string') {
        // Check for SQL injection
        for (const pattern of this.sqlInjectionPatterns) {
          if (pattern.test(value)) {
            threats.push({
              type: 'SQL Injection',
              pattern: pattern.source,
              value: value.substring(0, 100),
            });
            break;
          }
        }

        // Check for XSS
        for (const pattern of this.xssPatterns) {
          if (pattern.test(value)) {
            threats.push({
              type: 'XSS',
              pattern: pattern.source,
              value: value.substring(0, 100),
            });
            break;
          }
        }

        // Check for command injection
        for (const pattern of this.commandInjectionPatterns) {
          if (pattern.test(value)) {
            threats.push({
              type: 'Command Injection',
              pattern: pattern.source,
              value: value.substring(0, 100),
            });
            break;
          }
        }
      } else if (Array.isArray(value)) {
        (value as unknown[]).forEach((item, index) => {
          scanValue(item, `${path}[${index}]`);
        });
      } else if (typeof value === 'object' && value !== null) {
        const obj = value as Record<string, unknown>;
        for (const [key, val] of Object.entries(obj)) {
          scanValue(val, path ? `${path}.${key}` : key);
        }
      }
    };

    scanValue(data);
    return threats;
  }

  private containsPathTraversal(path: string): boolean {
    return this.pathTraversalPatterns.some(pattern => pattern.test(path));
  }

  private performAdditionalChecks(req: Request): void {
    // Check for suspicious request patterns
    const userAgent = req.get('User-Agent') || '';
    const contentLength = parseInt(req.get('content-length') || '0');

    // Suspicious user agents
    if (this.isSuspiciousUserAgent(userAgent)) {
      this.logThreat('Suspicious User Agent', userAgent, req);
      throw new DomainException(ErrorCode.VALIDATION_ERROR, { reason: 'invalid_request' });
    }

    // Check for extremely large payloads
    if (contentLength > 50 * 1024 * 1024) { // 50MB
      this.logThreat('Large Payload', `${contentLength} bytes`, req);
      throw new DomainException(ErrorCode.VALIDATION_ERROR, { reason: 'payload_too_large' });
    }

    // Check for too many parameters
    const paramCount = Object.keys(req.query).length + this.countNestedKeys(req.body);
    if (paramCount > 100) {
      this.logThreat('Too Many Parameters', `Count: ${paramCount}`, req);
      throw new DomainException(ErrorCode.VALIDATION_ERROR, { reason: 'too_many_parameters' });
    }
  }

  private isSuspiciousUserAgent(userAgent: string): boolean {
    if (!userAgent) return true;

    const suspiciousPatterns = [
      /sqlmap/i,
      /nmap/i,
      /masscan/i,
      /zgrab/i,
      /dirbuster/i,
      /gobuster/i,
      /nikto/i,
      /nessus/i,
      /acunetix/i,
      /qualysguard/i,
    ];

    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  private countNestedKeys(obj: unknown): number {
    let count = 0;

    const countKeys = (value: unknown): void => {
      if (Array.isArray(value)) {
        for (const item of value) countKeys(item);
        return;
      }
      if (typeof value === 'object' && value !== null) {
        const obj = value as Record<string, unknown>;
        count += Object.keys(obj).length;
        for (const val of Object.values(obj)) {
          countKeys(val);
        }
      }
    };

    countKeys(obj);
    return count;
  }

  private logThreat(threatType: string, details: string, req: Request): void {
    this.logger.warn(`🚨 ${threatType} detected: ${details}`, {
      threatType,
      details,
      ip: this.clientIPService.getClientIP(req),
      method: req.method,
      path: req.path,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
    });
  }
}
