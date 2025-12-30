import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BackupsService } from './backups.service';
import { SystemSettingsService } from '../system-settings/system-settings.service';

@Injectable()
export class BackupsCronService {
  private readonly logger = new Logger(BackupsCronService.name);

  constructor(
    private readonly backupsService: BackupsService,
    private readonly systemSettingsService: SystemSettingsService,
  ) {}

  /**
   * نسخ احتياطي يومي في الساعة 3 صباحاً
   */
  @Cron('0 3 * * *')
  async dailyBackup() {
    const enabled = await this.isBackupEnabled('daily');
    if (!enabled) {
      this.logger.debug('Daily backup is disabled');
      return;
    }

    this.logger.log('[Cron] Starting daily backup...');
    try {
      await this.backupsService.createAutomaticBackup();
      this.logger.log('[Cron] Daily backup completed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('[Cron] Daily backup failed:', errorMessage);
    }
  }

  /**
   * نسخ احتياطي أسبوعي يوم الأحد في الساعة 2 صباحاً
   */
  @Cron('0 2 * * 0')
  async weeklyBackup() {
    const enabled = await this.isBackupEnabled('weekly');
    if (!enabled) {
      this.logger.debug('Weekly backup is disabled');
      return;
    }

    this.logger.log('[Cron] Starting weekly backup...');
    try {
      await this.backupsService.createAutomaticBackup();
      this.logger.log('[Cron] Weekly backup completed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('[Cron] Weekly backup failed:', errorMessage);
    }
  }

  /**
   * نسخ احتياطي شهري في اليوم الأول من الشهر في الساعة 1 صباحاً
   */
  @Cron('0 1 1 * *')
  async monthlyBackup() {
    const enabled = await this.isBackupEnabled('monthly');
    if (!enabled) {
      this.logger.debug('Monthly backup is disabled');
      return;
    }

    this.logger.log('[Cron] Starting monthly backup...');
    try {
      await this.backupsService.createAutomaticBackup();
      this.logger.log('[Cron] Monthly backup completed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('[Cron] Monthly backup failed:', errorMessage);
    }
  }

  /**
   * التحقق من تفعيل النسخ الاحتياطي من إعدادات النظام
   */
  private async isBackupEnabled(
    type: 'daily' | 'weekly' | 'monthly',
  ): Promise<boolean> {
    try {
      const setting = await this.systemSettingsService.getSetting(
        `backup_${type}_enabled`,
      );
      return setting?.value === true || setting?.value === 'true';
    } catch {
      // إذا لم يكن الإعداد موجوداً، نفعّل النسخ الاحتياطي افتراضياً
      return true;
    }
  }
}

