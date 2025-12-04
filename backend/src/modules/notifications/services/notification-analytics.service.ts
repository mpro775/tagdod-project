import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  UnifiedNotification,
  UnifiedNotificationDocument,
} from '../schemas/unified-notification.schema';
import { NotificationLog, NotificationLogDocument } from '../schemas/notification-log.schema';
import { NotificationStatus } from '../enums/notification.enums';

// Analytics filter interface
export interface AnalyticsFilter {
  startDate?: Date;
  endDate?: Date;
  type?: string;
  channel?: string;
  status?: string;
  campaign?: string;
}

// CTR result interface
export interface CTRResult {
  period: string;
  sent: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
  ctr: number; // Click-through rate (clicked / opened)
}

// Conversion result interface
export interface ConversionResult {
  period: string;
  sent: number;
  converted: number;
  conversionRate: number;
  totalValue: number;
  avgValue: number;
}

// Performance by type/channel
export interface PerformanceResult {
  category: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  deliveryRate: number;
  openRate: number;
  ctr: number;
  conversionRate: number;
}

@Injectable()
export class NotificationAnalyticsService {
  private readonly logger = new Logger(NotificationAnalyticsService.name);

  constructor(
    @InjectModel(UnifiedNotification.name)
    private readonly notificationModel: Model<UnifiedNotificationDocument>,
    @InjectModel(NotificationLog.name)
    private readonly logModel: Model<NotificationLogDocument>,
  ) {}

  // ===== Tracking Methods =====

  /**
   * Track notification open event
   */
  async trackOpen(trackingId: string): Promise<void> {
    try {
      const result = await this.notificationModel.updateOne(
        { trackingId },
        {
          $set: {
            status: NotificationStatus.READ,
            readAt: new Date(),
          },
          $inc: { openCount: 1 },
        },
      );

      if (result.modifiedCount > 0) {
        this.logger.debug(`Tracked open for notification: ${trackingId}`);
      }

      // Also update log if exists
      await this.logModel.updateOne(
        { trackingId },
        {
          $set: {
            'interaction.opened': true,
            'interaction.lastInteractionAt': new Date(),
          },
          $inc: { 'interaction.clickCount': 0 }, // Trigger update
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to track open for ${trackingId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Track notification click event
   */
  async trackClick(
    trackingId: string,
    url?: string,
    buttonId?: string,
  ): Promise<void> {
    try {
      const clickData = {
        url: url || '',
        buttonId,
        clickedAt: new Date(),
      };

      const result = await this.notificationModel.updateOne(
        { trackingId },
        {
          $set: {
            clickedAt: new Date(),
          },
          $inc: { clickCount: 1 },
          $push: { clickHistory: clickData },
        },
      );

      if (result.modifiedCount > 0) {
        this.logger.debug(`Tracked click for notification: ${trackingId}, url: ${url}`);
      }

      // Also update log if exists
      await this.logModel.updateOne(
        { trackingId },
        {
          $set: {
            'interaction.clicked': true,
            'interaction.lastInteractionAt': new Date(),
          },
          $inc: { 'interaction.clickCount': 1 },
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to track click for ${trackingId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Track conversion event
   */
  async trackConversion(
    trackingId: string,
    value?: number,
    type?: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    try {
      const result = await this.notificationModel.updateOne(
        { trackingId },
        {
          $set: {
            'metadata.converted': true,
            'metadata.conversionValue': value,
            'metadata.conversionType': type,
            'metadata.conversionAt': new Date(),
            'metadata.conversionMetadata': metadata,
          },
        },
      );

      if (result.modifiedCount > 0) {
        this.logger.debug(
          `Tracked conversion for notification: ${trackingId}, value: ${value}`,
        );
      }

      // Also update log if exists
      await this.logModel.updateOne(
        { trackingId },
        {
          $set: {
            'interaction.converted': true,
            'interaction.conversionValue': value,
            'interaction.lastInteractionAt': new Date(),
          },
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to track conversion for ${trackingId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Track notification dismissal
   */
  async trackDismiss(trackingId: string): Promise<void> {
    try {
      await this.notificationModel.updateOne(
        { trackingId },
        {
          $set: {
            'metadata.dismissed': true,
            'metadata.dismissedAt': new Date(),
          },
        },
      );

      this.logger.debug(`Tracked dismissal for notification: ${trackingId}`);
    } catch (error) {
      this.logger.error(
        `Failed to track dismissal for ${trackingId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // ===== Analytics Methods =====

  /**
   * Get Click-Through Rate statistics
   */
  async getClickThroughRate(filter: AnalyticsFilter): Promise<CTRResult[]> {
    const matchStage = this.buildMatchStage(filter);
    const groupBy = this.getGroupByPeriod(filter);

    const results = await this.notificationModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupBy,
          sent: { $sum: 1 },
          opened: {
            $sum: { $cond: [{ $gt: ['$openCount', 0] }, 1, 0] },
          },
          clicked: {
            $sum: { $cond: [{ $gt: ['$clickCount', 0] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return results.map((r) => ({
      period: r._id,
      sent: r.sent,
      opened: r.opened,
      clicked: r.clicked,
      openRate: r.sent > 0 ? (r.opened / r.sent) * 100 : 0,
      clickRate: r.sent > 0 ? (r.clicked / r.sent) * 100 : 0,
      ctr: r.opened > 0 ? (r.clicked / r.opened) * 100 : 0,
    }));
  }

  /**
   * Get Conversion Rate statistics
   */
  async getConversionRate(filter: AnalyticsFilter): Promise<ConversionResult[]> {
    const matchStage = this.buildMatchStage(filter);
    const groupBy = this.getGroupByPeriod(filter);

    const results = await this.notificationModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupBy,
          sent: { $sum: 1 },
          converted: {
            $sum: { $cond: [{ $eq: ['$metadata.converted', true] }, 1, 0] },
          },
          totalValue: {
            $sum: { $ifNull: ['$metadata.conversionValue', 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return results.map((r) => ({
      period: r._id,
      sent: r.sent,
      converted: r.converted,
      conversionRate: r.sent > 0 ? (r.converted / r.sent) * 100 : 0,
      totalValue: r.totalValue,
      avgValue: r.converted > 0 ? r.totalValue / r.converted : 0,
    }));
  }

  /**
   * Get Performance by Type
   */
  async getPerformanceByType(filter: AnalyticsFilter): Promise<PerformanceResult[]> {
    const matchStage = this.buildMatchStage(filter);

    const results = await this.notificationModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          sent: { $sum: 1 },
          delivered: {
            $sum: {
              $cond: [
                { $in: ['$status', [NotificationStatus.SENT, NotificationStatus.READ]] },
                1,
                0,
              ],
            },
          },
          opened: {
            $sum: { $cond: [{ $gt: ['$openCount', 0] }, 1, 0] },
          },
          clicked: {
            $sum: { $cond: [{ $gt: ['$clickCount', 0] }, 1, 0] },
          },
          converted: {
            $sum: { $cond: [{ $eq: ['$metadata.converted', true] }, 1, 0] },
          },
        },
      },
      { $sort: { sent: -1 } },
    ]);

    return results.map((r) => ({
      category: r._id,
      sent: r.sent,
      delivered: r.delivered,
      opened: r.opened,
      clicked: r.clicked,
      converted: r.converted,
      deliveryRate: r.sent > 0 ? (r.delivered / r.sent) * 100 : 0,
      openRate: r.delivered > 0 ? (r.opened / r.delivered) * 100 : 0,
      ctr: r.opened > 0 ? (r.clicked / r.opened) * 100 : 0,
      conversionRate: r.sent > 0 ? (r.converted / r.sent) * 100 : 0,
    }));
  }

  /**
   * Get Performance by Channel
   */
  async getPerformanceByChannel(filter: AnalyticsFilter): Promise<PerformanceResult[]> {
    const matchStage = this.buildMatchStage(filter);

    const results = await this.notificationModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$channel',
          sent: { $sum: 1 },
          delivered: {
            $sum: {
              $cond: [
                { $in: ['$status', [NotificationStatus.SENT, NotificationStatus.READ]] },
                1,
                0,
              ],
            },
          },
          opened: {
            $sum: { $cond: [{ $gt: ['$openCount', 0] }, 1, 0] },
          },
          clicked: {
            $sum: { $cond: [{ $gt: ['$clickCount', 0] }, 1, 0] },
          },
          converted: {
            $sum: { $cond: [{ $eq: ['$metadata.converted', true] }, 1, 0] },
          },
        },
      },
      { $sort: { sent: -1 } },
    ]);

    return results.map((r) => ({
      category: r._id,
      sent: r.sent,
      delivered: r.delivered,
      opened: r.opened,
      clicked: r.clicked,
      converted: r.converted,
      deliveryRate: r.sent > 0 ? (r.delivered / r.sent) * 100 : 0,
      openRate: r.delivered > 0 ? (r.opened / r.delivered) * 100 : 0,
      ctr: r.opened > 0 ? (r.clicked / r.opened) * 100 : 0,
      conversionRate: r.sent > 0 ? (r.converted / r.sent) * 100 : 0,
    }));
  }

  /**
   * Get Advanced Analytics Summary
   */
  async getAdvancedStats(filter: AnalyticsFilter): Promise<{
    overview: {
      totalSent: number;
      totalDelivered: number;
      totalOpened: number;
      totalClicked: number;
      totalConverted: number;
      overallDeliveryRate: number;
      overallOpenRate: number;
      overallCTR: number;
      overallConversionRate: number;
    };
    topPerformingTypes: PerformanceResult[];
    recentTrend: CTRResult[];
  }> {
    const matchStage = this.buildMatchStage(filter);

    // Overview aggregation
    const overview = await this.notificationModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalSent: { $sum: 1 },
          totalDelivered: {
            $sum: {
              $cond: [
                { $in: ['$status', [NotificationStatus.SENT, NotificationStatus.READ]] },
                1,
                0,
              ],
            },
          },
          totalOpened: {
            $sum: { $cond: [{ $gt: ['$openCount', 0] }, 1, 0] },
          },
          totalClicked: {
            $sum: { $cond: [{ $gt: ['$clickCount', 0] }, 1, 0] },
          },
          totalConverted: {
            $sum: { $cond: [{ $eq: ['$metadata.converted', true] }, 1, 0] },
          },
        },
      },
    ]);

    const stats = overview[0] || {
      totalSent: 0,
      totalDelivered: 0,
      totalOpened: 0,
      totalClicked: 0,
      totalConverted: 0,
    };

    // Get top performing types
    const topPerformingTypes = await this.getPerformanceByType(filter);

    // Get recent trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentTrend = await this.getClickThroughRate({
      ...filter,
      startDate: sevenDaysAgo,
    });

    return {
      overview: {
        ...stats,
        overallDeliveryRate: stats.totalSent > 0
          ? (stats.totalDelivered / stats.totalSent) * 100
          : 0,
        overallOpenRate: stats.totalDelivered > 0
          ? (stats.totalOpened / stats.totalDelivered) * 100
          : 0,
        overallCTR: stats.totalOpened > 0
          ? (stats.totalClicked / stats.totalOpened) * 100
          : 0,
        overallConversionRate: stats.totalSent > 0
          ? (stats.totalConverted / stats.totalSent) * 100
          : 0,
      },
      topPerformingTypes: topPerformingTypes.slice(0, 5),
      recentTrend,
    };
  }

  // ===== Private Helper Methods =====

  private buildMatchStage(filter: AnalyticsFilter): Record<string, unknown> {
    const match: Record<string, unknown> = {};

    if (filter.startDate || filter.endDate) {
      match.createdAt = {};
      if (filter.startDate) {
        (match.createdAt as Record<string, Date>).$gte = filter.startDate;
      }
      if (filter.endDate) {
        (match.createdAt as Record<string, Date>).$lte = filter.endDate;
      }
    }

    if (filter.type) {
      match.type = filter.type;
    }

    if (filter.channel) {
      match.channel = filter.channel;
    }

    if (filter.status) {
      match.status = filter.status;
    }

    if (filter.campaign) {
      match['metadata.campaign'] = filter.campaign;
    }

    return match;
  }

  private getGroupByPeriod(filter: AnalyticsFilter): Record<string, unknown> {
    // Determine granularity based on date range
    const startDate = filter.startDate || new Date(0);
    const endDate = filter.endDate || new Date();
    const daysDiff = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysDiff <= 1) {
      // Hourly for single day
      return {
        $dateToString: { format: '%Y-%m-%d %H:00', date: '$createdAt' },
      };
    } else if (daysDiff <= 31) {
      // Daily for up to a month
      return {
        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
      };
    } else if (daysDiff <= 365) {
      // Weekly for up to a year
      return {
        $dateToString: { format: '%Y-W%V', date: '$createdAt' },
      };
    } else {
      // Monthly for longer periods
      return {
        $dateToString: { format: '%Y-%m', date: '$createdAt' },
      };
    }
  }
}

