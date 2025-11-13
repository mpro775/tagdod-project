import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductService } from './services/product.service';
import { VariantService } from './services/variant.service';
import { PricingService } from './services/pricing.service';
import { ProductPricingCalculatorService } from './services/product-pricing-calculator.service';
import { InventoryService } from './services/inventory.service';
import { StockAlertService } from './services/stock-alert.service';
import { PublicProductsPresenter } from './services/public-products.presenter';
import { ProductsController } from './controllers/products.controller';
import { PublicProductsController } from './controllers/public-products.controller';
import { Product, ProductSchema } from './schemas/product.schema';
import { Variant, VariantSchema } from './schemas/variant.schema';
import { CacheModule } from '../../shared/cache/cache.module';
import { AttributesModule } from '../attributes/attributes.module';
import { CategoriesModule } from '../categories/categories.module';
import { ExchangeRatesModule } from '../exchange-rates/exchange-rates.module';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Capabilities, CapabilitiesSchema } from '../capabilities/schemas/capabilities.schema';
import { AuthModule } from '../auth/auth.module';
import { NotificationsCompleteModule } from '../notifications/notifications-complete.module';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Variant.name, schema: VariantSchema },
      { name: User.name, schema: UserSchema },
      { name: Capabilities.name, schema: CapabilitiesSchema },
    ]),
    CacheModule,
    AttributesModule,
    CategoriesModule,
    forwardRef(() => ExchangeRatesModule),
    NotificationsCompleteModule,
    forwardRef(() => AuthModule),
    SharedModule,
  ],
  controllers: [
    ProductsController,
    PublicProductsController,
  ],
  providers: [
    ProductService,
    VariantService,
    PricingService,
    ProductPricingCalculatorService,
    InventoryService,
    StockAlertService,
    PublicProductsPresenter,
  ],
  exports: [
    ProductService,
    VariantService,
    PricingService,
    ProductPricingCalculatorService,
    InventoryService,
    StockAlertService,
    PublicProductsPresenter,
    MongooseModule
  ],
})
export class ProductsModule {}

