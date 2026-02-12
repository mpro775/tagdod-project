import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Request } from 'express';
import { ForbiddenException } from '../../../shared/exceptions';
import { ClientIPService } from '../services/client-ip.service';
import { GeoIPCountryService } from '../services/geoip-country.service';
import { SystemSettingsService } from '../../system-settings/system-settings.service';

const EXCLUDED_PATHS: Array<string | RegExp> = [
  /^api\/v1\/admin(\/|$)/,
  /^api\/v1\/auth\/admin-login$/,
  /^api\/v1\/auth\/create-super-admin$/,
  /^api\/v1\/auth\/dev-login$/,
  /^api\/v1\/health/,
  /^api\/docs/,
  /^api-/,
  /^\.well-known\//,
  /^p\//,
];

const YEMEN_COUNTRY_CODE = 'YE';

@Injectable()
export class CountryRestrictionGuard implements CanActivate {
  private readonly logger = new Logger(CountryRestrictionGuard.name);

  constructor(
    private readonly clientIPService: ClientIPService,
    private readonly geoIPCountryService: GeoIPCountryService,
    @Inject(forwardRef(() => SystemSettingsService))
    private readonly systemSettingsService: SystemSettingsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const path = this.normalizePath(request.originalUrl || request.url);

    if (this.isPathExcluded(path)) {
      return true;
    }

    const restrictToYemen = await this.systemSettingsService.getSettingValue(
      'restrict_to_yemen',
      false,
    );

    if (!restrictToYemen) {
      return true;
    }

    const clientIP = this.clientIPService.getClientIP(request);

    const whitelist = (await this.systemSettingsService.getSettingValue(
      'yemen_restriction_whitelist',
      [],
    )) as string[];

    if (Array.isArray(whitelist) && this.isIPWhitelisted(clientIP, whitelist)) {
      return true;
    }

    const countryCode = this.geoIPCountryService.getCountryCode(clientIP);

    if (countryCode === null) {
      this.logger.warn(
        `GeoIP lookup failed for IP ${clientIP}, allowing request (fail-open)`,
      );
      return true;
    }

    if (countryCode === YEMEN_COUNTRY_CODE) {
      return true;
    }

    this.logger.warn(
      `Blocked request from non-Yemen IP: ${clientIP} (country: ${countryCode})`,
    );
    throw new ForbiddenException({
      reason: 'region_restricted',
      ip: clientIP,
      country: countryCode,
    });
  }

  private normalizePath(url: string): string {
    const withoutQuery = url.split('?')[0];
    return withoutQuery.replace(/^\/+/, '');
  }

  private isPathExcluded(path: string): boolean {
    return EXCLUDED_PATHS.some((pattern) => {
      if (typeof pattern === 'string') {
        return path === pattern || path.startsWith(pattern + '/');
      }
      return pattern.test(path);
    });
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
