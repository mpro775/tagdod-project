import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, JobOptions } from 'bull';
import {
  NOTIFICATION_QUEUE,
  NOTIFICATION_SCHEDULED_QUEUE,
  NOTIFICATION_RETRY_QUEUE,
} from './queue.constants';
import { NotificationPriority, NotificationStatus } from '../enums/notification.enums';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  UnifiedNotification,
  UnifiedNotificationDocument,
} from '../schemas/unified-notification.schema';

// Job data interface
export interface NotificationJobData {
  notificationId: string;
  recipientId?: string;
  channel: string;
  type: string;
  title: string;
  message: string;
  messageEn: string;
  data?: Record<string, unknown>;
  priority: NotificationPriority;
  deviceToken?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  actionUrl?: string;
  attempt?: number;
  scheduledFor?: Date;
}

// Priority mapping for Bull queue
const PRIORITY_MAP: Record<NotificationPriority, number> = {
  [NotificationPriority.URGENT]: 1,
  [NotificationPriority.HIGH]: 2,
  [NotificationPriority.MEDIUM]: 3,
  [NotificationPriority.LOW]: 4,
};

@Injectable()
export class NotificationQueueService {
  private readonly logger = new Logger(NotificationQueueService.name);

  constructor(
    @InjectQueue(NOTIFICATION_QUEUE)
    private readonly notificationQueue: Queue<NotificationJobData>,
    @InjectQueue(NOTIFICATION_SCHEDULED_QUEUE)
    private readonly scheduledQueue: Queue<NotificationJobData>,
    @InjectQueue(NOTIFICATION_RETRY_QUEUE)
    private readonly retryQueue: Queue<NotificationJobData>,
    @InjectModel(UnifiedNotification.name)
    private readonly notificationModel: Model<UnifiedNotificationDocument>,
  ) {}

  /**
   * Add notification to the send queue
   */
  async addToQueue(
    data: NotificationJobData,
    options?: Partial<JobOptions>,
  ): Promise<string> {
    try {
      // التحقق من وجود recipientId (مطلوب للإشعارات الموجهة)
      if (!data.recipientId) {
        this.logger.warn(
          `Skipping notification ${data.notificationId} - no recipientId provided`,
        );
        // تحديث حالة الإشعار إلى FAILED
        try {
          await this.notificationModel.updateOne(
            { _id: data.notificationId },
            {
              $set: {
                status: NotificationStatus.FAILED,
                errorMessage: 'No recipientId provided',
                failedAt: new Date(),
              },
            },
          );
        } catch (updateError) {
          this.logger.error(
            `Failed to update notification status: ${updateError instanceof Error ? updateError.message : String(updateError)}`,
          );
        }
        throw new Error('Cannot add notification to queue without recipientId');
      }

      // التحقق من حالة الإشعار قبل إضافته للـ queue
      const notification = await this.notificationModel.findById(data.notificationId).lean();
      if (notification) {
        // منع إضافة الإشعارات التي تم إرسالها بالفعل أو فشلت
        if (
          notification.status === NotificationStatus.SENT ||
          notification.status === NotificationStatus.FAILED
        ) {
          this.logger.warn(
            `Skipping notification ${data.notificationId} - already ${notification.status}`,
          );
          throw new Error(`Notification already ${notification.status}`);
        }
      }

      const priority = PRIORITY_MAP[data.priority] || PRIORITY_MAP[NotificationPriority.MEDIUM];

      const job = await this.notificationQueue.add('send', data, {
        priority,
        attempts: options?.attempts || 3,
        backoff: options?.backoff || {
          type: 'exponential',
          delay: 2000,
        },
        ...options,
      });

      this.logger.log(
        `Notification ${data.notificationId} added to queue with job ID: ${job.id} (priority: ${data.priority})`,
      );

      return job.id?.toString() || '';
    } catch (error) {
      this.logger.error(
        `Failed to add notification ${data.notificationId} to queue: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Schedule notification for future delivery
   */
  async scheduleNotification(
    data: NotificationJobData,
    scheduledFor: Date,
  ): Promise<string> {
    try {
      // التحقق من وجود recipientId (مطلوب للإشعارات الموجهة)
      if (!data.recipientId) {
        this.logger.warn(
          `Skipping scheduled notification ${data.notificationId} - no recipientId provided`,
        );
        // تحديث حالة الإشعار إلى FAILED
        try {
          await this.notificationModel.updateOne(
            { _id: data.notificationId },
            {
              $set: {
                status: NotificationStatus.FAILED,
                errorMessage: 'No recipientId provided for scheduled notification',
                failedAt: new Date(),
              },
            },
          );
        } catch (updateError) {
          this.logger.error(
            `Failed to update notification status: ${updateError instanceof Error ? updateError.message : String(updateError)}`,
          );
        }
        throw new Error('Cannot schedule notification without recipientId');
      }

      const delay = Math.max(0, scheduledFor.getTime() - Date.now());
      const priority = PRIORITY_MAP[data.priority] || PRIORITY_MAP[NotificationPriority.MEDIUM];

      const job = await this.scheduledQueue.add(
        'scheduled',
        { ...data, scheduledFor },
        {
          delay,
          priority,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
        },
      );

      this.logger.log(
        `Notification ${data.notificationId} scheduled for ${scheduledFor.toISOString()} with job ID: ${job.id}`,
      );

      return job.id?.toString() || '';
    } catch (error) {
      this.logger.error(
        `Failed to schedule notification ${data.notificationId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Add notification to retry queue
   */
  async retryNotification(
    data: NotificationJobData,
    attempt: number = 1,
    delayMs: number = 10000,
  ): Promise<string> {
    try {
      // التحقق من وجود recipientId (مطلوب للإشعارات الموجهة)
      if (!data.recipientId) {
        this.logger.warn(
          `Skipping retry for notification ${data.notificationId} - no recipientId provided`,
        );
        // تحديث حالة الإشعار إلى FAILED
        try {
          await this.notificationModel.updateOne(
            { _id: data.notificationId },
            {
              $set: {
                status: NotificationStatus.FAILED,
                errorMessage: 'No recipientId provided for retry',
                failedAt: new Date(),
              },
            },
          );
        } catch (updateError) {
          this.logger.error(
            `Failed to update notification status: ${updateError instanceof Error ? updateError.message : String(updateError)}`,
          );
        }
        throw new Error('Cannot retry notification without recipientId');
      }

      const job = await this.retryQueue.add(
        'retry',
        { ...data, attempt },
        {
          delay: delayMs,
          attempts: Math.max(1, 5 - attempt), // Remaining attempts
          backoff: {
            type: 'exponential',
            delay: 10000,
          },
        },
      );

      this.logger.log(
        `Notification ${data.notificationId} added to retry queue (attempt ${attempt}) with job ID: ${job.id}`,
      );

      return job.id?.toString() || '';
    } catch (error) {
      this.logger.error(
        `Failed to add notification ${data.notificationId} to retry queue: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    send: { waiting: number; active: number; completed: number; failed: number; delayed: number };
    scheduled: { waiting: number; active: number; completed: number; failed: number; delayed: number };
    retry: { waiting: number; active: number; completed: number; failed: number; delayed: number };
  }> {
    const [sendCounts, scheduledCounts, retryCounts] = await Promise.all([
      this.notificationQueue.getJobCounts(),
      this.scheduledQueue.getJobCounts(),
      this.retryQueue.getJobCounts(),
    ]);

    return {
      send: sendCounts,
      scheduled: scheduledCounts,
      retry: retryCounts,
    };
  }

  /**
   * Get pending jobs count
   */
  async getPendingCount(): Promise<number> {
    const stats = await this.getQueueStats();
    return (
      stats.send.waiting +
      stats.send.delayed +
      stats.scheduled.waiting +
      stats.scheduled.delayed +
      stats.retry.waiting +
      stats.retry.delayed
    );
  }

  /**
   * Pause all queues
   */
  async pauseAll(): Promise<void> {
    await Promise.all([
      this.notificationQueue.pause(),
      this.scheduledQueue.pause(),
      this.retryQueue.pause(),
    ]);
    this.logger.log('All notification queues paused');
  }

  /**
   * Resume all queues
   */
  async resumeAll(): Promise<void> {
    await Promise.all([
      this.notificationQueue.resume(),
      this.scheduledQueue.resume(),
      this.retryQueue.resume(),
    ]);
    this.logger.log('All notification queues resumed');
  }

  /**
   * Clean old jobs from all queues
   */
  async cleanOldJobs(grace: number = 3600000): Promise<void> {
    // grace = 1 hour in milliseconds
    await Promise.all([
      this.notificationQueue.clean(grace, 'completed'),
      this.notificationQueue.clean(grace * 24, 'failed'),
      this.scheduledQueue.clean(grace, 'completed'),
      this.scheduledQueue.clean(grace * 24, 'failed'),
      this.retryQueue.clean(grace, 'completed'),
      this.retryQueue.clean(grace * 24, 'failed'),
    ]);
    this.logger.log('Old jobs cleaned from all queues');
  }

  /**
   * Get failed jobs
   */
  async getFailedJobs(limit: number = 100): Promise<NotificationJobData[]> {
    const [sendFailed, scheduledFailed, retryFailed] = await Promise.all([
      this.notificationQueue.getFailed(0, limit),
      this.scheduledQueue.getFailed(0, limit),
      this.retryQueue.getFailed(0, limit),
    ]);

    return [...sendFailed, ...scheduledFailed, ...retryFailed].map((job) => job.data);
  }

  /**
   * Remove a specific job by ID from the send queue
   */
  async removeJob(jobId: string): Promise<void> {
    const job = await this.notificationQueue.getJob(jobId);
    if (job) {
      await job.remove();
      this.logger.log(`Job ${jobId} removed from send queue`);
    }
  }

  /**
   * Check if a notification is already queued
   */
  async isQueued(notificationId: string): Promise<boolean> {
    // Check in all queues
    const checkQueue = async (queue: Queue<NotificationJobData>): Promise<boolean> => {
      const jobs = await queue.getJobs(['waiting', 'active', 'delayed']);
      return jobs.some((job) => job.data.notificationId === notificationId);
    };

    const results = await Promise.all([
      checkQueue(this.notificationQueue),
      checkQueue(this.scheduledQueue),
      checkQueue(this.retryQueue),
    ]);

    return results.some((result) => result);
  }
}

