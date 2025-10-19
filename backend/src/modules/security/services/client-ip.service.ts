import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ClientIPService {
  private readonly logger = new Logger(ClientIPService.name);

  /**
   * Extract client IP address from request with proper header priority
   * @param request Express request object
   * @returns Client IP address
   */
  getClientIP(request: Request): string {
    // Priority order for IP detection
    const ipSources = [
      request.get('cf-connecting-ip'), // Cloudflare
      request.get('x-real-ip'),        // Nginx proxy
      request.get('x-forwarded-for'),  // Standard proxy header
      request.connection?.remoteAddress,
      request.socket?.remoteAddress,
    ];

    for (const ip of ipSources) {
      if (ip && this.isValidIP(ip)) {
        // Handle x-forwarded-for which can contain multiple IPs
        if (ip.includes(',')) {
          const firstIP = ip.split(',')[0].trim();
          if (this.isValidIP(firstIP)) {
            return firstIP;
          }
        } else {
          return ip;
        }
      }
    }

    this.logger.warn('Unable to determine client IP, using fallback');
    return 'unknown';
  }

  /**
   * Validate IP address format
   * @param ip IP address to validate
   * @returns true if valid IP format
   */
  private isValidIP(ip: string): boolean {
    if (!ip || ip === 'unknown') return false;
    
    // IPv4 validation
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (ipv4Regex.test(ip)) return true;
    
    // IPv6 validation (basic)
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    if (ipv6Regex.test(ip)) return true;
    
    // IPv6 with :: shorthand
    const ipv6ShortRegex = /^::1$|^::$|^(?:[0-9a-fA-F]{1,4}:)*::(?:[0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$/;
    if (ipv6ShortRegex.test(ip)) return true;
    
    return false;
  }

  /**
   * Get client IP with additional metadata
   * @param request Express request object
   * @returns Client IP info with metadata
   */
  getClientIPInfo(request: Request): {
    ip: string;
    source: string;
    isProxy: boolean;
    userAgent: string;
  } {
    const ip = this.getClientIP(request);
    const userAgent = request.get('User-Agent') || '';
    
    // Determine IP source
    let source = 'direct';
    let isProxy = false;
    
    if (request.get('cf-connecting-ip')) {
      source = 'cloudflare';
      isProxy = true;
    } else if (request.get('x-real-ip')) {
      source = 'nginx';
      isProxy = true;
    } else if (request.get('x-forwarded-for')) {
      source = 'proxy';
      isProxy = true;
    }

    return {
      ip,
      source,
      isProxy,
      userAgent,
    };
  }

  /**
   * Check if IP is from a trusted proxy
   * @param request Express request object
   * @returns true if from trusted proxy
   */
  isFromTrustedProxy(request: Request): boolean {
    const trustedProxies = [
      '127.0.0.1',
      '::1',
      'localhost',
      // Add your trusted proxy IPs here
    ];

    const directIP = request.connection?.remoteAddress || request.socket?.remoteAddress;
    return trustedProxies.includes(directIP || '');
  }
}
