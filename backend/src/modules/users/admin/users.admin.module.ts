import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersAdminController } from './users.admin.controller';
import { EngineerProfileAdminController } from './engineer-profile.admin.controller';
import { User, UserSchema } from '../schemas/user.schema';
import { EngineerProfile, EngineerProfileSchema } from '../schemas/engineer-profile.schema';
import { Capabilities, CapabilitiesSchema } from '../../capabilities/schemas/capabilities.schema';
import { ServiceRequest, ServiceRequestSchema } from '../../services/schemas/service-request.schema';
import { Order, OrderSchema } from '../../checkout/schemas/order.schema';
import { Coupon, CouponSchema } from '../../marketing/schemas/coupon.schema';
import { EngineerProfileService } from '../services/engineer-profile.service';
import { AuthModule } from '../../auth/auth.module';
import { SharedModule } from '../../../shared/shared.module';
import { NotificationsCompleteModule } from '../../notifications/notifications-complete.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: EngineerProfile.name, schema: EngineerProfileSchema },
      { name: Capabilities.name, schema: CapabilitiesSchema },
      { name: ServiceRequest.name, schema: ServiceRequestSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Coupon.name, schema: CouponSchema },
    ]),
    AuthModule,
    SharedModule,
    forwardRef(() => NotificationsCompleteModule),
  ],
  controllers: [UsersAdminController, EngineerProfileAdminController],
  providers: [EngineerProfileService],
  exports: [MongooseModule],
})
export class UsersAdminModule {}
