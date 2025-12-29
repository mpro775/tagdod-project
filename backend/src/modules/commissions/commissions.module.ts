import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EngineerProfile, EngineerProfileSchema } from '../users/schemas/engineer-profile.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Coupon, CouponSchema } from '../marketing/schemas/coupon.schema';
import { Order, OrderSchema } from '../checkout/schemas/order.schema';
import { CommissionsReportsService } from './commissions-reports.service';
import { CommissionsReportsAdminController } from './commissions-reports.admin.controller';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EngineerProfile.name, schema: EngineerProfileSchema },
      { name: User.name, schema: UserSchema },
      { name: Coupon.name, schema: CouponSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    AuthModule,
    SharedModule,
  ],
  controllers: [CommissionsReportsAdminController],
  providers: [CommissionsReportsService],
  exports: [CommissionsReportsService],
})
export class CommissionsModule {}

