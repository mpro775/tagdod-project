import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
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
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { SearchModule } from './modules/search/search.module';
import { SecurityModule } from './modules/security/security.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { BrandsModule } from './modules/brands/brands.module';
import { AttributesModule } from './modules/attributes/attributes.module';
import { ExchangeRatesModule } from './modules/exchange-rates/exchange-rates.module';
import { UploadModule } from './modules/upload/upload.module';

// Health module
// import { HealthModule } from './health/health.module';

// Shared modules
import { CacheModule } from './shared/cache/cache.module';

// Middleware
import { ActivityTrackingMiddleware } from './shared/middleware/activity-tracking.middleware';
import { HealthModule } from './health/health.module';

// Configuration
// Using basic validation without Joi to avoid dependency conflicts

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      // validationSchema removed to avoid Joi dependency conflicts
      envFilePath: '.env',
    }),

    // Database
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/solar-commerce'),
    
    // Global schemas for middleware
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),

    // Scheduling
    ScheduleModule.forRoot(),

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
    NotificationsModule,
    CatalogModule,
    SearchModule,
    SecurityModule,
    CategoriesModule,
    BrandsModule,
    AttributesModule,
    ExchangeRatesModule,
    UploadModule,

    // Health module
    HealthModule,

    // Shared modules
    CacheModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply activity tracking middleware to all routes
    consumer
      .apply(ActivityTrackingMiddleware)
      .forRoutes('*');
  }
}