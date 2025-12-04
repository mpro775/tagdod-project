import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationService } from './services/notification.service';
import { NotificationQueueService } from './queue/notification-queue.service';

@Injectable()
export class NotificationsCronService {
  private readonly logger = new Logger(NotificationsCronService.name);

  constructor(
    private notificationService: NotificationService,
    private queueService: NotificationQueueService,
  ) {}

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

  // ===== Queue Management Cron Jobs =====

  /**
   * معالجة الإشعارات المجدولة كل دقيقة
   * يتحقق من الإشعارات التي حان وقت إرسالها ويضيفها للـ Queue
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledNotifications() {
    try {
      const processedCount = await this.notificationService.processScheduledNotifications();
      if (processedCount > 0) {
        this.logger.log(`[Cron] Processed ${processedCount} scheduled notifications`);
      }
    } catch (error) {
      this.logger.error('[Cron] Error processing scheduled notifications:', error);
    }
  }

  /**
   * إعادة محاولة الإشعارات الفاشلة كل 5 دقائق
   * يجمع الإشعارات الفاشلة ويضيفها لـ retry queue
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async retryFailedNotifications() {
    try {
      const retriedCount = await this.notificationService.retryFailedNotifications(50);
      if (retriedCount > 0) {
        this.logger.log(`[Cron] Queued ${retriedCount} failed notifications for retry`);
      }
    } catch (error) {
      this.logger.error('[Cron] Error retrying failed notifications:', error);
    }
  }

  /**
   * تنظيف الـ Queue من الـ Jobs القديمة كل ساعة
   */
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupQueueJobs() {
    this.logger.log('[Cron] Starting cleanup of old queue jobs...');

    try {
      await this.queueService.cleanOldJobs(3600000); // 1 hour
      this.logger.log('[Cron] Cleaned up old queue jobs');
    } catch (error) {
      this.logger.error('[Cron] Error cleaning up queue jobs:', error);
    }
  }

  /**
   * تسجيل إحصائيات الـ Queue كل 10 دقائق (للمراقبة)
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async logQueueStats() {
    try {
      const stats = await this.queueService.getQueueStats();
      const totalPending = await this.queueService.getPendingCount();
      
      if (totalPending > 0) {
        this.logger.log(
          `[Cron] Queue Stats - Pending: ${totalPending}, ` +
          `Send: ${JSON.stringify(stats.send)}, ` +
          `Scheduled: ${JSON.stringify(stats.scheduled)}, ` +
          `Retry: ${JSON.stringify(stats.retry)}`,
        );
      }
    } catch (error) {
      this.logger.error('[Cron] Error logging queue stats:', error);
    }
  }
}

