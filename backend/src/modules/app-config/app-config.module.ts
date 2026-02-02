import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfigService } from './app-config.service';
import { AppConfigController } from './app-config.controller';
import { AppConfigAdminController } from './app-config.admin.controller';
import { AppVersionGuard } from './app-version.guard';
import {
  AppVersionPolicy,
  AppVersionPolicySchema,
} from './schemas/app-version-policy.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AppVersionPolicy.name, schema: AppVersionPolicySchema },
    ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [AppConfigController, AppConfigAdminController],
  providers: [AppConfigService, AppVersionGuard],
  exports: [AppConfigService, AppVersionGuard],
})
export class AppConfigModule {}
