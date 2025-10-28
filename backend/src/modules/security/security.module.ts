import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RateLimitingService } from './rate-limiting.service';
import { CORSService } from './cors.service';
import { ClientIPService } from './services/client-ip.service';
import { RateLimitingMiddleware } from './rate-limiting.middleware';
import { SecurityHeadersMiddleware } from './security-headers.middleware';
import { ThreatDetectionMiddleware } from './threat-detection.middleware';
import { SecurityLoggingInterceptor } from './interceptors/security-logging.interceptor';
import { RequestMetricsInterceptor } from './interceptors/request-metrics.interceptor';
import { IPWhitelistGuard } from './guards/ip-whitelist.guard';
import { DeviceFingerprintGuard } from './guards/device-fingerprint.guard';

@Module({
  imports: [
    ConfigModule,
  ],
  providers: [
    RateLimitingService,
    CORSService,
    ClientIPService,
    SecurityLoggingInterceptor,
    RequestMetricsInterceptor,
    IPWhitelistGuard,
    DeviceFingerprintGuard,
  ],
  exports: [
    RateLimitingService,
    CORSService,
    ClientIPService,
    SecurityLoggingInterceptor,
    RequestMetricsInterceptor,
    IPWhitelistGuard,
    DeviceFingerprintGuard,
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
      .forRoutes('*')

      // 3. Rate limiting (after basic validation) - Made optional if Redis unavailable
      .apply(RateLimitingMiddleware)
      .forRoutes('*');
  }
}
