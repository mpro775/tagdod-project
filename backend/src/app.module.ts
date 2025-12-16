import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { User, UserSchema } from './modules/users/schemas/user.schema';

// Core modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { CartModule } from './modules/cart/cart.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { SupportModule } from './modules/support/support.module';
import { ServicesModule } from './modules/services/services.module';
import { MarketingModule } from './modules/marketing/marketing.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { NotificationsCompleteModule } from './modules/notifications/notifications-complete.module';
import { SearchModule } from './modules/search/search.module';
import { SecurityModule } from './modules/security/security.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { BrandsModule } from './modules/brands/brands.module';
import { AttributesModule } from './modules/attributes/attributes.module';
import { ExchangeRatesModule } from './modules/exchange-rates/exchange-rates.module';
import { UploadModule } from './modules/upload/upload.module';
import { AuditModule } from './modules/audit/audit.module';
import { SystemMonitoringModule } from './modules/system-monitoring/system-monitoring.module';
import { ErrorLogsModule } from './modules/error-logs/error-logs.module';
import { I18nModule } from './modules/i18n/i18n.module';
import { SystemSettingsModule } from './modules/system-settings/system-settings.module';
import { PoliciesModule } from './modules/policies/policies.module';
import { AboutModule } from './modules/about/about.module';
import { HealthModule } from './health/health.module';

// Shared modules
import { CacheModule } from './shared/cache/cache.module';
import { SharedModule } from './shared/shared.module';
import { KeepAliveService } from './shared/services/keep-alive.service';

// Middleware
import { ActivityTrackingMiddleware } from './shared/middleware/activity-tracking.middleware';
import { RequestIdMiddleware } from './shared/middleware/request-id.middleware';
import { IdempotencyMiddleware } from './shared/middleware/idempotency.middleware';

// Global filters and interceptors
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';
import { ResponseEnvelopeInterceptor } from './shared/interceptors/response-envelope.interceptor';
import { SecurityLoggingInterceptor } from './modules/security/interceptors/security-logging.interceptor';
import { ApiMetricsInterceptor } from './modules/system-monitoring/interceptors/api-metrics.interceptor';
import { WellKnownController } from './deep-linking/well-known.controller';
import { ShareProductController } from './deep-linking/share-product.controller';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database with connection pool configuration for stability and security
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/solar-commerce', {
      maxPoolSize: parseInt(process.env.DB_POOL_MAX || '10'),
      minPoolSize: parseInt(process.env.DB_POOL_MIN || '2'),
      serverSelectionTimeoutMS: 20000, // Increased from 5000 to 20000 (20 seconds) due to high latency
      socketTimeoutMS: 45000,
      connectTimeoutMS: 15000, // Increased from 10000 to 15000
      heartbeatFrequencyMS: 10000, // Important: periodic ping to maintain connection
      maxIdleTimeMS: 30000,
      retryWrites: true,
      retryReads: true,
      // Additional settings to improve stability
      bufferCommands: false, // Disable mongoose buffering
    }),

    // Global schemas for middleware
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),

    // Scheduling
    ScheduleModule.forRoot(),

    // Throttling - Global rate limiting (increased for background jobs while maintaining security)
    // TODO: إعادة تفعيل rate limiting بعد الاختبار
    // ThrottlerModule.forRoot([{
    //   ttl: 60,
    //   limit: 300, // Increased from 100 to 300 requests/minute for polling endpoints
    // }]),

    // Core modules
    AuthModule,
    UsersModule,
    ProductsModule,
    AnalyticsModule, // Analytics module with all services
    CartModule,
    CheckoutModule,
    SupportModule,
    ServicesModule,
    MarketingModule,
    AddressesModule,
    FavoritesModule,
    NotificationsCompleteModule,
    SearchModule,
    SecurityModule,
    CategoriesModule,
    BrandsModule,
    AttributesModule,
    ExchangeRatesModule,
    UploadModule,
    AuditModule,
    SystemMonitoringModule,
    ErrorLogsModule,
    I18nModule,
    SystemSettingsModule,
    PoliciesModule,
    AboutModule,

    // Health module
    HealthModule,

    // Shared modules
    CacheModule,
    SharedModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseEnvelopeInterceptor },
    { provide: APP_INTERCEPTOR, useClass: SecurityLoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ApiMetricsInterceptor },
    // TODO: إعادة تفعيل rate limiting بعد الاختبار
    // { provide: APP_GUARD, useClass: ThrottlerGuard },
    KeepAliveService,
  ],
  controllers: [WellKnownController, ShareProductController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply request ID middleware to all routes
    consumer.apply(RequestIdMiddleware).forRoutes('*');

    // Apply activity tracking middleware to all routes
    consumer.apply(ActivityTrackingMiddleware).forRoutes('*');

    // Apply idempotency middleware to critical routes (Orders/Checkout)
    consumer
      .apply(IdempotencyMiddleware)
      .forRoutes(
        { path: 'api/v1/checkout', method: RequestMethod.POST },
        { path: 'api/v1/orders', method: RequestMethod.POST },
        { path: 'api/v1/cart/checkout', method: RequestMethod.POST },
      );
  }
}
