import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AnalyticsService } from '../analytics.service';
import { StockAlertService } from '../../products/services/stock-alert.service';
import { PeriodType } from '../schemas/analytics-snapshot.schema';

@Injectable()
export class AnalyticsCronService {
  private readonly logger = new Logger(AnalyticsCronService.name);

  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly stockAlertService: StockAlertService,
  ) {}

  /**
   * Generate daily analytics snapshot
   * Runs every day at midnight
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateDailyAnalytics() {
    try {
      this.logger.log('Starting daily analytics generation...');
      
      const today = new Date();
      await this.analyticsService.generateAnalyticsSnapshot(today, PeriodType.DAILY);
      
      this.logger.log('Daily analytics generated successfully');
    } catch (error) {
      this.logger.error('Failed to generate daily analytics:', error);
    }
  }

  /**
   * Generate weekly analytics snapshot
   * Runs every Sunday at midnight
   */
  @Cron('0 0 * * 0')
  async generateWeeklyAnalytics() {
    try {
      this.logger.log('Starting weekly analytics generation...');
      
      const today = new Date();
      await this.analyticsService.generateAnalyticsSnapshot(today, PeriodType.WEEKLY);
      
      this.logger.log('Weekly analytics generated successfully');
    } catch (error) {
      this.logger.error('Failed to generate weekly analytics:', error);
    }
  }

  /**
   * Generate monthly analytics snapshot
   * Runs on the 1st of every month at midnight
   */
  @Cron('0 0 1 * *')
  async generateMonthlyAnalytics() {
    try {
      this.logger.log('Starting monthly analytics generation...');
      
      const today = new Date();
      await this.analyticsService.generateAnalyticsSnapshot(today, PeriodType.MONTHLY);
      
      this.logger.log('Monthly analytics generated successfully');
    } catch (error) {
      this.logger.error('Failed to generate monthly analytics:', error);
    }
  }

  /**
   * Check for low stock alerts
   * Runs every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async checkLowStockAlerts() {
    try {
      this.logger.log('Checking for low stock alerts...');
      
      await this.stockAlertService.checkLowStockAlerts();
      await this.stockAlertService.checkOutOfStockAlerts();
      
      this.logger.log('Low stock alerts check completed');
    } catch (error) {
      this.logger.error('Failed to check low stock alerts:', error);
    }
  }

  /**
   * Clear old analytics cache
   * Runs every 6 hours
   */
  @Cron('0 */6 * * *')
  async clearOldAnalyticsCache() {
    try {
      this.logger.log('Clearing old analytics cache...');
      
      await this.analyticsService.clearAnalyticsCaches();
      
      this.logger.log('Analytics cache cleared successfully');
    } catch (error) {
      this.logger.error('Failed to clear analytics cache:', error);
    }
  }

  /**
   * Generate quarterly analytics snapshot
   * Runs on the 1st of January, April, July, October at midnight
   */
  @Cron('0 0 1 1,4,7,10 *')
  async generateQuarterlyAnalytics() {
    try {
      this.logger.log('Starting quarterly analytics generation...');
      
      const today = new Date();
      await this.analyticsService.generateAnalyticsSnapshot(today, PeriodType.QUARTERLY);
      
      this.logger.log('Quarterly analytics generated successfully');
    } catch (error) {
      this.logger.error('Failed to generate quarterly analytics:', error);
    }
  }

  /**
   * Generate yearly analytics snapshot
   * Runs on January 1st at midnight
   */
  @Cron('0 0 1 1 *')
  async generateYearlyAnalytics() {
    try {
      this.logger.log('Starting yearly analytics generation...');
      
      const today = new Date();
      await this.analyticsService.generateAnalyticsSnapshot(today, PeriodType.YEARLY);
      
      this.logger.log('Yearly analytics generated successfully');
    } catch (error) {
      this.logger.error('Failed to generate yearly analytics:', error);
    }
  }

  /**
   * Health check for analytics system
   * Runs every 30 minutes
   */
  @Cron('0 */30 * * * *')
  async analyticsHealthCheck() {
    try {
      this.logger.log('Running analytics health check...');
      
      // Check if analytics service is responsive
      const cacheStats = await this.analyticsService.getCacheStats();
      
      this.logger.log(`Analytics health check passed. Cache stats: ${JSON.stringify(cacheStats)}`);
    } catch (error) {
      this.logger.error('Analytics health check failed:', error);
    }
  }
}
