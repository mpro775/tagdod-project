import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const geoip = require('geoip-country');

@Injectable()
export class GeoIPCountryService {
  /**
   * Get ISO 3166-1 alpha-2 country code from IP address.
   * @param ip - Client IP address (IPv4 or IPv6)
   * @returns Country code (e.g. 'YE' for Yemen) or null if unknown/invalid
   */
  getCountryCode(ip: string): string | null {
    if (!ip || ip === 'unknown') {
      return null;
    }

    try {
      const result = geoip.lookup(ip);
      return result?.country ?? null;
    } catch {
      return null;
    }
  }
}
