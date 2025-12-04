import { Processor, Process, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger, forwardRef, Inject } from '@nestjs/common';
import { Job } from 'bull';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  NOTIFICATION_QUEUE,
  NOTIFICATION_SCHEDULED_QUEUE,
  NOTIFICATION_RETRY_QUEUE,
} from './queue.constants';
import { NotificationJobData, NotificationQueueService } from './notification-queue.service';
import {
  UnifiedNotification,
  UnifiedNotificationDocument,
} from '../schemas/unified-notification.schema';
import { NotificationStatus, NotificationChannel } from '../enums/notification.enums';
import { WebSocketService } from '../../../shared/websocket/websocket.service';
import { PushNotificationAdapter } from '../adapters/notification.adapters';
import { DeviceToken, DeviceTokenDocument } from '../schemas/device-token.schema';

@Processor(NOTIFICATION_QUEUE)
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    @InjectModel(UnifiedNotification.name)
    private readonly notificationModel: Model<UnifiedNotificationDocument>,
    @InjectModel(DeviceToken.name)
    private readonly deviceTokenModel: Model<DeviceTokenDocument>,
    private readonly webSocketService: WebSocketService,
    private readonly pushNotificationAdapter: PushNotificationAdapter,
    @Inject(forwardRef(() => NotificationQueueService))
    private readonly queueService: NotificationQueueService,
  ) {}

  @Process('send')
  async handleSend(job: Job<NotificationJobData>): Promise<void> {
    const { data } = job;
    this.logger.log(`Processing notification job ${job.id} for notification ${data.notificationId}`);

    try {
      // Update status to SENDING
      await this.notificationModel.updateOne(
        { _id: data.notificationId },
        { $set: { status: NotificationStatus.SENDING } },
      );

      // Process based on channel
      let success = false;
      let errorMessage: string | undefined;

      switch (data.channel) {
        case NotificationChannel.IN_APP:
        case NotificationChannel.DASHBOARD:
          success = await this.sendInApp(data);
          break;

        case NotificationChannel.PUSH:
          const result = await this.sendPush(data);
          success = result.success;
          errorMessage = result.error;
          break;

        // EMAIL and SMS channels can be added here when needed
        default:
          success = await this.sendInApp(data);
      }

      if (success) {
        // Update status to SENT
        await this.notificationModel.updateOne(
          { _id: data.notificationId },
          {
            $set: {
              status: NotificationStatus.SENT,
              sentAt: new Date(),
            },
          },
        );
        this.logger.log(`Notification ${data.notificationId} sent successfully`);
      } else {
        throw new Error(errorMessage || 'Failed to send notification');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process notification ${data.notificationId}: ${errorMsg}`);

      // Update status to FAILED
      await this.notificationModel.updateOne(
        { _id: data.notificationId },
        {
          $set: {
            status: NotificationStatus.FAILED,
            failedAt: new Date(),
            errorMessage: errorMsg,
          },
          $inc: { retryCount: 1 },
        },
      );

      throw error;
    }
  }

  /**
   * Send in-app notification via WebSocket
   */
  private async sendInApp(data: NotificationJobData): Promise<boolean> {
    if (!data.recipientId) {
      // تحديث حالة الإشعار في قاعدة البيانات بدلاً من مجرد التحذير
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
      this.logger.debug(`Skipping notification ${data.notificationId} - no recipientId`);
      return true; // Consider it successful to avoid retry
    }

    const isUserOnline = this.webSocketService.isUserOnline(data.recipientId);

    if (isUserOnline) {
      const sent = this.webSocketService.sendToUser(
        data.recipientId,
        'notification:new',
        {
          id: data.notificationId,
          title: data.title,
          message: data.message,
          messageEn: data.messageEn,
          type: data.type,
          priority: data.priority,
          data: data.data,
          createdAt: new Date(),
          isRead: false,
        },
        '/notifications',
      );

      if (sent) {
        this.logger.log(`IN_APP notification sent via WebSocket to user: ${data.recipientId}`);
        return true;
      }
    }

    // If user is offline for IN_APP, try push as fallback
    if (data.channel === NotificationChannel.IN_APP) {
      this.logger.log(`User ${data.recipientId} is offline, attempting push notification fallback`);
      const pushResult = await this.sendPush(data);
      return pushResult.success;
    }

    return true; // Dashboard notifications don't need push fallback
  }

  /**
   * Send push notification via FCM
   */
  private async sendPush(data: NotificationJobData): Promise<{ success: boolean; error?: string }> {
    if (!data.recipientId) {
      return { success: false, error: 'No recipientId for push notification' };
    }

    // Get device tokens for user
    const deviceTokens = await this.deviceTokenModel
      .find({
        userId: new Types.ObjectId(data.recipientId),
        isActive: true,
      })
      .lean();

    if (deviceTokens.length === 0) {
      this.logger.debug(`No active device tokens for user ${data.recipientId}`);
      return { success: true }; // Consider it successful if no devices
    }

    let successCount = 0;
    let lastError: string | undefined;

    for (const deviceToken of deviceTokens) {
      try {
        const result = await this.pushNotificationAdapter.send({
          id: data.notificationId,
          type: data.type as any,
          title: data.title,
          message: data.message,
          messageEn: data.messageEn,
          channel: NotificationChannel.PUSH,
          priority: data.priority,
          recipientId: data.recipientId,
          deviceToken: deviceToken.token,
          actionUrl: data.actionUrl,
        });

        if (result.success) {
          successCount++;
          // Update last used timestamp
          await this.deviceTokenModel.updateOne(
            { _id: deviceToken._id },
            { $set: { lastUsedAt: new Date() } },
          );
        } else {
          lastError = result.error;
          // Disable invalid tokens
          const errorCode =
            result.metadata && typeof result.metadata === 'object' && 'errorCode' in result.metadata
              ? String(result.metadata.errorCode)
              : '';

          if (
            errorCode.includes('invalid') ||
            errorCode.includes('unregistered') ||
            errorCode.includes('registration-token-not-registered')
          ) {
            await this.deviceTokenModel.updateOne(
              { _id: deviceToken._id },
              { $set: { isActive: false } },
            );
            this.logger.warn(`Disabled invalid device token ${deviceToken._id}`);
          }
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
        this.logger.error(`Error sending to device ${deviceToken._id}: ${lastError}`);
      }
    }

    if (successCount > 0) {
      this.logger.log(
        `Push notification sent to ${successCount}/${deviceTokens.length} devices for user ${data.recipientId}`,
      );
      return { success: true };
    }

    return { success: false, error: lastError || 'All device tokens failed' };
  }

  // ===== Event Handlers =====

  @OnQueueActive()
  onActive(job: Job<NotificationJobData>) {
    this.logger.debug(`Job ${job.id} is now active for notification ${job.data.notificationId}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job<NotificationJobData>) {
    this.logger.debug(`Job ${job.id} completed for notification ${job.data.notificationId}`);
  }

  @OnQueueFailed()
  async onFailed(job: Job<NotificationJobData>, error: Error) {
    this.logger.error(
      `Job ${job.id} failed for notification ${job.data.notificationId}: ${error.message}`,
    );

    // Add to retry queue if attempts remaining
    const attempt = job.data.attempt || 1;
    if (attempt < 5) {
      const delay = Math.pow(2, attempt) * 10000; // Exponential backoff: 10s, 20s, 40s, 80s, 160s
      try {
        await this.queueService.retryNotification(job.data, attempt + 1, delay);
        this.logger.log(
          `Notification ${job.data.notificationId} queued for retry (attempt ${attempt + 1}) in ${delay}ms`,
        );
      } catch (retryError) {
        this.logger.error(
          `Failed to queue retry for notification ${job.data.notificationId}: ${retryError instanceof Error ? retryError.message : String(retryError)}`,
        );
      }
    }
  }
}

// ===== Scheduled Queue Processor =====
@Processor(NOTIFICATION_SCHEDULED_QUEUE)
export class ScheduledNotificationProcessor {
  private readonly logger = new Logger(ScheduledNotificationProcessor.name);

  constructor(
    @Inject(forwardRef(() => NotificationQueueService))
    private readonly queueService: NotificationQueueService,
  ) {}

  @Process('scheduled')
  async handleScheduled(job: Job<NotificationJobData>): Promise<void> {
    this.logger.log(
      `Processing scheduled notification ${job.data.notificationId} (scheduled for: ${job.data.scheduledFor})`,
    );

    // Move to the main send queue
    await this.queueService.addToQueue(job.data);
    this.logger.log(`Scheduled notification ${job.data.notificationId} moved to send queue`);
  }
}

// ===== Retry Queue Processor =====
@Processor(NOTIFICATION_RETRY_QUEUE)
export class RetryNotificationProcessor {
  private readonly logger = new Logger(RetryNotificationProcessor.name);

  constructor(
    @Inject(forwardRef(() => NotificationQueueService))
    private readonly queueService: NotificationQueueService,
  ) {}

  @Process('retry')
  async handleRetry(job: Job<NotificationJobData>): Promise<void> {
    const attempt = job.data.attempt || 1;
    this.logger.log(
      `Retrying notification ${job.data.notificationId} (attempt ${attempt})`,
    );

    // Move to the main send queue
    await this.queueService.addToQueue(job.data, {
      attempts: 1, // Single attempt in retry
    });
    this.logger.log(`Retry notification ${job.data.notificationId} moved to send queue`);
  }
}

