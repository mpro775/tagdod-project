import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductService } from './services/product.service';
import { VariantService } from './services/variant.service';
import { PricingService } from './services/pricing.service';
import { ProductPricingCalculatorService } from './services/product-pricing-calculator.service';
import { InventoryService } from './services/inventory.service';
import { StockAlertService } from './services/stock-alert.service';
// 1. استيراد السيرفس الجديد
import { InventoryIntegrationService } from './services/inventory-integration.service';
import { PublicProductsPresenter } from './services/public-products.presenter';
import { ProductsController } from './controllers/products.controller';
import { PublicProductsController } from './controllers/public-products.controller';
// 2. استيراد الكنترولر الجديد
import { InventoryIntegrationController } from './controllers/inventory-integration.controller';
import { Product, ProductSchema } from './schemas/product.schema';
import { Variant, VariantSchema } from './schemas/variant.schema';
// 3. استيراد سكيما المخزون الخارجي
import { ExternalStock, ExternalStockSchema } from './schemas/external-stock.schema';
import { CacheModule } from '../../shared/cache/cache.module';
import { AttributesModule } from '../attributes/attributes.module';
import { CategoriesModule } from '../categories/categories.module';
import { ExchangeRatesModule } from '../exchange-rates/exchange-rates.module';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Capabilities, CapabilitiesSchema } from '../capabilities/schemas/capabilities.schema';
import { AuthModule } from '../auth/auth.module';
import { NotificationsCompleteModule } from '../notifications/notifications-complete.module';
import { SharedModule } from '../../shared/shared.module';
import { MarketingModule } from '../marketing/marketing.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Variant.name, schema: VariantSchema },
      { name: User.name, schema: UserSchema },
      { name: Capabilities.name, schema: CapabilitiesSchema },
      // 4. تسجيل السكيما الجديدة هنا
      { name: ExternalStock.name, schema: ExternalStockSchema },
    ]),
    CacheModule,
    AttributesModule,
    CategoriesModule,
    forwardRef(() => ExchangeRatesModule),
    NotificationsCompleteModule,
    forwardRef(() => AuthModule),
    SharedModule,
    forwardRef(() => MarketingModule),
  ],
  controllers: [
    ProductsController,
    PublicProductsController,
    // 5. إضافة الكنترولر الجديد
    InventoryIntegrationController
  ],
  providers: [
    ProductService,
    VariantService,
    PricingService,
    ProductPricingCalculatorService,
    InventoryService,
    StockAlertService,
    PublicProductsPresenter,
    // 6. إضافة السيرفس الجديد
    InventoryIntegrationService,
  ],
  exports: [
    ProductService,
    VariantService,
    PricingService,
    ProductPricingCalculatorService,
    InventoryService,
    StockAlertService,
    PublicProductsPresenter,
    // 7. تصديره في حال احتجت استخدامه خارج الموديول
    InventoryIntegrationService,
    MongooseModule,
  ],
})
export class ProductsModule { }