import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductService } from './services/product.service';
import { VariantService } from './services/variant.service';
import { PricingService } from './services/pricing.service';
import { InventoryService } from './services/inventory.service';
import { StockAlertService } from './services/stock-alert.service';
import { ProductsController } from './controllers/products.controller';
import { PublicProductsController } from './controllers/public-products.controller';
import { Product, ProductSchema } from './schemas/product.schema';
import { Variant, VariantSchema } from './schemas/variant.schema';
import { CacheModule } from '../../shared/cache/cache.module';
import { AttributesModule } from '../attributes/attributes.module';
import { CategoriesModule } from '../categories/categories.module';
import { ExchangeRatesModule } from '../exchange-rates/exchange-rates.module';
import { User, UserSchema } from '../users/schemas/user.schema';
import { AuthModule } from '../auth/auth.module';
import { NotificationsCompleteModule } from '../notifications/notifications-complete.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Variant.name, schema: VariantSchema },
      { name: User.name, schema: UserSchema },
    ]),
    CacheModule,
    AttributesModule,
    CategoriesModule,
    ExchangeRatesModule,
    NotificationsCompleteModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [
    ProductsController,
    PublicProductsController,
  ],
  providers: [
    ProductService,
    VariantService,
    PricingService,
    InventoryService,
    StockAlertService,
  ],
  exports: [
    ProductService,
    VariantService,
    PricingService,
    InventoryService,
    StockAlertService,
    MongooseModule
  ],
})
export class ProductsModule {}

