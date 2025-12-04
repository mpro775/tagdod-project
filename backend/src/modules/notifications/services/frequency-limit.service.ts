import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Redis } from 'ioredis';
import { NotificationChannel } from '../enums/notification.enums';
import { FrequencyLog, FrequencyLogDocument } from '../schemas/frequency-log.schema';

// Frequency limit configuration
export interface FrequencyLimits {
  maxNotificationsPerDay?: number;
  maxEmailsPerWeek?: number;
  maxSmsPerMonth?: number;
  maxPushPerHour?: number;
}

// Check result
export interface FrequencyCheckResult {
  canSend: boolean;
  reason?: string;
  currentCount?: number;
  limit?: number;
  remainingTime?: number; // Seconds until limit resets
}

// User frequency status
export interface UserFrequencyStatus {
  userId: string;
  daily: { count: number; limit: number; remaining: number };
  push: { count: number; limit: number; remaining: number; resetsIn: number };
  email: { count: number; limit: number; remaining: number; resetsIn: number };
  sms: { count: number; limit: number; remaining: number; resetsIn: number };
}

// Redis key prefixes
const REDIS_PREFIX = 'freq:';
const TTL = {
  HOURLY: 3600, // 1 hour
  DAILY: 86400, // 24 hours
  WEEKLY: 604800, // 7 days
  MONTHLY: 2592000, // 30 days
};

@Injectable()
export class FrequencyLimitService {
  private readonly logger = new Logger(FrequencyLimitService.name);

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    @InjectModel(FrequencyLog.name)
    private readonly frequencyLogModel: Model<FrequencyLogDocument>,
  ) {}

  /**
   * Check if user can receive notification based on frequency limits
   */
  async checkLimit(
    userId: string,
    channel: NotificationChannel | string,
    limits: FrequencyLimits,
  ): Promise<FrequencyCheckResult> {
    try {
      // Check daily limit first
      if (limits.maxNotificationsPerDay) {
        const dailyKey = this.buildKey(userId, 'daily');
        const dailyCount = await this.getCount(dailyKey);
        
        if (dailyCount >= limits.maxNotificationsPerDay) {
          const ttl = await this.redis.ttl(dailyKey);
          return {
            canSend: false,
            reason: 'Daily notification limit exceeded',
            currentCount: dailyCount,
            limit: limits.maxNotificationsPerDay,
            remainingTime: ttl > 0 ? ttl : TTL.DAILY,
          };
        }
      }

      // Check channel-specific limits
      switch (channel) {
        case NotificationChannel.PUSH:
        case 'push':
          if (limits.maxPushPerHour) {
            const pushKey = this.buildKey(userId, 'push', 'hourly');
            const pushCount = await this.getCount(pushKey);
            
            if (pushCount >= limits.maxPushPerHour) {
              const ttl = await this.redis.ttl(pushKey);
              return {
                canSend: false,
                reason: 'Hourly push notification limit exceeded',
                currentCount: pushCount,
                limit: limits.maxPushPerHour,
                remainingTime: ttl > 0 ? ttl : TTL.HOURLY,
              };
            }
          }
          break;

        case NotificationChannel.EMAIL:
        case 'email':
          if (limits.maxEmailsPerWeek) {
            const emailKey = this.buildKey(userId, 'email', 'weekly');
            const emailCount = await this.getCount(emailKey);
            
            if (emailCount >= limits.maxEmailsPerWeek) {
              const ttl = await this.redis.ttl(emailKey);
              return {
                canSend: false,
                reason: 'Weekly email limit exceeded',
                currentCount: emailCount,
                limit: limits.maxEmailsPerWeek,
                remainingTime: ttl > 0 ? ttl : TTL.WEEKLY,
              };
            }
          }
          break;

        case NotificationChannel.SMS:
        case 'sms':
          if (limits.maxSmsPerMonth) {
            const smsKey = this.buildKey(userId, 'sms', 'monthly');
            const smsCount = await this.getCount(smsKey);
            
            if (smsCount >= limits.maxSmsPerMonth) {
              const ttl = await this.redis.ttl(smsKey);
              return {
                canSend: false,
                reason: 'Monthly SMS limit exceeded',
                currentCount: smsCount,
                limit: limits.maxSmsPerMonth,
                remainingTime: ttl > 0 ? ttl : TTL.MONTHLY,
              };
            }
          }
          break;
      }

      return { canSend: true };
    } catch (error) {
      this.logger.error(
        `Failed to check frequency limit for user ${userId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      // Allow sending on error to prevent blocking notifications
      return { canSend: true };
    }
  }

  /**
   * Increment counter after sending notification
   */
  async incrementCounter(
    userId: string,
    channel: NotificationChannel | string,
    templateKey?: string,
  ): Promise<void> {
    try {
      // Increment daily counter
      const dailyKey = this.buildKey(userId, 'daily');
      await this.incrementWithTTL(dailyKey, TTL.DAILY);

      // Increment channel-specific counter
      switch (channel) {
        case NotificationChannel.PUSH:
        case 'push':
          await this.incrementWithTTL(this.buildKey(userId, 'push', 'hourly'), TTL.HOURLY);
          break;

        case NotificationChannel.EMAIL:
        case 'email':
          await this.incrementWithTTL(this.buildKey(userId, 'email', 'weekly'), TTL.WEEKLY);
          break;

        case NotificationChannel.SMS:
        case 'sms':
          await this.incrementWithTTL(this.buildKey(userId, 'sms', 'monthly'), TTL.MONTHLY);
          break;
      }

      // Log to MongoDB for persistent history
      await this.logToMongoDB(userId, channel, templateKey);

      this.logger.debug(`Incremented frequency counter for user ${userId}, channel ${channel}`);
    } catch (error) {
      this.logger.error(
        `Failed to increment frequency counter: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Get user's current frequency status
   */
  async getUserLimitStatus(userId: string, limits: FrequencyLimits): Promise<UserFrequencyStatus> {
    try {
      const [dailyCount, pushCount, emailCount, smsCount] = await Promise.all([
        this.getCount(this.buildKey(userId, 'daily')),
        this.getCount(this.buildKey(userId, 'push', 'hourly')),
        this.getCount(this.buildKey(userId, 'email', 'weekly')),
        this.getCount(this.buildKey(userId, 'sms', 'monthly')),
      ]);

      const [pushTTL, emailTTL, smsTTL] = await Promise.all([
        this.redis.ttl(this.buildKey(userId, 'push', 'hourly')),
        this.redis.ttl(this.buildKey(userId, 'email', 'weekly')),
        this.redis.ttl(this.buildKey(userId, 'sms', 'monthly')),
      ]);

      const dailyLimit = limits.maxNotificationsPerDay || 50;
      const pushLimit = limits.maxPushPerHour || 10;
      const emailLimit = limits.maxEmailsPerWeek || 10;
      const smsLimit = limits.maxSmsPerMonth || 5;

      return {
        userId,
        daily: {
          count: dailyCount,
          limit: dailyLimit,
          remaining: Math.max(0, dailyLimit - dailyCount),
        },
        push: {
          count: pushCount,
          limit: pushLimit,
          remaining: Math.max(0, pushLimit - pushCount),
          resetsIn: pushTTL > 0 ? pushTTL : TTL.HOURLY,
        },
        email: {
          count: emailCount,
          limit: emailLimit,
          remaining: Math.max(0, emailLimit - emailCount),
          resetsIn: emailTTL > 0 ? emailTTL : TTL.WEEKLY,
        },
        sms: {
          count: smsCount,
          limit: smsLimit,
          remaining: Math.max(0, smsLimit - smsCount),
          resetsIn: smsTTL > 0 ? smsTTL : TTL.MONTHLY,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to get user limit status: ${error instanceof Error ? error.message : String(error)}`,
      );
      // Return default status on error
      return {
        userId,
        daily: { count: 0, limit: 50, remaining: 50 },
        push: { count: 0, limit: 10, remaining: 10, resetsIn: TTL.HOURLY },
        email: { count: 0, limit: 10, remaining: 10, resetsIn: TTL.WEEKLY },
        sms: { count: 0, limit: 5, remaining: 5, resetsIn: TTL.MONTHLY },
      };
    }
  }

  /**
   * Reset all counters for a user (admin function)
   */
  async resetUserCounters(userId: string): Promise<void> {
    try {
      const pattern = `${REDIS_PREFIX}${userId}:*`;
      const keys = await this.redis.keys(pattern);
      
      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.logger.log(`Reset ${keys.length} frequency counters for user ${userId}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to reset counters for user ${userId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Get frequency history from MongoDB
   */
  async getFrequencyHistory(
    userId: string,
    startDate?: Date,
    endDate?: Date,
    channel?: NotificationChannel | string,
  ): Promise<FrequencyLogDocument[]> {
    const filter: any = { userId: new Types.ObjectId(userId) };
    
    if (startDate || endDate) {
      filter.sentAt = {};
      if (startDate) filter.sentAt.$gte = startDate;
      if (endDate) filter.sentAt.$lte = endDate;
    }
    
    if (channel) {
      filter.channel = channel;
    }

    return this.frequencyLogModel
      .find(filter)
      .sort({ sentAt: -1 })
      .limit(100)
      .lean();
  }

  /**
   * Get aggregated frequency stats
   */
  async getFrequencyStats(userId: string, days: number = 30): Promise<{
    total: number;
    byChannel: Record<string, number>;
    byDay: Array<{ date: string; count: number }>;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [total, byChannel, byDay] = await Promise.all([
      this.frequencyLogModel.countDocuments({
        userId: new Types.ObjectId(userId),
        sentAt: { $gte: startDate },
      }),
      this.frequencyLogModel.aggregate([
        {
          $match: {
            userId: new Types.ObjectId(userId),
            sentAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: '$channel',
            count: { $sum: 1 },
          },
        },
      ]),
      this.frequencyLogModel.aggregate([
        {
          $match: {
            userId: new Types.ObjectId(userId),
            sentAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$sentAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return {
      total,
      byChannel: byChannel.reduce(
        (acc, item) => ({ ...acc, [item._id]: item.count }),
        {},
      ),
      byDay: byDay.map((item) => ({ date: item._id, count: item.count })),
    };
  }

  // ===== Private Helper Methods =====

  private buildKey(userId: string, type: string, period?: string): string {
    return period
      ? `${REDIS_PREFIX}${userId}:${type}:${period}`
      : `${REDIS_PREFIX}${userId}:${type}`;
  }

  private async getCount(key: string): Promise<number> {
    const value = await this.redis.get(key);
    return value ? parseInt(value, 10) : 0;
  }

  private async incrementWithTTL(key: string, ttl: number): Promise<number> {
    const count = await this.redis.incr(key);
    
    // Set TTL only if it's a new key (count === 1)
    if (count === 1) {
      await this.redis.expire(key, ttl);
    }
    
    return count;
  }

  private async logToMongoDB(
    userId: string,
    channel: NotificationChannel | string,
    templateKey?: string,
  ): Promise<void> {
    try {
      await this.frequencyLogModel.create({
        userId: new Types.ObjectId(userId),
        channel,
        templateKey,
        sentAt: new Date(),
      });
    } catch (error) {
      // Log but don't throw - MongoDB logging is not critical
      this.logger.debug(
        `Failed to log frequency to MongoDB: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

