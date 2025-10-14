import { Injectable, NestMiddleware, Logger, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ThreatDetectionMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ThreatDetectionMiddleware.name);

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
    /%2e%2e\/g,
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
      // Check query parameters
      this.checkForThreats(req.query, 'query parameters', req);

      // Check request body
      if (req.body && typeof req.body === 'object') {
        this.checkForThreats(req.body, 'request body', req);
      }

      // Check headers
      this.checkForThreats(req.headers, 'headers', req);

      // Check URL path
      if (this.containsPathTraversal(req.path)) {
        this.logThreat('Path Traversal', req.path, req);
        throw new BadRequestException('Invalid request path');
      }

      // Additional security checks
      this.performAdditionalChecks(req);

      next();
    } catch (error) {
      if (error instanceof BadRequestException) {
        this.logger.warn(`Threat detected and blocked: ${error.message}`, {
          ip: this.getClientIP(req),
          path: req.path,
          method: req.method,
          userAgent: req.get('User-Agent'),
        });
      }
      throw error;
    }
  }

  private checkForThreats(data: any, source: string, req: Request): void {
    const threats = this.scanForThreats(data);

    if (threats.length > 0) {
      const threatDetails = threats.map(t => `${t.type}: ${t.pattern}`).join(', ');
      this.logThreat(`Multiple threats in ${source}`, threatDetails, req);
      throw new BadRequestException(`Invalid input detected in ${source}`);
    }
  }

  private scanForThreats(data: any): Array<{ type: string; pattern: string; value: string }> {
    const threats: Array<{ type: string; pattern: string; value: string }> = [];

    const scanValue = (value: any, path: string = ''): void => {
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
      } else if (typeof value === 'object' && value !== null) {
        for (const [key, val] of Object.entries(value)) {
          scanValue(val, path ? `${path}.${key}` : key);
        }
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          scanValue(item, `${path}[${index}]`);
        });
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
      throw new BadRequestException('Invalid request');
    }

    // Check for extremely large payloads
    if (contentLength > 50 * 1024 * 1024) { // 50MB
      this.logThreat('Large Payload', `${contentLength} bytes`, req);
      throw new BadRequestException('Request payload too large');
    }

    // Check for too many parameters
    const paramCount = Object.keys(req.query).length + this.countNestedKeys(req.body);
    if (paramCount > 100) {
      this.logThreat('Too Many Parameters', `Count: ${paramCount}`, req);
      throw new BadRequestException('Too many request parameters');
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

  private countNestedKeys(obj: any): number {
    let count = 0;

    const countKeys = (value: any): void => {
      if (typeof value === 'object' && value !== null) {
        count += Object.keys(value).length;
        for (const val of Object.values(value)) {
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
      ip: this.getClientIP(req),
      method: req.method,
      path: req.path,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
    });
  }

  private getClientIP(req: Request): string {
    const forwarded = req.get('x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    const realIP = req.get('x-real-ip');
    if (realIP) {
      return realIP;
    }

    return req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
  }
}
