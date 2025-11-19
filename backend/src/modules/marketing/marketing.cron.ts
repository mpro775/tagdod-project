import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MarketingService } from './marketing.service';

@Injectable()
export class MarketingCronService {
  private readonly logger = new Logger(MarketingCronService.name);

  constructor(private marketingService: MarketingService) {}

  /**
   * Deactivate expired banners every hour
   * Checks for banners that have passed their endDate and sets isActive to false
   */
  @Cron(CronExpression.EVERY_HOUR)
  async deactivateExpiredBanners() {
    this.logger.log('[Cron] Checking for expired banners...');

    try {
      const result = await this.marketingService.deactivateExpiredBanners();
      this.logger.log(
        `[Cron] Deactivated ${result.deactivated} expired banners`,
      );
    } catch (error) {
      this.logger.error('[Cron] Error deactivating expired banners:', error);
    }
  }
}

