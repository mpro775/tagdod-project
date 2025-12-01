import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { OtpService } from './otp.service';
import { TokensService } from './tokens.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard';
import { User, UserSchema } from '../users/schemas/user.schema';
import { EngineerProfile, EngineerProfileSchema } from '../users/schemas/engineer-profile.schema';
import { Capabilities, CapabilitiesSchema } from '../capabilities/schemas/capabilities.schema';
import { FavoritesModule } from '../favorites/favorites.module';
import { SharedModule } from '../../shared/shared.module';
import { BiometricService } from './biometric.service';
import { NotificationsCompleteModule } from '../notifications/notifications-complete.module';
import { EngineerProfileService } from '../users/services/engineer-profile.service';
import { ServiceRequest, ServiceRequestSchema } from '../services/schemas/service-request.schema';
import { Order, OrderSchema } from '../checkout/schemas/order.schema';
import { Coupon, CouponSchema } from '../marketing/schemas/coupon.schema';
import { ExchangeRatesModule } from '../exchange-rates/exchange-rates.module';

@Module({
  imports: [
    forwardRef(() => FavoritesModule),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: EngineerProfile.name, schema: EngineerProfileSchema },
      { name: Capabilities.name, schema: CapabilitiesSchema },
      { name: ServiceRequest.name, schema: ServiceRequestSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Coupon.name, schema: CouponSchema },
    ]),
    SharedModule,
    NotificationsCompleteModule, // Import notifications module to access SMSAdapter
    ExchangeRatesModule,
  ],
  controllers: [AuthController],
  providers: [OtpService, TokensService, JwtAuthGuard, OptionalJwtAuthGuard, BiometricService, EngineerProfileService],
  exports: [TokensService, JwtAuthGuard, OptionalJwtAuthGuard, MongooseModule],
})
export class AuthModule {}
