import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExchangeRate, ExchangeRateSchema } from './schemas/exchange-rate.schema';
import { ExchangeRateSyncJob, ExchangeRateSyncJobSchema } from './schemas/exchange-rate-sync-job.schema';
import { ExchangeRatesService } from './exchange-rates.service';
import { ExchangeRatesController } from './exchange-rates.controller';
import { AdminExchangeRatesController } from './admin-exchange-rates.controller';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../../shared/shared.module';
import { ExchangeRateSyncService } from './exchange-rate-sync.service';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { Variant, VariantSchema } from '../products/schemas/variant.schema';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExchangeRate.name, schema: ExchangeRateSchema },
      { name: ExchangeRateSyncJob.name, schema: ExchangeRateSyncJobSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Variant.name, schema: VariantSchema },
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => ProductsModule),
    SharedModule,
  ],
  controllers: [
    ExchangeRatesController,
    AdminExchangeRatesController,
  ],
  providers: [ExchangeRatesService, ExchangeRateSyncService],
  exports: [ExchangeRatesService, ExchangeRateSyncService],
})
export class ExchangeRatesModule {}
