import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationService } from './services/notification.service';

@Injectable()
export class NotificationsCronService {
  private readonly logger = new Logger(NotificationsCronService.name);

  constructor(private notificationService: NotificationService) {}

  /**
   * تنظيف Device Tokens غير النشطة يومياً في الساعة 3 صباحاً
   * يعطل tokens التي لم يتم استخدامها لمدة 30+ يوم
   */
  @Cron('0 3 * * *')
  async cleanupInactiveDeviceTokens() {
    this.logger.log('[Cron] Starting cleanup of inactive device tokens...');

    try {
      const cleanedCount = await this.notificationService.cleanupInactiveTokens(30);
      this.logger.log(
        `[Cron] Cleaned up ${cleanedCount} inactive device tokens (inactive for 30+ days)`,
      );
    } catch (error) {
      this.logger.error('[Cron] Error cleaning up inactive device tokens:', error);
    }
  }

  /**
   * تنظيف Device Tokens غير المستخدمة أسبوعياً كل يوم أحد في الساعة 2 صباحاً
   * يعطل tokens التي تم إنشاؤها ولكن لم يتم استخدامها أبداً لمدة 7+ يوم
   */
  @Cron('0 2 * * 0')
  async cleanupUnusedDeviceTokens() {
    this.logger.log('[Cron] Starting cleanup of unused device tokens...');

    try {
      const cleanedCount = await this.notificationService.cleanupUnusedTokens(7);
      this.logger.log(
        `[Cron] Cleaned up ${cleanedCount} unused device tokens (created 7+ days ago but never used)`,
      );
    } catch (error) {
      this.logger.error('[Cron] Error cleaning up unused device tokens:', error);
    }
  }

  /**
   * حذف الإشعارات القديمة المقروءة أسبوعياً كل يوم أحد في الساعة 4 صباحاً
   * يحذف الإشعارات المقروءة الأقدم من 90 يوم
   */
  @Cron('0 4 * * 0')
  async cleanupOldNotifications() {
    this.logger.log('[Cron] Starting cleanup of old notifications...');

    try {
      const deletedCount = await this.notificationService.deleteOldNotifications(90);
      this.logger.log(
        `[Cron] Deleted ${deletedCount} old notifications (read notifications older than 90 days)`,
      );
    } catch (error) {
      this.logger.error('[Cron] Error cleaning up old notifications:', error);
    }
  }
}

