import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Banner, BannerSchema } from './schemas/banner.schema';
import { PriceRule, PriceRuleSchema } from '../promotions/schemas/price-rule.schema';
import { BannersService } from './banners.service';
import { BannersAdminController } from './banners.admin.controller';
import { BannersPublicController } from './banners.public.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Banner.name, schema: BannerSchema },
      { name: PriceRule.name, schema: PriceRuleSchema },
    ]),
  ],
  controllers: [BannersAdminController, BannersPublicController],
  providers: [BannersService],
  exports: [BannersService],
})
export class BannersModule {}

