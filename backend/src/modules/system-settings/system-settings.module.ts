import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SystemSettingsController } from './system-settings.controller';
import { SystemSettingsService } from './system-settings.service';
import { SystemSetting, SystemSettingSchema } from './schemas/system-setting.schema';
import { LocalPaymentAccount, LocalPaymentAccountSchema } from './schemas/local-payment-account.schema';
import { LocalPaymentAccountService } from './services/local-payment-account.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SystemSetting.name, schema: SystemSettingSchema },
      { name: LocalPaymentAccount.name, schema: LocalPaymentAccountSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => AuthModule),
    SharedModule,
  ],
  controllers: [SystemSettingsController],
  providers: [SystemSettingsService, LocalPaymentAccountService],
  exports: [SystemSettingsService, LocalPaymentAccountService],
})
export class SystemSettingsModule {}

