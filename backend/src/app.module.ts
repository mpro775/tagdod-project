import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TerminusModule } from '@nestjs/terminus';

import { envSchema } from './config/env.validation';
import { HealthController } from './health.controller';
import { RedisHealthIndicator } from './health/redis-health.indicator';
import { MongooseModule } from '@nestjs/mongoose';
import { ServicesModule } from './modules/services/services.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { UsersModule } from './modules/users/users.module';
import { UsersAdminModule } from './modules/users/admin/users.admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { CartModule } from './modules/cart/cart.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { UploadModule } from './modules/upload/upload.module';
import { SupportModule } from './modules/support/support.module';
import { SearchModule } from './modules/search/search.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SecurityModule } from './modules/security/security.module';
import { RequestMetricsInterceptor } from './modules/security/interceptors/request-metrics.interceptor';
import { CacheModule } from './shared/cache/cache.module';
import { BrandsModule } from './modules/brands/brands.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { AttributesModule } from './modules/attributes/attributes.module';
import { ProductsModule } from './modules/products/products.module';
import { MarketingModule } from './modules/marketing/marketing.module';
import { ExchangeRatesModule } from './modules/exchange-rates/exchange-rates.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => {
        const parsed = envSchema.safeParse(env);
        if (!parsed.success) {
          // Throw plain error to be caught by Nest
          throw new Error('Invalid ENV: ' + JSON.stringify(parsed.error.format()));
        }
        return parsed.data;
      },
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI ?? ''),
    TerminusModule,
    CacheModule,
    MarketingModule, // Unified marketing module (replaces PromotionsModule, BannersModule, PricingModule, CouponsModule)
    ServicesModule,
    UsersModule,
    AuthModule,
    AddressesModule,
    CategoriesModule, // نظام الفئات المنفصل
    AttributesModule, // نظام السمات العالمية
    ProductsModule, // نظام المنتجات المنفصل
    CatalogModule, // للعرض العام
    CartModule,
    CheckoutModule,
    FavoritesModule,
    UploadModule,
    SupportModule,
    SearchModule,
    AnalyticsModule,
    SecurityModule,
    NotificationsModule,
    BrandsModule,
    UsersAdminModule,
    ExchangeRatesModule, // نظام أسعار الصرف

  ],
  controllers: [HealthController],
  providers: [
    RedisHealthIndicator,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestMetricsInterceptor,
    },
  ],
})
export class AppModule {}
