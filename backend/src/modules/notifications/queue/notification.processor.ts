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
import { NotificationLog, NotificationLogDocument } from '../schemas/notification-log.schema';
import { NotificationStatus, NotificationChannel, DevicePlatform } from '../enums/notification.enums';
import { WebSocketService } from '../../../shared/websocket/websocket.service';
import { PushNotificationAdapter } from '../adapters/notification.adapters';
import { DeviceToken, DeviceTokenDocument } from '../schemas/device-token.schema';

@Processor(NOTIFICATION_QUEUE)
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    @InjectModel(UnifiedNotification.name)
    private readonly notificationModel: Model<UnifiedNotificationDocument>,
    @InjectModel(NotificationLog.name)
    private readonly notificationLogModel: Model<NotificationLogDocument>,
    @InjectModel(DeviceToken.name)
    private readonly deviceTokenModel: Model<DeviceTokenDocument>,
    private readonly webSocketService: WebSocketService,
    private readonly pushNotificationAdapter: PushNotificationAdapter,
    @Inject(forwardRef(() => NotificationQueueService))
    private readonly queueService: NotificationQueueService,
  ) {}

  /**
   * إنشاء سجل إشعار لكل مستخدم
   */
  private async createNotificationLog(
    notificationId: string,
    userId: string,
    data: NotificationJobData,
    status: NotificationStatus,
    errorMessage?: string,
    errorCode?: string,
    deviceToken?: string,
    platform?: DevicePlatform,
  ): Promise<NotificationLogDocument> {
    const log = new this.notificationLogModel({
      userId: new Types.ObjectId(userId),
      notificationId: new Types.ObjectId(notificationId),
      templateKey: (data as any).templateKey || 'manual',
      channel: data.channel,
      status,
      title: data.title,
      body: data.message,
      messageEn: data.messageEn,
      data: data.data || {},
      actionUrl: data.actionUrl,
      priority: data.priority,
      deviceToken: deviceToken ? deviceToken.substring(0, 500) : undefined,
      platform,
      errorMessage: errorMessage ? errorMessage.substring(0, 500) : undefined,
      errorCode: errorCode ? errorCode.substring(0, 50) : undefined,
      sentAt: status === NotificationStatus.SENT ? new Date() : undefined,
      failedAt: status === NotificationStatus.FAILED ? new Date() : undefined,
      trackingId: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        provider: data.channel === NotificationChannel.PUSH ? 'FCM' : undefined,
      },
    });

    return await log.save();
  }

  /**
   * تحديث سجل إشعار
   */
  private async updateNotificationLog(
    logId: string,
    status: NotificationStatus,
    errorMessage?: string,
    errorCode?: string,
  ): Promise<void> {
    const updateData: any = { status };

    if (status === NotificationStatus.SENT) {
      updateData.sentAt = new Date();
    } else if (status === NotificationStatus.FAILED) {
      updateData.failedAt = new Date();
      if (errorMessage) updateData.errorMessage = errorMessage.substring(0, 500);
      if (errorCode) updateData.errorCode = errorCode.substring(0, 50);
    }

    await this.notificationLogModel.updateOne({ _id: logId }, { $set: updateData });
  }

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

      // إنشاء سجل إشعار إذا كان هناك recipientId
      let notificationLog: NotificationLogDocument | null = null;
      if (data.recipientId) {
        notificationLog = await this.createNotificationLog(
          data.notificationId,
          data.recipientId,
          data,
          NotificationStatus.SENDING,
        );
      }

      // Process based on channel
      let success = false;
      let errorMessage: string | undefined;
      let errorCode: string | undefined;

      switch (data.channel) {
        case NotificationChannel.IN_APP:
        case NotificationChannel.DASHBOARD:
          const inAppResult = await this.sendInApp(data, notificationLog?._id.toString());
          success = inAppResult.success;
          errorMessage = inAppResult.error;
          errorCode = inAppResult.errorCode;
          break;

        case NotificationChannel.PUSH:
          const pushResult = await this.sendPush(data, notificationLog?._id.toString());
          success = pushResult.success;
          errorMessage = pushResult.error;
          errorCode = pushResult.errorCode;
          break;

        // EMAIL and SMS channels can be added here when needed
        default:
          const defaultResult = await this.sendInApp(data, notificationLog?._id.toString());
          success = defaultResult.success;
          errorMessage = defaultResult.error;
          errorCode = defaultResult.errorCode;
      }

      // تحديث سجل الإشعار
      if (notificationLog) {
        if (success) {
          await this.updateNotificationLog(notificationLog._id.toString(), NotificationStatus.SENT);
        } else {
          await this.updateNotificationLog(
            notificationLog._id.toString(),
            NotificationStatus.FAILED,
            errorMessage,
            errorCode,
          );
        }
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
  private async sendInApp(
    data: NotificationJobData,
    logId?: string,
  ): Promise<{ success: boolean; error?: string; errorCode?: string }> {
    if (!data.recipientId) {
      if (logId) {
        await this.updateNotificationLog(
          logId,
          NotificationStatus.FAILED,
          'No recipientId provided',
          'NO_RECIPIENT',
        );
      }
      this.logger.debug(`Skipping notification ${data.notificationId} - no recipientId`);
      return { success: false, error: 'No recipientId provided', errorCode: 'NO_RECIPIENT' };
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
        return { success: true };
      }
    }

    // If user is offline for IN_APP, try push as fallback
    if (data.channel === NotificationChannel.IN_APP) {
      this.logger.log(`User ${data.recipientId} is offline, attempting push notification fallback`);
      return await this.sendPush(data, logId);
    }

    return { success: true }; // Dashboard notifications don't need push fallback
  }

  /**
   * Send push notification via FCM
   */
  private async sendPush(
    data: NotificationJobData,
    logId?: string,
  ): Promise<{ success: boolean; error?: string; errorCode?: string }> {
    if (!data.recipientId) {
      if (logId) {
        await this.updateNotificationLog(
          logId,
          NotificationStatus.FAILED,
          'No recipientId for push notification',
          'NO_RECIPIENT',
        );
      }
      return { success: false, error: 'No recipientId for push notification', errorCode: 'NO_RECIPIENT' };
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
      if (logId) {
        await this.updateNotificationLog(
          logId,
          NotificationStatus.FAILED,
          'No active device tokens found',
          'NO_DEVICE_TOKEN',
        );
      }
      return { success: false, error: 'No active device tokens found', errorCode: 'NO_DEVICE_TOKEN' };
    }

    let successCount = 0;
    let lastError: string | undefined;
    let lastErrorCode: string | undefined;

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
          // إنشاء سجل منفصل لكل جهاز ناجح
          await this.createNotificationLog(
            data.notificationId,
            data.recipientId,
            data,
            NotificationStatus.SENT,
            undefined,
            undefined,
            deviceToken.token,
            deviceToken.platform as DevicePlatform,
          );
          // Update last used timestamp
          await this.deviceTokenModel.updateOne(
            { _id: deviceToken._id },
            { $set: { lastUsedAt: new Date() } },
          );
        } else {
          lastError = result.error;
          const errorCode =
            result.metadata && typeof result.metadata === 'object' && 'errorCode' in result.metadata
              ? String(result.metadata.errorCode)
              : 'UNKNOWN_ERROR';
          lastErrorCode = errorCode;

          // إنشاء سجل فشل لكل جهاز
          await this.createNotificationLog(
            data.notificationId,
            data.recipientId,
            data,
            NotificationStatus.FAILED,
            result.error,
            errorCode,
            deviceToken.token,
            deviceToken.platform as DevicePlatform,
          );

          // Disable invalid tokens
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
        lastErrorCode = 'EXCEPTION';
        this.logger.error(`Error sending to device ${deviceToken._id}: ${lastError}`);
      }
    }

    if (successCount > 0) {
      this.logger.log(
        `Push notification sent to ${successCount}/${deviceTokens.length} devices for user ${data.recipientId}`,
      );
      if (logId) {
        await this.updateNotificationLog(logId, NotificationStatus.SENT);
      }
      return { success: true };
    }

    if (logId) {
      await this.updateNotificationLog(
        logId,
        NotificationStatus.FAILED,
        lastError || 'All device tokens failed',
        lastErrorCode,
      );
    }

    return { success: false, error: lastError || 'All device tokens failed', errorCode: lastErrorCode };
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

