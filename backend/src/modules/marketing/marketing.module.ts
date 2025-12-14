import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketingService } from './marketing.service';
import { MarketingAdminController } from './admin.controller';
import { MarketingPublicController } from './public.controller';
import { MarketingCronService } from './marketing.cron';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../../shared/shared.module';

// Schemas
import { PriceRule, PriceRuleSchema } from './schemas/price-rule.schema';
import { Coupon, CouponSchema } from './schemas/coupon.schema';
import { Banner, BannerSchema } from './schemas/banner.schema';
import { Variant, VariantSchema } from '../products/schemas/variant.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PriceRule.name, schema: PriceRuleSchema },
      { name: Coupon.name, schema: CouponSchema },
      { name: Banner.name, schema: BannerSchema },
      { name: Variant.name, schema: VariantSchema },
      { name: Product.name, schema: ProductSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => AuthModule),
    SharedModule,
  ],
  controllers: [MarketingAdminController, MarketingPublicController],
  providers: [MarketingService, MarketingCronService],
  exports: [MongooseModule, MarketingService],
})
export class MarketingModule {}
