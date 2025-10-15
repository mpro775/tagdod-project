import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CartService } from './cart.service';

@Injectable()
export class CartCronService {
  private readonly logger = new Logger(CartCronService.name);

  constructor(private cartService: CartService) {}

  /**
   * Check for abandoned carts every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleAbandonedCarts() {
    this.logger.log('[Cron] Checking for abandoned carts...');

    try {
      const result = await this.cartService.processAbandonedCarts();
      
      this.logger.log(
        `[Cron] Processed ${result.processed} abandoned carts, sent ${result.emailsSent} emails`,
      );
    } catch (error) {
      this.logger.error('[Cron] Error processing abandoned carts:', error);
    }
  }

  /**
   * Cleanup expired carts daily at 2 AM
   */
  @Cron('0 2 * * *')
  async cleanupExpiredCarts() {
    this.logger.log('[Cron] Cleaning up expired carts...');

    try {
      const result = await this.cartService.cleanupExpiredCarts();
      this.logger.log(`[Cron] Deleted ${result.deleted} expired carts`);
    } catch (error) {
      this.logger.error('[Cron] Error cleaning up expired carts:', error);
    }
  }

  /**
   * Delete old converted carts weekly
   */
  @Cron(CronExpression.EVERY_WEEK)
  async cleanupOldConvertedCarts() {
    this.logger.log('[Cron] Cleaning up old converted carts...');

    try {
      const result = await this.cartService.deleteOldConvertedCarts(90); // 90 days
      this.logger.log(`[Cron] Deleted ${result.deleted} old converted carts`);
    } catch (error) {
      this.logger.error('[Cron] Error cleaning up converted carts:', error);
    }
  }
}

