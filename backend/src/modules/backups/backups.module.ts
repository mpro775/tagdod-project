import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BackupsController } from './backups.controller';
import { BackupsService } from './backups.service';
import { BackupsCronService } from './backups.cron';
import { Backup, BackupSchema } from './schemas/backup.schema';
import { SystemSettingsModule } from '../system-settings/system-settings.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Backup.name, schema: BackupSchema },
    ]),
    SystemSettingsModule,
    AnalyticsModule, // للحصول على FileStorageService
    forwardRef(() => AuthModule), // للحصول على JwtAuthGuard
  ],
  controllers: [BackupsController],
  providers: [BackupsService, BackupsCronService],
  exports: [BackupsService],
})
export class BackupsModule {}

