import { Injectable, CanActivate, ExecutionContext, Logger, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { createHash } from 'crypto';

@Injectable()
export class DeviceFingerprintGuard implements CanActivate {
  private readonly logger = new Logger(DeviceFingerprintGuard.name);
  private readonly suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /scanner/i,
    /python/i,
    /curl/i,
    /wget/i,
    /postman/i,
    /insomnia/i,
  ];

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const userAgent = request.get('User-Agent') || '';
    const accept = request.get('Accept') || '';
    const acceptLanguage = request.get('Accept-Language') || '';
    const clientIP = this.getClientIP(request);

    // Check for suspicious user agents
    if (this.isSuspiciousUserAgent(userAgent)) {
      this.logger.warn(`Suspicious user agent detected: ${userAgent} from IP: ${clientIP}`);
      throw new BadRequestException('Invalid request');
    }

    // Check for automated requests
    if (this.isAutomatedRequest(request)) {
      this.logger.warn(`Automated request detected from IP: ${clientIP}`);
      throw new BadRequestException('Automated requests not allowed');
    }

    // Generate device fingerprint for monitoring
    const fingerprint = this.generateDeviceFingerprint(request);
    request['deviceFingerprint'] = fingerprint;

    // Log device information for security monitoring
    if (Math.random() < 0.001) { // Log 0.1% of requests
      this.logger.debug(`Device fingerprint: ${fingerprint} from IP: ${clientIP}`);
    }

    return true;
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

  private isSuspiciousUserAgent(userAgent: string): boolean {
    if (!userAgent) return true;

    return this.suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  private isAutomatedRequest(request: Request): boolean {
    const userAgent = request.get('User-Agent') || '';
    const accept = request.get('Accept') || '';
    const referer = request.get('Referer') || '';

    // Check for missing or suspicious headers
    if (!userAgent || userAgent.length < 10) {
      return true;
    }

    // Check for API-like requests without proper browser headers
    if (accept === 'application/json' && !userAgent.includes('Mozilla') && !referer) {
      return true;
    }

    // Check for rapid successive requests (would be handled by rate limiting)

    return false;
  }

  private generateDeviceFingerprint(request: Request): string {
    const components = [
      request.get('User-Agent') || '',
      request.get('Accept-Language') || '',
      request.get('Accept-Encoding') || '',
      request.get('Accept') || '',
      this.getClientIP(request),
      request.get('sec-ch-ua') || '', // Chrome user agent hints
      request.get('sec-ch-ua-mobile') || '',
      request.get('sec-ch-ua-platform') || '',
    ];

    const fingerprintString = components.join('|');
    return createHash('sha256').update(fingerprintString).digest('hex').substring(0, 16);
  }

  // Method to check if device is suspicious based on fingerprint
  isSuspiciousFingerprint(fingerprint: string): boolean {
    // This could be enhanced with a database of known suspicious fingerprints
    // For now, just return false
    return false;
  }
}
