import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PromotionsService } from './promotions.service';
import { PromotionsAdminController } from './admin.controller';
import { PromotionsPublicController } from './public.controller';
import { PriceRule, PriceRuleSchema } from './schemas/price-rule.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PriceRule.name, schema: PriceRuleSchema },
    ]),
    AuthModule,
  ],
  controllers: [PromotionsAdminController, PromotionsPublicController],
  providers: [PromotionsService],
  exports: [MongooseModule, PromotionsService],
})
export class PromotionsModule {}
