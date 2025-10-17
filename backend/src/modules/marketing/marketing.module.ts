import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketingService } from './marketing.service';
import { MarketingAdminController } from './admin.controller';
import { MarketingPublicController } from './public.controller';
import { AuthModule } from '../auth/auth.module';

// Schemas
import { PriceRule, PriceRuleSchema } from './schemas/price-rule.schema';
import { Coupon, CouponSchema } from './schemas/coupon.schema';
import { Banner, BannerSchema } from './schemas/banner.schema';
import { VariantPrice, VariantPriceSchema } from '../catalog/schemas/variant-price.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PriceRule.name, schema: PriceRuleSchema },
      { name: Coupon.name, schema: CouponSchema },
      { name: Banner.name, schema: BannerSchema },
      { name: VariantPrice.name, schema: VariantPriceSchema },
    ]),
    AuthModule,
  ],
  controllers: [MarketingAdminController, MarketingPublicController],
  providers: [MarketingService],
  exports: [MongooseModule, MarketingService],
})
export class MarketingModule {}
