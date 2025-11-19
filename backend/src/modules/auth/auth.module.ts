import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { OtpService } from './otp.service';
import { TokensService } from './tokens.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Capabilities, CapabilitiesSchema } from '../capabilities/schemas/capabilities.schema';
import { FavoritesModule } from '../favorites/favorites.module';
import { SharedModule } from '../../shared/shared.module';
import { BiometricService } from './biometric.service';
import { NotificationsCompleteModule } from '../notifications/notifications-complete.module';

@Module({
  imports: [
    forwardRef(() => FavoritesModule),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Capabilities.name, schema: CapabilitiesSchema },
    ]),
    SharedModule,
    NotificationsCompleteModule, // Import notifications module to access SMSAdapter
  ],
  controllers: [AuthController],
  providers: [OtpService, TokensService, JwtAuthGuard, OptionalJwtAuthGuard, BiometricService],
  exports: [TokensService, JwtAuthGuard, OptionalJwtAuthGuard, MongooseModule],
})
export class AuthModule {}
