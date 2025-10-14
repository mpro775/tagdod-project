import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { envSchema } from './config/env.validation';
import { HealthController } from './health.controller';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ServicesModule } from './modules/services/services.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { UsersModule } from './modules/users/users.module';
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
import { CacheModule } from './shared/cache/cache.module';
import { BrandsModule } from './modules/brands/brands.module';
import { BannersModule } from './modules/banners/banners.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { AttributesModule } from './modules/attributes/attributes.module';
import { ProductsModule } from './modules/products/products.module';

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
    CacheModule,
    PromotionsModule,
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
    BannersModule,
    PricingModule,
    CouponsModule,

  ],
  controllers: [HealthController],
})
export class AppModule {}
