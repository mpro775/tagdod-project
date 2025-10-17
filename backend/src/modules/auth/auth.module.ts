import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { OtpService } from './otp.service';
import { TokensService } from './tokens.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Capabilities, CapabilitiesSchema } from '../capabilities/schemas/capabilities.schema';
import { FavoritesModule } from '../favorites/favorites.module';

@Module({
  imports: [
    forwardRef(() => FavoritesModule),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Capabilities.name, schema: CapabilitiesSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [OtpService, TokensService],
  exports: [TokensService],
})
export class AuthModule {}
