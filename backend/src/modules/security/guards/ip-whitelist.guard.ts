import { Injectable, CanActivate, ExecutionContext, Logger, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class IPWhitelistGuard implements CanActivate {
  private readonly logger = new Logger(IPWhitelistGuard.name);
  private readonly whitelist: string[] = [];
  private readonly blacklist: string[] = [];

  constructor(private configService: ConfigService) {
    this.loadIPLists();
  }

  private loadIPLists() {
    // Load whitelist from environment
    const whitelist = this.configService.get<string>('IP_WHITELIST', '');
    if (whitelist) {
      this.whitelist = whitelist.split(',').map(ip => ip.trim());
    }

    // Load blacklist from environment
    const blacklist = this.configService.get<string>('IP_BLACKLIST', '');
    if (blacklist) {
      this.blacklist = blacklist.split(',').map(ip => ip.trim());
    }

    // Add localhost for development
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    if (nodeEnv === 'development') {
      this.whitelist.push('127.0.0.1', '::1', 'localhost');
    }
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const clientIP = this.getClientIP(request);

    // Check blacklist first
    if (this.isBlacklisted(clientIP)) {
      this.logger.warn(`Blocked blacklisted IP: ${clientIP}`);
      throw new ForbiddenException('Access denied from this IP address');
    }

    // If whitelist is enabled, check it
    if (this.whitelist.length > 0 && !this.isWhitelisted(clientIP)) {
      this.logger.warn(`IP not in whitelist: ${clientIP}`);
      throw new ForbiddenException('Access denied from this IP address');
    }

    return true;
  }

  private getClientIP(request: Request): string {
    // Check for forwarded IP headers
    const forwarded = request.get('x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    const realIP = request.get('x-real-ip');
    if (realIP) {
      return realIP;
    }

    const cfConnectingIP = request.get('cf-connecting-ip');
    if (cfConnectingIP) {
      return cfConnectingIP;
    }

    // Fallback to connection remote address
    return request.connection.remoteAddress || request.socket.remoteAddress || 'unknown';
  }

  private isWhitelisted(ip: string): boolean {
    return this.whitelist.some(allowedIP => {
      if (allowedIP.includes('*')) {
        // Handle wildcard patterns (e.g., 192.168.1.*)
        const pattern = allowedIP.replace(/\*/g, '.*');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(ip);
      }
      return allowedIP === ip;
    });
  }

  private isBlacklisted(ip: string): boolean {
    return this.blacklist.some(blockedIP => {
      if (blockedIP.includes('*')) {
        const pattern = blockedIP.replace(/\*/g, '.*');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(ip);
      }
      return blockedIP === ip;
    });
  }

  // Methods for dynamic IP management
  addToWhitelist(ip: string): void {
    if (!this.whitelist.includes(ip)) {
      this.whitelist.push(ip);
      this.logger.log(`Added IP to whitelist: ${ip}`);
    }
  }

  removeFromWhitelist(ip: string): boolean {
    const index = this.whitelist.indexOf(ip);
    if (index > -1) {
      this.whitelist.splice(index, 1);
      this.logger.log(`Removed IP from whitelist: ${ip}`);
      return true;
    }
    return false;
  }

  addToBlacklist(ip: string): void {
    if (!this.blacklist.includes(ip)) {
      this.blacklist.push(ip);
      this.logger.log(`Added IP to blacklist: ${ip}`);
    }
  }

  removeFromBlacklist(ip: string): boolean {
    const index = this.blacklist.indexOf(ip);
    if (index > -1) {
      this.blacklist.splice(index, 1);
      this.logger.log(`Removed IP from blacklist: ${ip}`);
      return true;
    }
    return false;
  }

  getWhitelist(): string[] {
    return [...this.whitelist];
  }

  getBlacklist(): string[] {
    return [...this.blacklist];
  }
}
