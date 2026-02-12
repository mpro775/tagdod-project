import { Module, MiddlewareConsumer, NestModule, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RateLimitingService } from './rate-limiting.service';
import { CORSService } from './cors.service';
import { ClientIPService } from './services/client-ip.service';
import { GeoIPCountryService } from './services/geoip-country.service';
import { SystemSettingsModule } from '../system-settings/system-settings.module';
import { SecurityHeadersMiddleware } from './security-headers.middleware';
import { ThreatDetectionMiddleware } from './threat-detection.middleware';
import { SecurityLoggingInterceptor } from './interceptors/security-logging.interceptor';
import { RequestMetricsInterceptor } from './interceptors/request-metrics.interceptor';
import { IPWhitelistGuard } from './guards/ip-whitelist.guard';
import { DeviceFingerprintGuard } from './guards/device-fingerprint.guard';
import { CountryRestrictionGuard } from './guards/country-restriction.guard';
import { WebSocketCountryRestrictionGuard } from './guards/websocket-country-restriction.guard';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => SystemSettingsModule),
  ],
  providers: [
    GeoIPCountryService,
    RateLimitingService,
    CORSService,
    ClientIPService,
    SecurityLoggingInterceptor,
    RequestMetricsInterceptor,
    IPWhitelistGuard,
    DeviceFingerprintGuard,
    CountryRestrictionGuard,
    WebSocketCountryRestrictionGuard,
  ],
  exports: [
    GeoIPCountryService,
    RateLimitingService,
    CORSService,
    ClientIPService,
    SecurityLoggingInterceptor,
    RequestMetricsInterceptor,
    IPWhitelistGuard,
    DeviceFingerprintGuard,
    CountryRestrictionGuard,
    WebSocketCountryRestrictionGuard,
  ],
})
export class SecurityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply security middlewares in correct order
    consumer
      // 1. Security headers (first, sets headers)
      .apply(SecurityHeadersMiddleware)
      .forRoutes('*')

      // 2. Threat detection (early detection)
      .apply(ThreatDetectionMiddleware)
      .forRoutes('*');

      // 3. Rate limiting (after basic validation) - Made optional if Redis unavailable
      // TODO: إعادة تفعيل rate limiting بعد الاختبار
      // .apply(RateLimitingMiddleware)
      // .forRoutes('*');
  }
}
