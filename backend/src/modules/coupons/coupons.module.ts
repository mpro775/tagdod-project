import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Coupon, CouponSchema } from './schemas/coupon.schema';
import { CouponsService } from './coupons.service';
import { CouponsAdminController } from './coupons.admin.controller';
import { CouponsPublicController } from './coupons.public.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Coupon.name, schema: CouponSchema },
    ]),
  ],
  controllers: [CouponsAdminController, CouponsPublicController],
  providers: [CouponsService],
  exports: [CouponsService],
})
export class CouponsModule {}

