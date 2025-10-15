import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Banner, BannerSchema } from './schemas/banner.schema';
import { PriceRule, PriceRuleSchema } from '../promotions/schemas/price-rule.schema';
import { BannersService } from './banners.service';
import { BannersAdminController } from './banners.admin.controller';
import { BannersPublicController } from './banners.public.controller';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Banner.name, schema: BannerSchema },
      { name: PriceRule.name, schema: PriceRuleSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuthModule,
  ],
  controllers: [BannersAdminController, BannersPublicController],
  providers: [BannersService],
  exports: [BannersService],
})
export class BannersModule {}

