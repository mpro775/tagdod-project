import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PricingService } from './pricing.service';
import { PricingController } from './pricing.controller';
import { PriceRule, PriceRuleSchema } from '../promotions/schemas/price-rule.schema';
import { VariantPrice, VariantPriceSchema } from '../catalog/schemas/variant-price.schema';
import { Variant, VariantSchema } from '../catalog/schemas/variant.schema';
import { Product, ProductSchema } from '../catalog/schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PriceRule.name, schema: PriceRuleSchema },
      { name: VariantPrice.name, schema: VariantPriceSchema },
      { name: Variant.name, schema: VariantSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [PricingController],
  providers: [PricingService],
  exports: [PricingService],
})
export class PricingModule {}

