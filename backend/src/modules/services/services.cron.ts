import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ServicesService } from './services.service';

@Injectable()
export class ServicesCronService {
  private readonly logger = new Logger(ServicesCronService.name);

  constructor(private servicesService: ServicesService) {}

  /**
   * فحص الطلبات والعروض المنتهية الصلاحية يومياً في الساعة 2 صباحاً
   * الطلبات: إذا كانت OPEN أو OFFERS_COLLECTING ولم يتم قبول أي عرض لمدة 5 أيام → CANCELLED
   * العروض: إذا كانت OFFERED ولم يتم قبولها لمدة 5 أيام → EXPIRED
   */
  @Cron('0 2 * * *')
  async expireOldRequestsAndOffers() {
    this.logger.log('[Cron] Checking for expired service requests and offers...');

    try {
      const result = await this.servicesService.expireOldRequestsAndOffers();
      this.logger.log(
        `[Cron] Expired ${result.expiredRequests} requests and ${result.expiredOffers} offers`,
      );
    } catch (error) {
      this.logger.error('[Cron] Error expiring old requests and offers:', error);
    }
  }

  /**
   * تصفير العدادات الشهرية للإلغاءات في أول كل شهر في منتصف الليل
   */
  @Cron('0 0 1 * *')
  async resetMonthlyCancellationCounts() {
    this.logger.log('[Cron] Resetting monthly cancellation counts...');

    try {
      const result = await this.servicesService.resetMonthlyCancellationCounts();
      this.logger.log(`[Cron] Reset cancellation counts for ${result.resetCount} users`);
    } catch (error) {
      this.logger.error('[Cron] Error resetting monthly cancellation counts:', error);
    }
  }
}

