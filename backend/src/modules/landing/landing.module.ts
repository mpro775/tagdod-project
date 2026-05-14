import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LandingService } from './landing.service';
import { LandingAdminController } from './landing.admin.controller';
import { LandingPublicController } from './landing.public.controller';
import { LandingSettings, LandingSettingsSchema } from './schemas/landing-settings.schema';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: LandingSettings.name, schema: LandingSettingsSchema }]),
    forwardRef(() => AuthModule),
    SharedModule,
  ],
  controllers: [LandingAdminController, LandingPublicController],
  providers: [LandingService],
  exports: [LandingService, MongooseModule],
})
export class LandingModule {}
