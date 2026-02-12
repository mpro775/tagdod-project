import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { GeoIPCountryService } from '../services/geoip-country.service';
import { SystemSettingsService } from '../../system-settings/system-settings.service';

const YEMEN_COUNTRY_CODE = 'YE';

@Injectable()
export class WebSocketCountryRestrictionGuard implements CanActivate {
  private readonly logger = new Logger(WebSocketCountryRestrictionGuard.name);

  constructor(
    private readonly geoIPCountryService: GeoIPCountryService,
    @Inject(forwardRef(() => SystemSettingsService))
    private readonly systemSettingsService: SystemSettingsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const ip = this.getClientIPFromSocket(client);

    const restrictToYemen = await this.systemSettingsService.getSettingValue(
      'restrict_to_yemen',
      false,
    );

    if (!restrictToYemen) {
      return true;
    }

    const whitelist = (await this.systemSettingsService.getSettingValue(
      'yemen_restriction_whitelist',
      [],
    )) as string[];

    if (Array.isArray(whitelist) && this.isIPWhitelisted(ip, whitelist)) {
      return true;
    }

    const countryCode = this.geoIPCountryService.getCountryCode(ip);

    if (countryCode === null) {
      this.logger.warn(
        `WebSocket GeoIP lookup failed for IP ${ip}, allowing connection (fail-open)`,
      );
      return true;
    }

    if (countryCode === YEMEN_COUNTRY_CODE) {
      return true;
    }

    this.logger.warn(
      `Blocked WebSocket connection from non-Yemen IP: ${ip} (country: ${countryCode})`,
    );
    throw new WsException({
      reason: 'region_restricted',
      ip,
      country: countryCode,
    });
  }

  private getClientIPFromSocket(client: Socket): string {
    const forwarded = client.handshake.headers['x-forwarded-for'];
    if (forwarded) {
      const first = typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded[0];
      if (first?.trim()) return first.trim();
    }

    const realIp = client.handshake.headers['x-real-ip'];
    if (realIp && typeof realIp === 'string') {
      return realIp.trim();
    }

    const addr = client.handshake.address;
    if (addr) {
      const ip = typeof addr === 'string' ? addr : (addr as { address?: string }).address;
      if (ip) return ip;
    }

    return 'unknown';
  }

  private isIPWhitelisted(ip: string, whitelist: string[]): boolean {
    return whitelist.some((allowed) => {
      const trimmed = allowed.trim();
      if (!trimmed) return false;
      if (trimmed.includes('*')) {
        const pattern = trimmed.replace(/\*/g, '.*');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(ip);
      }
      return trimmed === ip;
    });
  }
}
