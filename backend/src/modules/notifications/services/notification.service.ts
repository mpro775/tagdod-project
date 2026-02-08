import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, PipelineStage } from 'mongoose';
import {
  UnifiedNotification,
  UnifiedNotificationDocument,
} from '../schemas/unified-notification.schema';
import { NotificationLog, NotificationLogDocument } from '../schemas/notification-log.schema';
import {
  CreateNotificationDto,
  UpdateNotificationDto,
  ListNotificationsDto,
  MarkAsReadDto,
  BulkSendNotificationDto,
} from '../dto/unified-notification.dto';
import {
  NotificationType,
  NotificationStatus,
  NotificationChannel,
  NotificationPriority,
  NotificationNavigationType,
} from '../enums/notification.enums';
import {
  NotificationNotFoundException,
  NotificationException,
  ErrorCode,
} from '../../../shared/exceptions';
import { WebSocketService } from '../../../shared/websocket/websocket.service';
import { PushNotificationAdapter, SmsNotificationAdapter } from '../adapters/notification.adapters';
import { DeviceToken, DeviceTokenDocument } from '../schemas/device-token.schema';
import { User, UserDocument, UserStatus, UserRole } from '../../users/schemas/user.schema';
import {
  getNotificationTargetRoles,
  getDefaultChannelForType,
  isChannelAllowedForType,
  isRoleAllowedForType,
} from '../config/notification-rules';
import { NotificationChannelConfigService } from './notification-channel-config.service';
import { NotificationQueueService, NotificationJobData } from '../queue/notification-queue.service';

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectModel(UnifiedNotification.name)
    private notificationModel: Model<UnifiedNotificationDocument>,
    @InjectModel(NotificationLog.name)
    private notificationLogModel: Model<NotificationLogDocument>,
    @InjectModel(DeviceToken.name)
    private deviceTokenModel: Model<DeviceTokenDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private readonly webSocketService: WebSocketService,
    private readonly pushNotificationAdapter: PushNotificationAdapter,
    private readonly smsNotificationAdapter: SmsNotificationAdapter,
    private readonly channelConfigService: NotificationChannelConfigService,
    private readonly queueService: NotificationQueueService,
  ) {}

  // ===== Helper Methods =====

  /**
   * إنشاء بيانات Job للـ Queue
   */
  private createJobData(
    notification: UnifiedNotificationDocument,
    recipientId?: string,
  ): NotificationJobData {
    return {
      notificationId: notification._id.toString(),
      recipientId: recipientId || notification.recipientId?.toString(),
      channel: notification.channel,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      messageEn: notification.messageEn,
      data: notification.data,
      priority: notification.priority,
      actionUrl: (notification as any).actionUrl,
    };
  }

  /**
   * التحقق مما إذا كان الإشعار مجدول للمستقبل
   */
  private isScheduledForFuture(scheduledFor?: Date): boolean {
    if (!scheduledFor) return false;
    return scheduledFor.getTime() > Date.now() + 60000; // أكثر من دقيقة في المستقبل
  }

  /**
   * بناء actionUrl من navigationType و navigationTarget
   */
  private buildActionUrl(
    navigationType?: NotificationNavigationType,
    navigationTarget?: string,
  ): string | undefined {
    if (
      !navigationType ||
      navigationType === NotificationNavigationType.NONE ||
      !navigationTarget
    ) {
      return undefined;
    }

    switch (navigationType) {
      case NotificationNavigationType.ORDER:
        return `/orders/${navigationTarget}`;
      case NotificationNavigationType.CATEGORY:
        return `/categories/${navigationTarget}`;
      case NotificationNavigationType.PRODUCT:
        return `/products/${navigationTarget}`;
      case NotificationNavigationType.SECTION:
        return navigationTarget.startsWith('/')
          ? navigationTarget
          : `/${navigationTarget}`;
      case NotificationNavigationType.EXTERNAL_URL:
        return navigationTarget; // استخدام navigationTarget مباشرة كرابط خارجي
      case NotificationNavigationType.SERVICE_REQUEST:
        return `/service-requests/${navigationTarget}`;
      default:
        return undefined;
    }
  }

  // ===== Core CRUD Operations =====

  /**
   * إنشاء إشعار جديد
   */
  async createNotification(dto: CreateNotificationDto): Promise<UnifiedNotification> {
    try {
      // تحديد targetRoles تلقائياً إذا لم يتم تحديدها
      // استخدام الإعدادات من قاعدة البيانات أولاً، ثم القيم الافتراضية
      const targetRoles =
        dto.targetRoles && dto.targetRoles.length > 0
          ? dto.targetRoles
          : await this.channelConfigService.getTargetRoles(dto.type).catch(() => {
              // Fallback إلى القيم الثابتة إذا فشل جلب الإعدادات
              return getNotificationTargetRoles(dto.type);
            });

      // تحديد القناة الافتراضية إذا لم يتم تحديدها
      // استخدام الإعدادات من قاعدة البيانات أولاً، ثم القيم الافتراضية
      let channel =
        dto.channel ||
        (await this.channelConfigService.getDefaultChannel(dto.type).catch(() => {
          // Fallback إلى القيم الثابتة إذا فشل جلب الإعدادات
          return getDefaultChannelForType(dto.type);
        }));

      // التحقق من أن القناة مسموحة لنوع الإشعار
      const isAllowed = await this.channelConfigService
        .isChannelAllowed(dto.type, channel)
        .catch(() => {
          // Fallback إلى التحقق من القيم الثابتة
          return isChannelAllowedForType(dto.type, channel);
        });

      if (!isAllowed) {
        const defaultChannel = await this.channelConfigService
          .getDefaultChannel(dto.type)
          .catch(() => getDefaultChannelForType(dto.type));
        this.logger.warn(
          `Channel ${channel} is not allowed for notification type ${dto.type}. Using default channel: ${defaultChannel}`,
        );
        // استخدام القناة الافتراضية بدلاً من القناة المحددة
        channel = defaultChannel;
      }

      // التحقق من أن المستلم لديه دور مناسب (إذا كان recipientId موجود)
      if (dto.recipientId) {
        const recipient = await this.userModel.findById(dto.recipientId).select('roles').lean();
        if (recipient) {
          const userRoles = recipient.roles || [UserRole.USER];
          const hasAllowedRole = userRoles.some((role) => isRoleAllowedForType(dto.type, role));

          if (!hasAllowedRole) {
            this.logger.warn(
              `User ${dto.recipientId} with roles [${userRoles.join(', ')}] is not in target roles [${targetRoles.join(', ')}] for notification type ${dto.type}`,
            );
            // لا نمنع الإرسال، فقط نسجل تحذير (للتوافق مع الإشعارات الموجودة)
          }
        }
      }

      // بناء actionUrl من navigationType و navigationTarget إذا كانا محددين
      // إذا كان actionUrl محدداً مسبقاً و navigationType غير محدد، نستخدم actionUrl كما هو (للتوافق مع الإصدارات السابقة)
      let finalActionUrl = dto.actionUrl;
      if (dto.navigationType && dto.navigationTarget) {
        const builtActionUrl = this.buildActionUrl(dto.navigationType, dto.navigationTarget);
        if (builtActionUrl) {
          finalActionUrl = builtActionUrl;
          this.logger.debug(
            `Built actionUrl from navigation: ${dto.navigationType} -> ${finalActionUrl}`,
          );
        }
      }

      // إثراء حقل data بمعلومات التنقل (للتوافق مع التطبيقات التي تتوقع categoryId, productId, orderId في data)
      const enrichedData: Record<string, unknown> = { ...(dto.data || {}) };
      if (dto.navigationType && dto.navigationTarget) {
        switch (dto.navigationType) {
          case NotificationNavigationType.CATEGORY:
            enrichedData.categoryId = dto.navigationTarget;
            break;
          case NotificationNavigationType.PRODUCT:
            enrichedData.productId = dto.navigationTarget;
            break;
          case NotificationNavigationType.ORDER:
            enrichedData.orderId = dto.navigationTarget;
            break;
          case NotificationNavigationType.SECTION:
            enrichedData.section = dto.navigationTarget;
            break;
          case NotificationNavigationType.EXTERNAL_URL:
            enrichedData.externalUrl = dto.navigationTarget;
            break;
          case NotificationNavigationType.SERVICE_REQUEST:
            enrichedData.serviceRequestId = dto.navigationTarget;
            break;
        }
        this.logger.debug(
          `Enriched notification data with navigation: ${dto.navigationType} -> ${dto.navigationTarget}`,
        );
      }

      const notification = new this.notificationModel({
        ...dto,
        data: enrichedData,
        actionUrl: finalActionUrl,
        navigationType: dto.navigationType || NotificationNavigationType.NONE,
        navigationTarget: dto.navigationTarget,
        navigationParams: dto.navigationParams,
        recipientId: dto.recipientId ? new Types.ObjectId(dto.recipientId) : undefined,
        createdBy: dto.createdBy ? new Types.ObjectId(dto.createdBy) : undefined,
        scheduledFor: dto.scheduledFor || new Date(),
        isSystemGenerated: dto.isSystemGenerated || false,
        priority: dto.priority || NotificationPriority.MEDIUM,
        channel: channel,
        targetRoles: targetRoles,
        batchId: dto.batchId,
        metadata: dto.campaign ? { campaign: dto.campaign } : {},
      });

      const savedNotification = await notification.save();
      this.logger.log(
        `Notification created: ${savedNotification._id} (${dto.type}) for roles [${targetRoles.join(', ')}] channel: ${channel} recipientId: ${dto.recipientId || 'none'}`,
      );

      // التحقق من الإشعارات المجدولة - استخدام Queue
      if (this.isScheduledForFuture(dto.scheduledFor)) {
        const jobData = this.createJobData(savedNotification, dto.recipientId);
        await this.queueService.scheduleNotification(jobData, dto.scheduledFor!);
        this.logger.log(
          `Notification ${savedNotification._id} scheduled for ${dto.scheduledFor!.toISOString()}`,
        );
        // تحديث الحالة إلى QUEUED
        await this.notificationModel.updateOne(
          { _id: savedNotification._id },
          { $set: { status: NotificationStatus.QUEUED } },
        );
        return savedNotification;
      }

      // إرسال الإشعار حسب القناة
      if (dto.recipientId) {
        if (channel === NotificationChannel.IN_APP) {
          // IN_APP: التحقق من حالة الاتصال أولاً
          const isUserOnline = this.webSocketService.isUserOnline(dto.recipientId);

          if (isUserOnline) {
            // المستخدم متصل - إرسال عبر WebSocket (متزامن للـ real-time)
            const sent = this.webSocketService.sendToUser(
              dto.recipientId,
              'notification:new',
              {
                id: savedNotification._id.toString(),
                title: savedNotification.title,
                message: savedNotification.message,
                messageEn: savedNotification.messageEn,
                type: savedNotification.type,
                category: savedNotification.category,
                priority: savedNotification.priority,
                data: savedNotification.data,
                createdAt: savedNotification.createdAt,
                isRead: false,
              },
              '/notifications',
            );

            if (sent) {
              this.logger.log(
                `IN_APP notification sent via WebSocket to online user: ${dto.recipientId}`,
              );
              // تحديث الحالة إلى SENT
              await this.notificationModel.updateOne(
                { _id: savedNotification._id },
                { $set: { status: NotificationStatus.SENT, sentAt: new Date() } },
              );
            } else {
              // فشل الإرسال عبر WebSocket - إضافة للـ Queue كبديل
              this.logger.log(
                `User ${dto.recipientId} was online but WebSocket send failed, queuing push notification`,
              );
              const jobData = this.createJobData(savedNotification, dto.recipientId);
              jobData.channel = NotificationChannel.PUSH;
              await this.queueService.addToQueue(jobData);
            }
          } else {
            // المستخدم غير متصل - إضافة للـ Queue (Push)
            this.logger.log(
              `User ${dto.recipientId} is offline, queuing push notification instead of IN_APP`,
            );
            const jobData = this.createJobData(savedNotification, dto.recipientId);
            jobData.channel = NotificationChannel.PUSH;
            await this.queueService.addToQueue(jobData);
          }
        } else if (channel === NotificationChannel.PUSH) {
          // PUSH: إضافة للـ Queue
          const jobData = this.createJobData(savedNotification, dto.recipientId);
          await this.queueService.addToQueue(jobData);
          this.logger.log(`Push notification ${savedNotification._id} added to queue`);
        } else if (channel === NotificationChannel.DASHBOARD) {
          // DASHBOARD: خاص بالإداريين - إرسال عبر WebSocket (متزامن)
          this.webSocketService.sendToUser(
            dto.recipientId,
            'notification:new',
            {
              id: savedNotification._id.toString(),
              title: savedNotification.title,
              message: savedNotification.message,
              messageEn: savedNotification.messageEn,
              type: savedNotification.type,
              category: savedNotification.category,
              priority: savedNotification.priority,
              data: savedNotification.data,
              createdAt: savedNotification.createdAt,
              isRead: false,
            },
            '/notifications',
          );
          this.logger.log(
            `Dashboard notification created and sent via WebSocket for admin: ${dto.recipientId}`,
          );
          // تحديث الحالة إلى SENT
          await this.notificationModel.updateOne(
            { _id: savedNotification._id },
            { $set: { status: NotificationStatus.SENT, sentAt: new Date() } },
          );
        }
      } else if (targetRoles && targetRoles.length > 0) {
        // إرسال الإشعارات الموجهة للأدوار لجميع المستخدمين الذين لديهم هذه الأدوار
        if (channel === NotificationChannel.DASHBOARD || channel === NotificationChannel.IN_APP) {
          // تحديد الأدوار المستهدفة (استثناء MERCHANT من إشعارات المخزون)
          let rolesToSend = [...targetRoles];

          // استثناء MERCHANT من إشعارات LOW_STOCK و OUT_OF_STOCK
          if (
            (dto.type === NotificationType.LOW_STOCK ||
              dto.type === NotificationType.OUT_OF_STOCK) &&
            rolesToSend.includes(UserRole.MERCHANT)
          ) {
            rolesToSend = rolesToSend.filter((role) => role !== UserRole.MERCHANT);
            this.logger.log(
              `Excluding MERCHANT role from stock notification ${dto.type}. Sending only to: [${rolesToSend.join(', ')}]`,
            );
          }

          if (rolesToSend.length === 0) {
            this.logger.warn(`No roles to send notification ${dto.type} to (MERCHANT excluded)`);
            // تحديث حالة الإشعار إلى FAILED لأنه لا يوجد مستلمين
            await this.notificationModel.updateOne(
              { _id: savedNotification._id },
              {
                $set: {
                  status: NotificationStatus.FAILED,
                  errorMessage: 'No target roles available (MERCHANT excluded)',
                  failedAt: new Date(),
                },
              },
            );
            return savedNotification;
          }

          // البحث عن جميع المستخدمين الذين لديهم أحد الأدوار المستهدفة
          const targetUsers = await this.userModel
            .find({
              roles: { $in: rolesToSend },
              status: UserStatus.ACTIVE,
            })
            .select('_id')
            .lean();

          if (targetUsers.length > 0) {
            const userIds = targetUsers.map((user) => user._id.toString());
            const roleBatchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // إنشاء نسخة من الإشعار لكل مستخدم
            const userNotifications = targetUsers.map((user) => {
              // التأكد من تحويل _id إلى string أولاً (لأن .lean() قد يعيد ObjectId)
              const userId =
                user._id instanceof Types.ObjectId ? user._id.toString() : String(user._id);

              return {
                type: savedNotification.type,
                title: savedNotification.title,
                message: savedNotification.message,
                messageEn: savedNotification.messageEn,
                data: savedNotification.data,
                actionUrl: savedNotification.actionUrl,
                navigationType: savedNotification.navigationType,
                navigationTarget: savedNotification.navigationTarget,
                navigationParams: savedNotification.navigationParams,
                channel: savedNotification.channel,
                status: NotificationStatus.SENT,
                priority: savedNotification.priority,
                category: savedNotification.category,
                targetRoles: savedNotification.targetRoles,
                recipientId: new Types.ObjectId(userId),
                templateId: savedNotification.templateId,
                templateKey: savedNotification.templateKey,
                scheduledFor: savedNotification.scheduledFor,
                sentAt: new Date(),
                isSystemGenerated: savedNotification.isSystemGenerated,
                createdBy: savedNotification.createdBy,
                batchId: roleBatchId,
              };
            });

            // حفظ جميع الإشعارات في قاعدة البيانات
            const createdNotifications = await this.notificationModel.insertMany(userNotifications);
            this.logger.log(
              `Created ${createdNotifications.length} notification copies for users with roles [${rolesToSend.join(', ')}]`,
            );

            // Log للتحقق من recipientId في النسخ
            createdNotifications.forEach((notif) => {
              this.logger.debug(
                `Created notification copy ${notif._id} for recipient ${notif.recipientId?.toString() || 'undefined'}`,
              );
            });

            // إرسال الإشعار لجميع المستخدمين عبر WebSocket
            const sentCount = this.webSocketService.sendToMultipleUsers(
              userIds,
              'notification:new',
              {
                id: savedNotification._id.toString(),
                title: savedNotification.title,
                message: savedNotification.message,
                messageEn: savedNotification.messageEn,
                type: savedNotification.type,
                category: savedNotification.category,
                priority: savedNotification.priority,
                data: savedNotification.data,
                createdAt: savedNotification.createdAt,
                isRead: false,
              },
              '/notifications', // ✅ تمرير namespace
            );

            // تحديث حالة الإشعار الأصلي إلى "sent"
            await this.notificationModel.updateOne(
              { _id: savedNotification._id },
              {
                $set: {
                  status: NotificationStatus.SENT,
                  sentAt: new Date(),
                },
              },
            );

            this.logger.log(
              `Notification ${dto.type} sent to ${sentCount}/${userIds.length} users with roles [${rolesToSend.join(', ')}] (${createdNotifications.length} copies created)`,
            );
          } else {
            this.logger.warn(
              `No users found with roles [${rolesToSend.join(', ')}] for notification type ${dto.type}`,
            );
            // تحديث حالة الإشعار إلى FAILED لأنه لا يوجد مستخدمين بالأدوار المطلوبة
            await this.notificationModel.updateOne(
              { _id: savedNotification._id },
              {
                $set: {
                  status: NotificationStatus.FAILED,
                  errorMessage: `No active users found with roles [${rolesToSend.join(', ')}]`,
                  failedAt: new Date(),
                },
              },
            );
          }
        }
      }

      return savedNotification;
    } catch (error) {
      this.logger.error('Failed to create notification:', error);
      throw new NotificationException(ErrorCode.NOTIFICATION_SEND_FAILED, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * الحصول على إشعار بالمعرف
   */
  async getNotificationById(id: string): Promise<UnifiedNotification> {
    const notification = await this.notificationModel.findById(id).lean();

    if (!notification) {
      throw new NotificationNotFoundException({ notificationId: id });
    }

    return notification;
  }

  /**
   * تحديث إشعار
   */
  async updateNotification(id: string, dto: UpdateNotificationDto): Promise<UnifiedNotification> {
    // بناء actionUrl من navigationType و navigationTarget إذا كانا محددين
    const updateData: any = { ...dto };

    if (dto.navigationType && dto.navigationTarget) {
      const builtActionUrl = this.buildActionUrl(dto.navigationType, dto.navigationTarget);
      if (builtActionUrl) {
        updateData.actionUrl = builtActionUrl;
        this.logger.debug(
          `Built actionUrl from navigation during update: ${dto.navigationType} -> ${builtActionUrl}`,
        );
      }
    } else if (dto.navigationType === NotificationNavigationType.NONE) {
      // إذا تم تعيين navigationType إلى NONE، لا نغير actionUrl (للحفاظ على القيمة الحالية)
      updateData.navigationType = NotificationNavigationType.NONE;
    }

    const notification = await this.notificationModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    );

    if (!notification) {
      throw new NotificationNotFoundException({ notificationId: id });
    }

    this.logger.log(`Notification updated: ${id}`);
    return notification;
  }

  /**
   * حذف إشعار
   */
  async deleteNotification(id: string): Promise<boolean> {
    const result = await this.notificationModel.findByIdAndDelete(id);
    return !!result;
  }

  /**
   * حذف كل الإشعارات في دفعة (batch)
   */
  async deleteBatchNotifications(batchId: string): Promise<{ deletedCount: number }> {
    const result = await this.notificationModel.deleteMany({ batchId });
    this.logger.log(`Deleted ${result.deletedCount} notifications for batch ${batchId}`);
    return { deletedCount: result.deletedCount };
  }

  /**
   * إرسال كل الإشعارات في دفعة (batch) لكل المستلمين
   */
  async sendBatchNotifications(batchId: string): Promise<{
    sent: number;
    failed: number;
    results: Array<{ notificationId: string; success: boolean; error?: string }>;
  }> {
    const notifications = await this.notificationModel
      .find({ batchId })
      .lean();

    if (notifications.length === 0) {
      return { sent: 0, failed: 0, results: [] };
    }

    const results: Array<{ notificationId: string; success: boolean; error?: string }> = [];
    let sent = 0;
    let failed = 0;

    for (const notification of notifications) {
      const notificationId = notification._id.toString();
      const recipientId = notification.recipientId?.toString();

      try {
        if (!recipientId) {
          results.push({ notificationId, success: false, error: 'No recipient' });
          failed++;
          continue;
        }

        if (
          notification.status !== NotificationStatus.PENDING &&
          notification.status !== NotificationStatus.QUEUED
        ) {
          results.push({
            notificationId,
            success: false,
            error: `Notification already ${notification.status}`,
          });
          failed++;
          continue;
        }

        if (notification.channel === NotificationChannel.PUSH) {
          await this.sendPushNotification(
            notification as UnifiedNotificationDocument,
            recipientId,
          );
        } else if (notification.channel === NotificationChannel.IN_APP) {
          await this.resendInAppNotification(notificationId);
        } else if (notification.channel === NotificationChannel.DASHBOARD) {
          this.webSocketService.sendToUser(
            recipientId,
            'notification:new',
            {
              id: notificationId,
              title: notification.title,
              message: notification.message,
              messageEn: notification.messageEn,
              type: notification.type,
              category: notification.category,
              priority: notification.priority,
              data: notification.data,
              createdAt: notification.createdAt,
              isRead: false,
            },
            '/notifications',
          );
        } else if (
          notification.channel === NotificationChannel.SMS ||
          notification.channel === NotificationChannel.EMAIL
        ) {
          const jobData = this.createJobData(
            notification as UnifiedNotificationDocument,
            recipientId,
          );
          await this.queueService.addToQueue(jobData);
        }

        await this.notificationModel.updateOne(
          { _id: notificationId },
          {
            $set: {
              status: NotificationStatus.SENT,
              sentAt: new Date(),
            },
          },
        );

        results.push({ notificationId, success: true });
        sent++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Failed to send notification ${notificationId} in batch ${batchId}: ${errorMsg}`,
        );
        results.push({ notificationId, success: false, error: errorMsg });
        failed++;
      }
    }

    this.logger.log(
      `Batch send completed for ${batchId}: ${sent} sent, ${failed} failed`,
    );
    return { sent, failed, results };
  }

  // ===== User Operations =====

  /**
   * الحصول على إشعارات المستخدم
   * يتم فلترة الإشعارات حسب دور المستخدم (targetRoles)
   */
  async getUserNotifications(
    userId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<{ notifications: UnifiedNotification[]; total: number }> {
    // جلب دور المستخدم من قاعدة البيانات
    const user = await this.userModel.findById(userId).select('roles').lean();
    const userRoles = user?.roles || [UserRole.USER];

    // بناء filter للبحث عن الإشعارات
    // الإشعارات التي:
    // 1. موجهة للمستخدم مباشرة (recipientId) - هذه لها الأولوية
    // 2. أو موجهة للأدوار التي يمتلكها المستخدم (targetRoles) بدون recipientId محدد
    const userIdObj = new Types.ObjectId(userId);
    const filter: Record<string, unknown> = {
      $or: [
        // إشعارات موجهة للمستخدم مباشرة (النسخ التي تم إنشاؤها)
        { recipientId: userIdObj },
        // إشعارات موجهة للأدوار بدون recipientId محدد (للتوافق مع الإشعارات القديمة)
        {
          $and: [
            {
              $or: [{ recipientId: { $exists: false } }, { recipientId: null }],
            },
            {
              $or: [
                { targetRoles: { $exists: false } },
                { targetRoles: { $size: 0 } },
                { targetRoles: { $in: userRoles } },
              ],
            },
          ],
        },
      ],
    };

    const [notifications, total] = await Promise.all([
      this.notificationModel.find(filter).sort({ createdAt: -1 }).limit(limit).skip(offset).lean(),
      this.notificationModel.countDocuments(filter),
    ]);

    this.logger.debug(
      `User notifications query: userId=${userId}, userRoles=[${userRoles.join(', ')}], found=${notifications.length}, total=${total}`,
    );

    // Log channel distribution for debugging
    const channelCounts = notifications.reduce(
      (acc, n) => {
        acc[n.channel] = (acc[n.channel] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    this.logger.debug(`Notification channels distribution: ${JSON.stringify(channelCounts)}`);

    return { notifications, total };
  }

  /**
   * تحديد إشعار كمقروء
   */
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const result = await this.notificationModel.updateOne(
      {
        _id: notificationId,
        recipientId: new Types.ObjectId(userId),
        status: { $ne: NotificationStatus.READ },
      },
      {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    );

    return result.modifiedCount > 0;
  }

  /**
   * تحديد إشعارات متعددة كمقروءة
   */
  async markMultipleAsRead(dto: MarkAsReadDto, userId: string): Promise<number> {
    const result = await this.notificationModel.updateMany(
      {
        _id: { $in: dto.notificationIds },
        recipientId: new Types.ObjectId(userId),
        status: { $ne: NotificationStatus.READ },
      },
      {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    );

    return result.modifiedCount;
  }

  /**
   * تحديد جميع الإشعارات كمقروءة
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.notificationModel.updateMany(
      {
        recipientId: new Types.ObjectId(userId),
        status: { $ne: NotificationStatus.READ },
      },
      {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    );

    return result.modifiedCount;
  }

  /**
   * الحصول على عدد الإشعارات غير المقروءة
   */
  async getUnreadCount(userId: string): Promise<number> {
    const userIdObj = new Types.ObjectId(userId);
    const count = await this.notificationModel.countDocuments({
      recipientId: userIdObj,
      status: { $ne: NotificationStatus.READ },
    });

    // Log للتحقق من الاستعلام
    this.logger.debug(
      `Unread count query: userId=${userId}, userIdObj=${userIdObj.toString()}, count=${count}`,
    );

    return count;
  }

  /**
   * التحقق من وجود إشعار حديث لنفس المتغير (لمنع التكرار)
   */
  async hasRecentNotification(
    type: NotificationType,
    variantId: string,
    timeWindowMs: number = 60 * 60 * 1000, // افتراضي: ساعة واحدة
  ): Promise<boolean> {
    const recentNotification = await this.notificationModel
      .findOne({
        type,
        'data.variantId': variantId,
        createdAt: { $gte: new Date(Date.now() - timeWindowMs) },
      })
      .sort({ createdAt: -1 })
      .lean();

    return !!recentNotification;
  }

  // ===== List & Search Operations =====

  /**
   * قائمة الإشعارات مع فلترة
   */
  async listNotifications(query: ListNotificationsDto): Promise<{
    notifications: UnifiedNotification[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    const {
      page = 1,
      limit = 20,
      recipientId,
      type,
      status,
      channel,
      category,
      search,
      startDate,
      endDate,
      groupByBatch = true, // افتراضي: تجميع الحملات
      campaign,
    } = query;

    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};

    // Basic filters
    if (recipientId) {
      filter.recipientId = new Types.ObjectId(recipientId);
    }

    if (type) {
      filter.type = type;
    }

    if (status) {
      filter.status = status;
    }

    if (channel) {
      filter.channel = channel;
    }

    if (category) {
      filter.category = category;
    }

    // Date filters
    if (startDate || endDate) {
      filter.createdAt = filter.createdAt || {};
      if (startDate) {
        (filter.createdAt as Record<string, unknown>).$gte = new Date(startDate);
      }
      if (endDate) {
        (filter.createdAt as Record<string, unknown>).$lte = new Date(endDate);
      }
    }

    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { messageEn: { $regex: search, $options: 'i' } },
      ];
    }

    // Campaign filter
    if (campaign) {
      filter['metadata.campaign'] = campaign;
    }

    if (groupByBatch) {
      const facetPipeline: PipelineStage[] = [
        { $match: filter },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: { $ifNull: ['$batchId', { $toString: '$_id' }] },
            first: { $first: '$$ROOT' },
            recipientCount: { $sum: 1 },
            sentCount: {
              $sum: { $cond: [{ $eq: ['$status', NotificationStatus.SENT] }, 1, 0] },
            },
            failedCount: {
              $sum: { $cond: [{ $eq: ['$status', NotificationStatus.FAILED] }, 1, 0] },
            },
            pendingCount: {
              $sum: {
                $cond: [
                  {
                    $in: [
                      '$status',
                      [
                        NotificationStatus.PENDING,
                        NotificationStatus.QUEUED,
                        NotificationStatus.SENDING,
                      ],
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                '$first',
                {
                  batchId: '$first.batchId',
                  recipientCount: '$recipientCount',
                  sentCount: '$sentCount',
                  failedCount: '$failedCount',
                  pendingCount: '$pendingCount',
                },
              ],
            },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'recipientId',
            foreignField: '_id',
            as: 'userDoc',
          },
        },
        {
          $addFields: {
            user: {
              $cond: {
                if: { $gt: [{ $size: '$userDoc' }, 0] },
                then: {
                  _id: { $toString: { $arrayElemAt: ['$userDoc._id', 0] } },
                  name: { $arrayElemAt: ['$userDoc.name', 0] },
                  email: { $arrayElemAt: ['$userDoc.email', 0] },
                  phone: { $arrayElemAt: ['$userDoc.phone', 0] },
                },
                else: null,
              },
            },
          },
        },
        { $project: { userDoc: 0 } },
      ];

      const [facetResult] = await this.notificationModel
        .aggregate([
          {
            $facet: {
              total: [
                { $match: filter },
                { $group: { _id: { $ifNull: ['$batchId', { $toString: '$_id' }] } } },
                { $count: 'count' },
              ],
              notifications: [...facetPipeline, { $skip: skip }, { $limit: limit }],
            },
          },
        ] as PipelineStage[])
        .exec();

      const total = facetResult?.total?.[0]?.count ?? 0;
      const notifications = facetResult?.notifications ?? [];
      const totalPages = Math.ceil(total / limit);

      return {
        notifications,
        meta: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    }

    const [notifications, total] = await Promise.all([
      this.notificationModel.find(filter).sort({ createdAt: -1 }).limit(limit).skip(skip).lean(),
      this.notificationModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      notifications,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  // ===== Bulk Operations =====

  /**
   * إرسال إشعارات مجمعة
   */
  async bulkSendNotifications(dto: BulkSendNotificationDto): Promise<{
    sent: number;
    failed: number;
    results: Array<{ userId: string; success: boolean; error?: string }>;
    batchId?: string;
  }> {
    const results: Array<{ userId: string; success: boolean; error?: string }> = [];
    let sent = 0;
    let failed = 0;

    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    for (const userId of dto.targetUserIds) {
      try {
        const notificationData: CreateNotificationDto = {
          type: dto.type,
          title: dto.title,
          message: dto.message,
          messageEn: dto.messageEn,
          data: dto.data,
          channel: dto.channel,
          priority: dto.priority,
          category: dto.category,
          recipientId: userId,
          templateKey: dto.templateKey,
          scheduledFor: dto.scheduledFor,
          isSystemGenerated: dto.isSystemGenerated,
          batchId,
          actionUrl: dto.actionUrl,
          navigationType: dto.navigationType,
          navigationTarget: dto.navigationTarget,
          navigationParams: dto.navigationParams,
          campaign: dto.campaign,
        };

        await this.createNotification(notificationData);
        results.push({ userId, success: true });
        sent++;
      } catch (error) {
        results.push({
          userId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        failed++;
      }
    }

    this.logger.log(`Bulk send completed: ${sent} sent, ${failed} failed, batchId: ${batchId}`);
    return { sent, failed, results, batchId };
  }

  // ===== Status Management =====

  /**
   * تحديث حالة الإشعار
   */
  async updateNotificationStatus(
    notificationId: string,
    status: NotificationStatus,
    errorMessage?: string,
    errorCode?: string,
  ): Promise<boolean> {
    const updateData: Record<string, unknown> = { status };

    if (status === NotificationStatus.SENT) {
      updateData.sentAt = new Date();
    } else if (status === NotificationStatus.DELIVERED) {
      updateData.deliveredAt = new Date();
    } else if (status === NotificationStatus.READ) {
      updateData.readAt = new Date();
    } else if (status === NotificationStatus.CLICKED) {
      updateData.clickedAt = new Date();
    } else if (status === NotificationStatus.FAILED) {
      updateData.failedAt = new Date();
      updateData.errorMessage = errorMessage;
      updateData.errorCode = errorCode;
      updateData.retryCount = { $inc: 1 };
    }

    const result = await this.notificationModel.updateOne({ _id: notificationId }, updateData);

    return result.modifiedCount > 0;
  }

  // ===== Cleanup Operations =====

  /**
   * حذف الإشعارات القديمة
   */
  async deleteOldNotifications(olderThanDays: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await this.notificationModel.deleteMany({
      createdAt: { $lt: cutoffDate },
      status: NotificationStatus.READ,
    });

    this.logger.log(`Deleted ${result.deletedCount} old notifications`);
    return result.deletedCount;
  }

  // ===== Device Token Cleanup Operations =====

  /**
   * تنظيف Device Tokens غير النشطة (لم يتم استخدامها لمدة معينة)
   */
  async cleanupInactiveTokens(inactiveDays: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - inactiveDays);

      const result = await this.deviceTokenModel.updateMany(
        {
          isActive: true,
          lastUsedAt: { $lt: cutoffDate },
        },
        {
          isActive: false,
        },
      );

      this.logger.log(
        `Cleaned up ${result.modifiedCount} inactive device tokens (inactive for ${inactiveDays} days)`,
      );
      return result.modifiedCount;
    } catch (error) {
      this.logger.error(
        `Failed to cleanup inactive tokens: ${error instanceof Error ? error.message : String(error)}`,
      );
      return 0;
    }
  }

  /**
   * تنظيف Device Tokens التي لم يتم استخدامها أبداً (تم إنشاؤها ولكن لم يتم استخدامها)
   */
  async cleanupUnusedTokens(unusedDays: number = 7): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - unusedDays);

      const result = await this.deviceTokenModel.updateMany(
        {
          isActive: true,
          lastUsedAt: { $exists: false },
          createdAt: { $lt: cutoffDate },
        },
        {
          isActive: false,
        },
      );

      this.logger.log(
        `Cleaned up ${result.modifiedCount} unused device tokens (created ${unusedDays} days ago but never used)`,
      );
      return result.modifiedCount;
    } catch (error) {
      this.logger.error(
        `Failed to cleanup unused tokens: ${error instanceof Error ? error.message : String(error)}`,
      );
      return 0;
    }
  }

  // ===== Statistics =====

  /**
   * الحصول على إحصائيات الإشعارات
   */
  async getNotificationStats(userId?: string): Promise<{
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    byChannel: Record<string, number>;
    byCategory: Record<string, number>;
    unreadCount: number;
    readRate: number;
    deliveryRate: number;
  }> {
    try {
      const baseFilter = userId ? { recipientId: new Types.ObjectId(userId) } : {};

      const [
        total,
        byType,
        byStatus,
        byChannel,
        byCategory,
        unreadCount,
        readCount,
        deliveredCount,
      ] = await Promise.all([
        this.notificationModel.countDocuments(baseFilter),
        this.notificationModel
          .aggregate([
            { $match: baseFilter },
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $project: { type: '$_id', count: 1, _id: 0 } },
          ])
          .catch(() => []),
        this.notificationModel
          .aggregate([
            { $match: baseFilter },
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $project: { status: '$_id', count: 1, _id: 0 } },
          ])
          .catch(() => []),
        this.notificationModel
          .aggregate([
            { $match: baseFilter },
            { $group: { _id: '$channel', count: { $sum: 1 } } },
            { $project: { channel: '$_id', count: 1, _id: 0 } },
          ])
          .catch(() => []),
        this.notificationModel
          .aggregate([
            { $match: baseFilter },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $project: { category: '$_id', count: 1, _id: 0 } },
          ])
          .catch(() => []),
        this.notificationModel
          .countDocuments({
            ...baseFilter,
            status: { $ne: NotificationStatus.READ },
          })
          .catch(() => 0),
        this.notificationModel
          .countDocuments({
            ...baseFilter,
            status: NotificationStatus.READ,
          })
          .catch(() => 0),
        this.notificationModel
          .countDocuments({
            ...baseFilter,
            status: NotificationStatus.DELIVERED,
          })
          .catch(() => 0),
      ]);

      const readRate = total > 0 ? (readCount / total) * 100 : 0;
      const deliveryRate = total > 0 ? (deliveredCount / total) * 100 : 0;

      return {
        total,
        byType: byType.reduce((acc, item) => ({ ...acc, [item.type]: item.count }), {}),
        byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item.status]: item.count }), {}),
        byChannel: byChannel.reduce((acc, item) => ({ ...acc, [item.channel]: item.count }), {}),
        byCategory: byCategory.reduce((acc, item) => ({ ...acc, [item.category]: item.count }), {}),
        unreadCount,
        readRate: Math.round(readRate * 100) / 100,
        deliveryRate: Math.round(deliveryRate * 100) / 100,
      };
    } catch (error) {
      this.logger.error('Error getting notification stats:', error);
      // Return default stats in case of error
      return {
        total: 0,
        byType: {},
        byStatus: {},
        byChannel: {},
        byCategory: {},
        unreadCount: 0,
        readRate: 0,
        deliveryRate: 0,
      };
    }
  }

  // ===== Push Notification Sending =====

  /**
   * محاولة القنوات البديلة عند عدم وجود device token (IN_APP ثم SMS)
   */
  private async tryPushFallbackChannels(
    notification: UnifiedNotificationDocument,
    userId: string,
  ): Promise<void> {
    // 1. محاولة IN_APP (WebSocket)
    const sentViaWebSocket = this.webSocketService.sendToUser(
      userId,
      'notification:new',
      {
        id: notification._id.toString(),
        title: notification.title,
        message: notification.message,
        messageEn: notification.messageEn,
        type: notification.type,
        priority: notification.priority,
        data: notification.data,
        createdAt: new Date(),
        isRead: false,
      },
      '/notifications',
    );
    if (sentViaWebSocket) {
      this.logger.log(`Fallback IN_APP succeeded for user ${userId}`);
      return;
    }

    // 2. محاولة SMS
    const user = await this.userModel.findById(userId).select('phone').lean();
    if (user?.phone) {
      try {
        const smsResult = await this.smsNotificationAdapter.send({
          id: notification._id.toString(),
          type: notification.type,
          title: notification.title,
          message: notification.message,
          messageEn: notification.messageEn || '',
          channel: NotificationChannel.SMS,
          priority: notification.priority,
          recipientId: userId,
          recipientPhone: user.phone,
        });
        if (smsResult.success) {
          this.logger.log(`Fallback SMS succeeded for user ${userId}`);
          return;
        }
      } catch (err) {
        this.logger.warn(`SMS fallback failed for user ${userId}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    this.logger.warn(
      `All fallback channels failed for user ${userId}. No device token, IN_APP and SMS unavailable or failed.`,
    );
  }

  /**
   * إرسال Push Notification للمستخدم
   */
  async sendPushNotification(
    notification: UnifiedNotificationDocument,
    userId: string,
  ): Promise<void> {
    try {
      // جلب Device Tokens النشطة للمستخدم
      const deviceTokens = await this.deviceTokenModel
        .find({
          userId: new Types.ObjectId(userId),
          isActive: true,
        })
        .lean();

      if (deviceTokens.length === 0) {
        this.logger.debug(`No active device tokens found for user ${userId}, trying fallback channels`);
        await this.tryPushFallbackChannels(notification, userId);
        return;
      }

      // إرسال الإشعار لكل جهاز
      let successCount = 0;
      let failureCount = 0;
      const sendPromises = deviceTokens.map(async (deviceToken) => {
        try {
          const result = await this.pushNotificationAdapter.send({
            id: notification._id.toString(),
            type: notification.type,
            title: notification.title,
            message: notification.message,
            messageEn: notification.messageEn,
            channel: NotificationChannel.PUSH,
            priority: notification.priority,
            recipientId: userId,
            deviceToken: deviceToken.token,
            actionUrl: (notification as any).actionUrl,
          });

          if (result.success) {
            successCount++;
            this.logger.log(
              `Push notification sent successfully to user ${userId}, device ${deviceToken._id}: ${notification._id}`,
            );
          } else {
            failureCount++;
            const errorCode =
              (result.metadata &&
              typeof result.metadata === 'object' &&
              'errorCode' in result.metadata
                ? String(result.metadata.errorCode)
                : '') || '';
            const errorMessage = result.error || 'Unknown error';

            // تعطيل Token إذا كان غير صالح
            if (
              errorCode.includes('invalid') ||
              errorCode.includes('unregistered') ||
              errorCode.includes('registration-token-not-registered') ||
              errorCode.includes('invalid-registration-token')
            ) {
              await this.deviceTokenModel.updateOne({ _id: deviceToken._id }, { isActive: false });
              this.logger.warn(
                `Disabled invalid device token ${deviceToken._id} for user ${userId} due to error: ${errorCode}`,
              );
            } else {
              this.logger.error(
                `Failed to send push notification to user ${userId}, device ${deviceToken._id}: ${errorMessage}`,
              );
            }
          }
        } catch (error) {
          failureCount++;
          this.logger.error(
            `Failed to send push notification to user ${userId}, device ${deviceToken._id}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      });

      await Promise.allSettled(sendPromises);

      this.logger.log(
        `Push notification sending completed for user ${userId}: ${successCount} succeeded, ${failureCount} failed out of ${deviceTokens.length} devices`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send push notifications: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // ===== User List for Selection =====

  /**
   * الحصول على قائمة المستخدمين للاختيار (مع الاسم والرقم)
   */
  async getUsersForSelection(
    search?: string,
    limit: number = 100,
  ): Promise<
    Array<{
      _id: string;
      name: string;
      phone: string;
      firstName?: string;
      lastName?: string;
    }>
  > {
    try {
      const query: Record<string, unknown> = {
        status: { $ne: UserStatus.DELETED },
        deletedAt: null,
      };

      if (search) {
        query.$or = [
          { phone: { $regex: search, $options: 'i' } },
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
        ];
      }

      const users = await this.userModel
        .find(query)
        .select('_id phone firstName lastName')
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean();

      return users.map((user) => {
        const firstName = user.firstName?.trim() || '';
        const lastName = user.lastName?.trim() || '';
        const fullName =
          [firstName, lastName].filter(Boolean).join(' ') || user.phone || 'غير محدد';

        return {
          _id: user._id.toString(),
          name: fullName,
          phone: user.phone,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
        };
      });
    } catch (error) {
      this.logger.error(
        `Failed to get users for selection: ${error instanceof Error ? error.message : String(error)}`,
      );
      return [];
    }
  }

  // ===== Device Token Management =====

  /**
   * تسجيل جهاز جديد أو تحديث Token موجود
   */
  async registerDevice(
    userId: string,
    token: string,
    platform: string,
    userAgent?: string,
    appVersion?: string,
  ): Promise<{ success: boolean; message: string; deviceToken?: DeviceTokenDocument }> {
    try {
      // البحث عن Token موجود لنفس المستخدم
      let deviceToken = await this.deviceTokenModel.findOne({
        token: token,
        userId: new Types.ObjectId(userId),
      });

      if (deviceToken) {
        // تحديث Token موجود
        deviceToken.isActive = true;
        deviceToken.lastUsedAt = new Date();
        deviceToken.platform = platform as any;
        if (userAgent) deviceToken.userAgent = userAgent;
        if (appVersion) deviceToken.appVersion = appVersion;
        await deviceToken.save();

        this.logger.log(`Device token updated for user ${userId}`);
        return {
          success: true,
          message: 'Device token updated successfully',
          deviceToken,
        };
      }

      // تعطيل جميع Tokens القديمة لنفس المستخدم والمنصة
      // هذا يضمن أن المستخدم لديه token واحد نشط فقط لكل منصة
      await this.deviceTokenModel.updateMany(
        {
          userId: new Types.ObjectId(userId),
          platform: platform as any,
          isActive: true,
          token: { $ne: token }, // استثناء الـ token الجديد
        },
        { isActive: false },
      );

      // إنشاء Token جديد
      deviceToken = new this.deviceTokenModel({
        userId: new Types.ObjectId(userId),
        token: token,
        platform: platform as any,
        userAgent: userAgent,
        appVersion: appVersion,
        isActive: true,
        lastUsedAt: new Date(),
      });

      await deviceToken.save();

      this.logger.log(`New device token registered for user ${userId} on platform ${platform}`);
      return {
        success: true,
        message: 'Device registered successfully',
        deviceToken,
      };
    } catch (error) {
      this.logger.error(
        `Failed to register device token: ${error instanceof Error ? error.message : String(error)}`,
      );

      // في حالة وجود duplicate key error (token موجود لمستخدم آخر)
      if (error instanceof Error && error.message.includes('duplicate key')) {
        // محاولة العثور على Token الموجود وتحديثه
        const existingToken = await this.deviceTokenModel.findOne({ token: token });
        if (existingToken && existingToken.userId.toString() !== userId) {
          // Token موجود لمستخدم آخر - نحذف القديم وننشئ جديد
          await this.deviceTokenModel.deleteOne({ _id: existingToken._id });

          const newToken = new this.deviceTokenModel({
            userId: new Types.ObjectId(userId),
            token: token,
            platform: platform as any,
            userAgent: userAgent,
            appVersion: appVersion,
            isActive: true,
            lastUsedAt: new Date(),
          });
          await newToken.save();

          return {
            success: true,
            message: 'Device registered successfully (replaced existing token)',
            deviceToken: newToken,
          };
        }
      }

      throw new NotificationException(ErrorCode.NOTIFICATION_SEND_FAILED, {
        error: error instanceof Error ? error.message : 'Failed to register device',
      });
    }
  }

  /**
   * إلغاء تسجيل جهاز (تعطيل Token)
   */
  async unregisterDevice(userId: string, token: string): Promise<boolean> {
    try {
      const result = await this.deviceTokenModel.updateOne(
        {
          userId: new Types.ObjectId(userId),
          token: token,
        },
        {
          isActive: false,
        },
      );

      if (result.modifiedCount > 0) {
        this.logger.log(`Device token unregistered for user ${userId}`);
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(
        `Failed to unregister device token: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }

  /**
   * الحصول على جميع Device Tokens النشطة للمستخدم
   */
  async getUserDeviceTokens(userId: string): Promise<DeviceTokenDocument[]> {
    try {
      return await this.deviceTokenModel
        .find({
          userId: new Types.ObjectId(userId),
          isActive: true,
        })
        .sort({ lastUsedAt: -1 })
        .lean();
    } catch (error) {
      this.logger.error(
        `Failed to get user device tokens: ${error instanceof Error ? error.message : String(error)}`,
      );
      return [];
    }
  }

  /**
   * الحصول على معلومات تفصيلية عن أجهزة المستخدم
   */
  async getUserDevicesInfo(userId: string): Promise<{
    hasDevices: boolean;
    deviceCount: number;
    devices: Array<{
      _id: string;
      platform: string;
      userAgent?: string;
      appVersion?: string;
      isActive: boolean;
      lastUsedAt?: Date;
      createdAt?: Date;
    }>;
    platforms: {
      ios: number;
      android: number;
      web: number;
    };
  }> {
    try {
      const devices = await this.getUserDeviceTokens(userId);

      const platforms = {
        ios: devices.filter((d) => d.platform === 'ios').length,
        android: devices.filter((d) => d.platform === 'android').length,
        web: devices.filter((d) => d.platform === 'web').length,
      };

      return {
        hasDevices: devices.length > 0,
        deviceCount: devices.length,
        devices: devices.map((device) => ({
          _id: device._id.toString(),
          platform: device.platform,
          userAgent: device.userAgent,
          appVersion: device.appVersion,
          isActive: device.isActive,
          lastUsedAt: device.lastUsedAt,
          createdAt: device.createdAt,
        })),
        platforms,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get user devices info: ${error instanceof Error ? error.message : String(error)}`,
      );
      return {
        hasDevices: false,
        deviceCount: 0,
        devices: [],
        platforms: { ios: 0, android: 0, web: 0 },
      };
    }
  }

  // ===== Helper Methods =====

  /**
   * الحصول على الأدوار المستهدفة لنوع إشعار معين
   */
  getNotificationTargetRoles(type: NotificationType): UserRole[] {
    return getNotificationTargetRoles(type);
  }

  /**
   * التحقق من أن دور المستخدم مناسب لنوع إشعار معين
   */
  isRoleAllowedForNotification(type: NotificationType, userRole: UserRole): boolean {
    return isRoleAllowedForType(type, userRole);
  }

  /**
   * الحصول على القناة الافتراضية لنوع إشعار معين
   */
  getDefaultChannelForNotification(type: NotificationType): NotificationChannel {
    return getDefaultChannelForType(type);
  }

  /**
   * إنشاء نسخ من الإشعار للمستخدمين الذين لديهم الأدوار المستهدفة
   * تستخدم عند إرسال إشعار موجه للأدوار
   */
  async createNotificationCopiesForTargetRoles(
    notification: UnifiedNotificationDocument,
  ): Promise<number> {
    try {
      if (!notification.targetRoles || notification.targetRoles.length === 0) {
        this.logger.warn('No target roles specified for notification');
        return 0;
      }

      // تحديد الأدوار المستهدفة (استثناء MERCHANT من إشعارات المخزون)
      let rolesToSend = [...notification.targetRoles];

      // استثناء MERCHANT من إشعارات LOW_STOCK و OUT_OF_STOCK
      if (
        (notification.type === NotificationType.LOW_STOCK ||
          notification.type === NotificationType.OUT_OF_STOCK) &&
        rolesToSend.includes(UserRole.MERCHANT)
      ) {
        rolesToSend = rolesToSend.filter((role) => role !== UserRole.MERCHANT);
        this.logger.log(
          `Excluding MERCHANT role from stock notification ${notification.type}. Sending only to: [${rolesToSend.join(', ')}]`,
        );
      }

      if (rolesToSend.length === 0) {
        this.logger.warn(
          `No roles to send notification ${notification.type} to (MERCHANT excluded)`,
        );
        return 0;
      }

      // البحث عن جميع المستخدمين الذين لديهم أحد الأدوار المستهدفة
      const targetUsers = await this.userModel
        .find({
          roles: { $in: rolesToSend },
          status: UserStatus.ACTIVE,
        })
        .select('_id')
        .lean();

      if (targetUsers.length === 0) {
        this.logger.warn(
          `No users found with roles [${rolesToSend.join(', ')}] for notification type ${notification.type}`,
        );
        return 0;
      }

      // التحقق من وجود نسخ موجودة بالفعل للمستخدمين المحددين
      const userIds = targetUsers.map((user) => user._id.toString());
      const existingCopies = await this.notificationModel.countDocuments({
        _id: { $ne: notification._id },
        type: notification.type,
        title: notification.title,
        message: notification.message,
        recipientId: { $in: userIds.map((id) => new Types.ObjectId(id)) },
        createdAt: {
          $gte: new Date(Date.now() - 60000), // خلال الدقيقة الماضية
        },
      });

      if (existingCopies >= userIds.length) {
        this.logger.log(
          `Notification copies already exist for all ${userIds.length} users. Skipping creation.`,
        );
        return existingCopies;
      }

      // إنشاء نسخة من الإشعار لكل مستخدم
      const userNotifications = targetUsers.map((user) => {
        // التأكد من تحويل _id إلى string أولاً (لأن .lean() قد يعيد ObjectId)
        const userId = user._id instanceof Types.ObjectId ? user._id.toString() : String(user._id);

        return {
          type: notification.type,
          title: notification.title,
          message: notification.message,
          messageEn: notification.messageEn,
          data: notification.data,
          actionUrl: notification.actionUrl,
          navigationType: notification.navigationType,
          navigationTarget: notification.navigationTarget,
          navigationParams: notification.navigationParams,
          channel: notification.channel,
          status: NotificationStatus.SENT,
          priority: notification.priority,
          category: notification.category,
          targetRoles: notification.targetRoles,
          recipientId: new Types.ObjectId(userId),
          templateId: notification.templateId,
          templateKey: notification.templateKey,
          scheduledFor: notification.scheduledFor || new Date(),
          sentAt: new Date(),
          isSystemGenerated: notification.isSystemGenerated,
          createdBy: notification.createdBy,
        };
      });

      // حفظ جميع الإشعارات في قاعدة البيانات
      const createdNotifications = await this.notificationModel.insertMany(userNotifications);
      this.logger.log(
        `Created ${createdNotifications.length} notification copies for users with roles [${rolesToSend.join(', ')}]`,
      );

      // Log للتحقق من recipientId في النسخ
      createdNotifications.forEach((notif) => {
        this.logger.debug(
          `Created notification copy ${notif._id} for recipient ${notif.recipientId?.toString() || 'undefined'}`,
        );
      });

      // إرسال الإشعار لجميع المستخدمين عبر WebSocket
      const sentCount = this.webSocketService.sendToMultipleUsers(
        userIds,
        'notification:new',
        {
          id: notification._id.toString(),
          title: notification.title,
          message: notification.message,
          messageEn: notification.messageEn,
          type: notification.type,
          category: notification.category,
          priority: notification.priority,
          data: notification.data,
          createdAt: notification.createdAt,
          isRead: false,
        },
        '/notifications', // ✅ تمرير namespace
      );

      this.logger.log(
        `Notification ${notification.type} sent via WebSocket to ${sentCount}/${userIds.length} users with roles [${rolesToSend.join(', ')}]`,
      );

      return createdNotifications.length;
    } catch (error) {
      this.logger.error(
        `Failed to create notification copies for target roles: ${error instanceof Error ? error.message : String(error)}`,
      );
      return 0;
    }
  }

  /**
   * إعادة إرسال إشعار IN_APP عبر WebSocket
   */
  async resendInAppNotification(notificationId: string): Promise<boolean> {
    try {
      const notification = await this.getNotificationById(notificationId);

      if (notification.channel !== NotificationChannel.IN_APP) {
        this.logger.warn(`Cannot resend non-IN_APP notification ${notificationId}`);
        return false;
      }

      if (!notification.recipientId) {
        this.logger.warn(`Cannot resend notification ${notificationId} without recipientId`);
        return false;
      }

      const recipientId = notification.recipientId.toString();
      // Type assertion لأن lean() document يحتوي على _id لكن TypeScript لا يعرفه
      const notificationWithId = notification as UnifiedNotification & { _id: Types.ObjectId };
      const sent = this.webSocketService.sendToUser(
        recipientId,
        'notification:new',
        {
          id: notificationWithId._id.toString(),
          title: notification.title,
          message: notification.message,
          messageEn: notification.messageEn,
          type: notification.type,
          category: notification.category,
          priority: notification.priority,
          data: notification.data,
          createdAt: notification.createdAt,
          isRead: notification.readAt ? true : false,
        },
        '/notifications', // ✅ تمرير namespace
      );

      if (sent) {
        this.logger.log(
          `✅ Resent IN_APP notification ${notificationId} to user ${recipientId} via WebSocket`,
        );
      } else {
        this.logger.warn(`⚠️ User ${recipientId} not connected to WebSocket`);
      }

      return sent;
    } catch (error) {
      this.logger.error(`❌ Failed to resend notification: ${error}`);
      return false;
    }
  }

  // ===== Queue Operations =====

  /**
   * الحصول على إحصائيات الـ Queue
   */
  async getQueueStats(): Promise<{
    send: { waiting: number; active: number; completed: number; failed: number; delayed: number };
    scheduled: {
      waiting: number;
      active: number;
      completed: number;
      failed: number;
      delayed: number;
    };
    retry: { waiting: number; active: number; completed: number; failed: number; delayed: number };
    totalPending: number;
  }> {
    const stats = await this.queueService.getQueueStats();
    const totalPending = await this.queueService.getPendingCount();
    return { ...stats, totalPending };
  }

  /**
   * إعادة إرسال الإشعارات الفاشلة
   */
  async retryFailedNotifications(limit: number = 100): Promise<number> {
    // ✅ إضافة شرط: فقط الإشعارات التي لها recipientId
    const failedNotifications = await this.notificationModel
      .find({
        status: NotificationStatus.FAILED,
        retryCount: { $lt: 5 },
        recipientId: { $exists: true, $ne: null }, // ✅ فقط الإشعارات التي لها recipientId
      })
      .limit(limit)
      .lean();

    let retriedCount = 0;
    let skippedCount = 0;
    for (const notification of failedNotifications) {
      try {
        // التحقق مرة أخرى من وجود recipientId (للأمان)
        if (!notification.recipientId) {
          skippedCount++;
          continue;
        }

        const jobData = this.createJobData(notification as any);
        await this.queueService.retryNotification(jobData, (notification.retryCount || 0) + 1);
        retriedCount++;
      } catch (error) {
        // تحسين معالجة الأخطاء: استخدام debug بدلاً من error للإشعارات بدون recipientId
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('recipientId')) {
          this.logger.debug(
            `Skipping retry for notification ${notification._id} - ${errorMessage}`,
          );
          skippedCount++;
        } else {
          this.logger.error(
            `Failed to queue retry for notification ${notification._id}: ${errorMessage}`,
          );
        }
      }
    }

    if (skippedCount > 0) {
      this.logger.debug(`Skipped ${skippedCount} notifications without recipientId`);
    }
    this.logger.log(`Queued ${retriedCount} failed notifications for retry`);
    return retriedCount;
  }

  /**
   * معالجة الإشعارات المجدولة التي حان وقتها
   */
  async processScheduledNotifications(): Promise<number> {
    const now = new Date();
    const scheduledNotifications = await this.notificationModel
      .find({
        status: { $in: [NotificationStatus.PENDING, NotificationStatus.QUEUED] },
        scheduledFor: { $lte: now },
      })
      .limit(100)
      .lean();

    let processedCount = 0;
    for (const notification of scheduledNotifications) {
      try {
        // التحقق من أنه غير موجود بالفعل في الـ Queue
        const isQueued = await this.queueService.isQueued(notification._id.toString());
        if (!isQueued) {
          const jobData = this.createJobData(notification as any);
          await this.queueService.addToQueue(jobData);
          processedCount++;
        }
      } catch (error) {
        this.logger.error(
          `Failed to process scheduled notification ${notification._id}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    if (processedCount > 0) {
      this.logger.log(`Processed ${processedCount} scheduled notifications`);
    }
    return processedCount;
  }

  /**
   * تنظيف الإشعارات غير الصالحة (بدون recipientId) عند بدء التشغيل
   */
  async cleanupInvalidNotifications(): Promise<number> {
    const invalidNotifications = await this.notificationModel
      .find({
        status: {
          $in: [NotificationStatus.PENDING, NotificationStatus.QUEUED, NotificationStatus.SENDING],
        },
        $or: [{ recipientId: { $exists: false } }, { recipientId: null }],
      })
      .lean();

    let cleanedCount = 0;
    for (const notification of invalidNotifications) {
      try {
        await this.notificationModel.updateOne(
          { _id: notification._id },
          {
            $set: {
              status: NotificationStatus.FAILED,
              errorMessage: 'Invalid notification: missing recipientId',
              failedAt: new Date(),
            },
          },
        );
        cleanedCount++;
      } catch (error) {
        this.logger.error(
          `Failed to cleanup notification ${notification._id}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    if (cleanedCount > 0) {
      this.logger.log(`Cleaned up ${cleanedCount} invalid notifications (missing recipientId)`);
    }
    return cleanedCount;
  }

  /**
   * الحصول على تفاصيل الإرسال لإشعار محدد
   */
  async getNotificationDeliveryDetails(notificationId: string): Promise<{
    notification: UnifiedNotificationDocument | null;
    logs: Array<{
      _id: string;
      userId: string;
      userName?: string;
      userEmail?: string;
      status: NotificationStatus;
      channel: NotificationChannel;
      sentAt?: Date;
      deliveredAt?: Date;
      failedAt?: Date;
      errorMessage?: string;
      errorCode?: string;
      deviceToken?: string;
      platform?: string;
      createdAt: Date;
    }>;
    summary: {
      total: number;
      sent: number;
      failed: number;
      pending: number;
    };
  }> {
    // جلب الإشعار
    const notification = await this.notificationModel.findById(notificationId).lean();

    // جلب جميع السجلات للإشعار
    const logs = await this.notificationLogModel
      .find({ notificationId: new Types.ObjectId(notificationId) })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    // تحضير البيانات
    const logsWithUserInfo = logs.map((log) => {
      const user = log.userId as any;
      return {
        _id: log._id.toString(),
        userId: user?._id?.toString() || log.userId?.toString() || '',
        userName: user?.name || 'غير معروف',
        userEmail: user?.email || 'غير معروف',
        status: log.status,
        channel: log.channel,
        sentAt: log.sentAt,
        deliveredAt: log.deliveredAt,
        failedAt: log.failedAt,
        errorMessage: log.errorMessage,
        errorCode: log.errorCode,
        deviceToken: log.deviceToken,
        platform: log.platform,
        createdAt: log.createdAt || new Date(),
      };
    });

    // حساب الملخص
    const summary = {
      total: logsWithUserInfo.length,
      sent: logsWithUserInfo.filter((log) => log.status === NotificationStatus.SENT).length,
      failed: logsWithUserInfo.filter((log) => log.status === NotificationStatus.FAILED).length,
      pending: logsWithUserInfo.filter((log) => log.status === NotificationStatus.PENDING).length,
    };

    return {
      notification: notification as UnifiedNotificationDocument,
      logs: logsWithUserInfo,
      summary,
    };
  }

  /**
   * الحصول على تفاصيل الإرسال لحملة (batch) من الإشعارات
   */
  async getBatchDeliveryDetails(batchId: string): Promise<{
    notification: UnifiedNotificationDocument | null;
    logs: Array<{
      _id: string;
      userId: string;
      userName?: string;
      userEmail?: string;
      status: NotificationStatus;
      channel: NotificationChannel;
      sentAt?: Date;
      deliveredAt?: Date;
      failedAt?: Date;
      errorMessage?: string;
      errorCode?: string;
      deviceToken?: string;
      platform?: string;
      createdAt: Date;
    }>;
    summary: {
      total: number;
      sent: number;
      failed: number;
      pending: number;
    };
  }> {
    const notifications = await this.notificationModel
      .find({ batchId })
      .populate('recipientId', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    if (notifications.length === 0) {
      return {
        notification: null,
        logs: [],
        summary: { total: 0, sent: 0, failed: 0, pending: 0 },
      };
    }

    const firstNotification = notifications[0];
    const logs = notifications.map((notif) => {
      const user = notif.recipientId as any;
      return {
        _id: notif._id.toString(),
        userId: user?._id?.toString() || notif.recipientId?.toString() || '',
        userName: user?.name || 'غير معروف',
        userEmail: user?.email || 'غير معروف',
        status: notif.status,
        channel: notif.channel,
        sentAt: notif.sentAt,
        deliveredAt: notif.deliveredAt,
        failedAt: notif.failedAt,
        errorMessage: notif.errorMessage,
        errorCode: notif.errorCode,
        deviceToken: undefined,
        platform: undefined,
        createdAt: notif.createdAt || new Date(),
      };
    });

    const summary = {
      total: logs.length,
      sent: logs.filter((log) => log.status === NotificationStatus.SENT).length,
      failed: logs.filter((log) => log.status === NotificationStatus.FAILED).length,
      pending: logs.filter(
        (log) =>
          log.status === NotificationStatus.PENDING ||
          log.status === NotificationStatus.QUEUED ||
          log.status === NotificationStatus.SENDING,
      ).length,
    };

    return {
      notification: firstNotification as UnifiedNotificationDocument,
      logs,
      summary,
    };
  }

  /**
   * يتم استدعاؤها تلقائياً عند بدء تشغيل الوحدة
   */
  async onModuleInit(): Promise<void> {
    try {
      // تنظيف الإشعارات غير الصالحة بعد 5 ثوانٍ من بدء التشغيل
      // لإعطاء الوقت للـ queue للاتصال بـ Redis
      setTimeout(async () => {
        await this.cleanupInvalidNotifications();
      }, 5000);
    } catch (error) {
      this.logger.error(
        `Error during notification service initialization: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
