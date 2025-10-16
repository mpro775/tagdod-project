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
      // Process carts that have been inactive for 1 hour
      const result1h = await this.cartService.processAbandonedCarts(1);
      this.logger.log(
        `[Cron] 1h inactive: Processed ${result1h.processed} carts, sent ${result1h.emailsSent} emails`,
      );

      // Process carts that have been inactive for 24 hours (second reminder)
      const result24h = await this.cartService.processAbandonedCarts(24);
      this.logger.log(
        `[Cron] 24h inactive: Processed ${result24h.processed} carts, sent ${result24h.emailsSent} emails`,
      );

      // Process carts that have been inactive for 72 hours (final reminder)
      const result72h = await this.cartService.processAbandonedCarts(72);
      this.logger.log(
        `[Cron] 72h inactive: Processed ${result72h.processed} carts, sent ${result72h.emailsSent} emails`,
      );

      const totalProcessed = result1h.processed + result24h.processed + result72h.processed;
      const totalEmails = result1h.emailsSent + result24h.emailsSent + result72h.emailsSent;
      
      this.logger.log(
        `[Cron] Total: Processed ${totalProcessed} abandoned carts, sent ${totalEmails} emails`,
      );
    } catch (error) {
      this.logger.error('[Cron] Error processing abandoned carts:', error);
    }
  }

  /**
   * Mark carts as abandoned every 30 minutes
   */
  @Cron('*/30 * * * *')
  async markAbandonedCarts() {
    this.logger.log('[Cron] Marking abandoned carts...');

    try {
      const result = await this.cartService.markAbandonedCarts();
      this.logger.log(`[Cron] Marked ${result.marked} carts as abandoned`);
    } catch (error) {
      this.logger.error('[Cron] Error marking abandoned carts:', error);
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

