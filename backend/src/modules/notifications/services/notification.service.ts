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
  NotificationDeliveryStatus,
} from '../enums/notification.enums';
import {
  NotificationNotFoundException,
  NotificationException,
  ErrorCode,
} from '../../../shared/exceptions';
import { WebSocketService } from '../../../shared/websocket/websocket.service';
import { PushNotificationAdapter, SmsNotificationAdapter } from '../adapters/notification.adapters';
import { FCMAdapter } from '../adapters/fcm.adapter';
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
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { NOTIFICATION_BULK_QUEUE } from '../queue/queue.constants';
import type { BulkNotificationJobData } from '../queue/notification-bulk.processor';

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);

  private static readonly PLACEHOLDER_REGEX = /{{\s*(\w+)\s*}}/g;
  private static readonly NAME_ALIAS_REGEX = /@name\b/g;
  private static readonly USER_VISIBLE_DAYS = 7;

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
    private readonly fcmAdapter: FCMAdapter,
    private readonly channelConfigService: NotificationChannelConfigService,
    private readonly queueService: NotificationQueueService,
    @InjectQueue(NOTIFICATION_BULK_QUEUE)
    private readonly bulkQueue: Queue<BulkNotificationJobData>,
  ) {}

  // ===== Visibility Helpers =====

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private getNotificationVisibleUntil(baseDate?: Date): Date {
    const now = new Date();
    const startDate = baseDate && baseDate > now ? baseDate : now;
    return this.addDays(startDate, NotificationService.USER_VISIBLE_DAYS);
  }

  private buildUserVisibleNotificationFilter(): Record<string, unknown> {
    const now = new Date();
    const fallbackDate = new Date(now);
    fallbackDate.setDate(fallbackDate.getDate() - NotificationService.USER_VISIBLE_DAYS);

    return {
      isExpired: { $ne: true },
      isArchived: { $ne: true },
      $or: [
        { visibleUntil: { $gt: now } },
        {
          visibleUntil: { $exists: false },
          createdAt: { $gte: fallbackDate },
        },
      ],
    };
  }

  // ===== Helper Methods =====

  /**
   * إنشاء بيانات Job للـ Queue
   */
  private createJobData(
    notification: UnifiedNotificationDocument,
    recipientId?: string,
  ): NotificationJobData {
    const targetRecipientId = recipientId || notification.recipientId?.toString();
    return {
      notificationId: notification._id.toString(),
      recipientId: targetRecipientId,
      channel: notification.channel,
      type: notification.type,
      category: notification.category,
      title: notification.title,
      message: notification.message,
      messageEn: notification.messageEn,
      data: notification.data,
      payload: this.buildNotificationPayload(notification, targetRecipientId),
      priority: notification.priority,
      actionUrl: (notification as any).actionUrl,
      navigationType: (notification as any).navigationType,
      navigationTarget: (notification as any).navigationTarget,
      navigationParams: (notification as any).navigationParams,
      trackingId: notification.trackingId,
      batchId: notification.batchId,
      campaign: notification.metadata?.campaign,
    };
  }

  buildNotificationPayload(
    notification: Pick<
      UnifiedNotification,
      | 'type'
      | 'category'
      | 'priority'
      | 'channel'
      | 'actionUrl'
      | 'navigationType'
      | 'navigationTarget'
      | 'navigationParams'
      | 'data'
      | 'batchId'
      | 'trackingId'
      | 'createdAt'
      | 'metadata'
    > & { _id?: unknown },
    recipientId?: string,
  ): Record<string, string> {
    const sourceData = notification.data || {};
    const entityType = sourceData.entityType || sourceData.type;
    const entityId =
      sourceData.entityId ||
      sourceData.orderId ||
      sourceData.productId ||
      sourceData.categoryId ||
      sourceData.serviceRequestId;
    const payload: Record<string, unknown> = {
      notificationId: notification._id?.toString() || '',
      trackingId: notification.trackingId || notification._id?.toString() || '',
      type: notification.type,
      category: notification.category,
      priority: notification.priority,
      channel: notification.channel,
      recipientId,
      actionUrl: notification.actionUrl,
      navigationType: notification.navigationType || NotificationNavigationType.NONE,
      navigationTarget: notification.navigationTarget,
      navigationParams: notification.navigationParams,
      entityType,
      entityId,
      batchId: notification.batchId,
      campaign: notification.metadata?.campaign,
      createdAt: notification.createdAt?.toISOString?.() || new Date().toISOString(),
      ...sourceData,
    };

    return Object.entries(payload).reduce<Record<string, string>>((acc, [key, value]) => {
      if (value === undefined || value === null) return acc;
      acc[key] = typeof value === 'string' ? value : JSON.stringify(value);
      return acc;
    }, {});
  }

  private resolveRecipientName(user?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  }): string {
    const firstName = user?.firstName?.trim() || '';
    const lastName = user?.lastName?.trim() || '';
    const fullName = `${firstName} ${lastName}`.trim();

    if (fullName) return fullName;
    if (firstName) return firstName;
    if (user?.phone) return user.phone;
    return 'مهندسنا';
  }

  private buildPersonalizationContext(
    userId: string,
    user?: {
      firstName?: string;
      lastName?: string;
      phone?: string;
    },
  ): Record<string, unknown> {
    const firstName = user?.firstName?.trim() || '';
    const lastName = user?.lastName?.trim() || '';
    const fullName = `${firstName} ${lastName}`.trim();
    const name = this.resolveRecipientName(user);

    return {
      name,
      fullName: fullName || name,
      firstName: firstName || name,
      lastName,
      phone: user?.phone || '',
      userId,
      recipientName: name,
      recipientFullName: fullName || name,
      recipientFirstName: firstName || name,
      recipientLastName: lastName,
      recipientPhone: user?.phone || '',
    };
  }

  private renderPersonalizedText(text: string, context: Record<string, unknown>): string {
    if (!text) return text;

    const rendered = text.replace(NotificationService.PLACEHOLDER_REGEX, (_match, key: string) => {
      const value = context[key];
      if (value === null || value === undefined) return '';
      return String(value);
    });

    const name = context.name;
    if (typeof name !== 'string' || !name.trim()) {
      return rendered;
    }

    return rendered.replace(NotificationService.NAME_ALIAS_REGEX, name);
  }

  private personalizeBulkPayload(
    dto: BulkSendNotificationDto,
    userId: string,
    user?: {
      firstName?: string;
      lastName?: string;
      phone?: string;
    },
  ): Pick<CreateNotificationDto, 'title' | 'message' | 'messageEn' | 'data'> {
    const personalizationContext = this.buildPersonalizationContext(userId, user);
    const renderContext = {
      ...(dto.data || {}),
      ...personalizationContext,
    };

    return {
      title: this.renderPersonalizedText(dto.title, renderContext),
      message: this.renderPersonalizedText(dto.message, renderContext),
      messageEn: this.renderPersonalizedText(dto.messageEn, renderContext),
      data: {
        ...(dto.data || {}),
        recipientName: personalizationContext.recipientName,
        recipientFirstName: personalizationContext.recipientFirstName,
        recipientLastName: personalizationContext.recipientLastName,
      },
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

      const visibleUntil = this.getNotificationVisibleUntil(dto.scheduledFor);

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
        visibleUntil,
        expiredAt: visibleUntil,
        isExpired: false,
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
            const sentAt = new Date();
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
                actionUrl: savedNotification.actionUrl,
                navigationType: savedNotification.navigationType,
                navigationTarget: savedNotification.navigationTarget,
                createdAt: savedNotification.createdAt,
                sentAt,
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
                { $set: { status: NotificationStatus.SENT, sentAt } },
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
          const sentAt = new Date();
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
              actionUrl: savedNotification.actionUrl,
              navigationType: savedNotification.navigationType,
              navigationTarget: savedNotification.navigationTarget,
              createdAt: savedNotification.createdAt,
              sentAt,
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
            { $set: { status: NotificationStatus.SENT, sentAt } },
          );
        }
      } else if (targetRoles && targetRoles.length > 0) {
        // إرسال الإشعارات الموجهة للأدوار لجميع المستخدمين الذين لديهم هذه الأدوار
        if (
          channel === NotificationChannel.DASHBOARD ||
          channel === NotificationChannel.IN_APP ||
          channel === NotificationChannel.PUSH
        ) {
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
            const sentAt = new Date();
            const visibleUntil = this.getNotificationVisibleUntil();

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
                status: NotificationStatus.QUEUED,
                priority: savedNotification.priority,
                category: savedNotification.category,
                targetRoles: savedNotification.targetRoles,
                recipientId: new Types.ObjectId(userId),
                templateId: savedNotification.templateId,
                templateKey: savedNotification.templateKey,
                scheduledFor: savedNotification.scheduledFor,
                isSystemGenerated: savedNotification.isSystemGenerated,
                createdBy: savedNotification.createdBy,
                batchId: roleBatchId,
                visibleUntil,
                expiredAt: visibleUntil,
                isExpired: false,
              };
            });

            // حفظ جميع الإشعارات في قاعدة البيانات
            const createdNotifications = await this.notificationModel.insertMany(userNotifications);
            this.logger.log(
              `Created ${createdNotifications.length} notification copies for users with roles [${rolesToSend.join(', ')}]`,
            );

            // Log للتحقق من recipientId في النسخ
            for (const notif of createdNotifications) {
              this.logger.debug(
                `Created notification copy ${notif._id} for recipient ${notif.recipientId?.toString() || 'undefined'}`,
              );
              if (notif.recipientId) {
                await this.queueService.addToQueue(
                  this.createJobData(
                    notif as UnifiedNotificationDocument,
                    notif.recipientId.toString(),
                  ),
                );
              }
            }

            // إرسال الإشعار لجميع المستخدمين عبر WebSocket
            const sentCount = createdNotifications.length || this.webSocketService.sendToMultipleUsers(
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
                actionUrl: savedNotification.actionUrl,
                navigationType: savedNotification.navigationType,
                navigationTarget: savedNotification.navigationTarget,
                createdAt: savedNotification.createdAt,
                sentAt,
                isRead: false,
              },
              '/notifications', // ✅ تمرير namespace
            );

            // تحديث حالة الإشعار الأصلي إلى "sent"
            await this.notificationModel.updateOne(
              { _id: savedNotification._id },
              {
                $set: {
                  status: NotificationStatus.QUEUED,
                },
              },
            );

            this.logger.log(
              `Notification ${dto.type} queued for ${sentCount}/${userIds.length} users with roles [${rolesToSend.join(', ')}] (${createdNotifications.length} copies created)`,
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

        const jobData = this.createJobData(
          notification as UnifiedNotificationDocument,
          recipientId,
        );
        await this.queueService.addToQueue(jobData);

        await this.notificationModel.updateOne(
          { _id: notificationId },
          {
            $set: {
              status: NotificationStatus.QUEUED,
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

    const targetFilter = {
      $or: [
        { recipientId: userIdObj },
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

    const filter: Record<string, unknown> = {
      $and: [targetFilter, this.buildUserVisibleNotificationFilter()],
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
        $and: [
          {
            recipientId: new Types.ObjectId(userId),
            status: { $ne: NotificationStatus.READ },
          },
          this.buildUserVisibleNotificationFilter(),
        ],
      },
      {
        $set: {
          status: NotificationStatus.READ,
          readAt: new Date(),
        },
      },
    );

    return result.modifiedCount;
  }

  /**
   * الحصول على عدد الإشعارات غير المقروءة
   */
  async getUnreadCount(userId: string): Promise<number> {
    const userIdObj = new Types.ObjectId(userId);

    return this.notificationModel.countDocuments({
      $and: [
        {
          recipientId: userIdObj,
          status: { $ne: NotificationStatus.READ },
        },
        this.buildUserVisibleNotificationFilter(),
      ],
    });
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
      groupByBatch = true,
      campaign,
      visibilityStatus,
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

    // Visibility status filter (for admin dashboard)
    if (visibilityStatus === 'active') {
      filter.visibleUntil = { $gt: new Date() };
    } else if (visibilityStatus === 'expired') {
      filter.visibleUntil = { $lte: new Date() };
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
   * جدولة إرسال إشعارات مجمعة في الخلفية عبر Bull Queue
   * تُستخدم من Endpoint الإدارة لتفادي الـ timeout عند الأعداد الكبيرة.
   */
  async queueBulkSend(dto: BulkSendNotificationDto): Promise<{
    batchId: string;
    accepted: boolean;
    total: number;
  }> {
    const total = dto.targetUserIds?.length ?? 0;
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await this.bulkQueue.add('bulkSend', { dto, batchId });

    this.logger.log(
      `Bulk send request queued: batchId=${batchId}, total=${total}, type=${dto.type}, channel=${dto.channel}`,
    );

    return { batchId, accepted: true, total };
  }

  /**
   * إرسال إشعارات مجمعة
   * ملاحظة: يتم استدعاؤها حالياً من الـ Bulk Processor في الخلفية
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

    const batchId = dto.batchId || `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const targetUserIds = Array.from(new Set(dto.targetUserIds.filter(Boolean)));

    const validObjectIds = targetUserIds
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));

    const users = await this.userModel
      .find({ _id: { $in: validObjectIds } })
      .select('_id firstName lastName phone')
      .lean();

    const usersById = new Map(
      users.map((user) => {
        const userId =
          user._id instanceof Types.ObjectId ? user._id.toString() : String(user._id);
        return [userId, user];
      }),
    );

    for (const userId of targetUserIds) {
      try {
        const personalizedPayload = this.personalizeBulkPayload(dto, userId, usersById.get(userId));

        const notificationData: CreateNotificationDto = {
          type: dto.type,
          title: personalizedPayload.title,
          message: personalizedPayload.message,
          messageEn: personalizedPayload.messageEn,
          data: personalizedPayload.data,
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

  async archiveExpiredUserVisibleNotifications(): Promise<number> {
    const now = new Date();

    const result = await this.notificationModel.updateMany(
      {
        visibleUntil: { $lte: now },
        hiddenFromUserAt: { $exists: false },
      },
      {
        $set: {
          hiddenFromUserAt: now,
        },
      },
    );

    this.logger.log(`Archived ${result.modifiedCount} expired user-visible notifications`);
    return result.modifiedCount;
  }

  /**
   * حذف الإشعارات القديمة
   */
  async deleteOldNotifications(olderThanDays: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const now = new Date();

    const result = await this.notificationModel.deleteMany({
      createdAt: { $lt: cutoffDate },
      $or: [
        { scheduledFor: { $exists: false } },
        { scheduledFor: null },
        { scheduledFor: { $lt: now } },
      ],
      status: {
        $nin: [
          NotificationStatus.PENDING,
          NotificationStatus.QUEUED,
          NotificationStatus.SENDING,
        ],
      },
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
          $set: {
            isActive: false,
            lastUsedAt: new Date(),
          },
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
          $set: {
            isActive: false,
            lastUsedAt: new Date(),
          },
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
        category: notification.category,
        priority: notification.priority,
        data: notification.data,
        actionUrl: notification.actionUrl,
        navigationType: notification.navigationType,
        navigationTarget: notification.navigationTarget,
        createdAt: notification.createdAt,
        sentAt: notification.sentAt,
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
            data: {
              ...(notification.data || {}),
              actionUrl: (notification as any).actionUrl,
              navigationType: notification.navigationType,
              navigationTarget: notification.navigationTarget,
            },
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
      const now = new Date();
      let deviceToken = await this.deviceTokenModel.findOne({ token });

      if (deviceToken) {
        const previousUserId = deviceToken.userId.toString();
        deviceToken.userId = new Types.ObjectId(userId);
        // تحديث Token موجود
        deviceToken.isActive = true;
        deviceToken.lastUsedAt = now;
        deviceToken.platform = platform as any;
        if (userAgent) deviceToken.userAgent = userAgent;
        if (appVersion) deviceToken.appVersion = appVersion;
        await deviceToken.save();

        this.logger.log(
          previousUserId === userId
            ? `Device token updated for user ${userId}`
            : `Device token moved from user ${previousUserId} to user ${userId}`,
        );
        return {
          success: true,
          message:
            previousUserId === userId
              ? 'Device token updated successfully'
              : 'Device token moved to current user successfully',
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
        { $set: { isActive: false } },
      );

      // إنشاء Token جديد
      deviceToken = new this.deviceTokenModel({
        userId: new Types.ObjectId(userId),
        token: token,
        platform: platform as any,
        userAgent: userAgent,
        appVersion: appVersion,
        isActive: true,
        lastUsedAt: now,
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

  async getFcmHealth(): Promise<{
    configured: boolean;
    initialized: boolean;
    projectId?: string;
    clientEmail?: string;
    activeDeviceTokens: number;
    usersWithoutDevices: number;
    invalidTokensLast7Days: number;
    providerFailuresLast24h: number;
    lastError?: string | null;
  }> {
    const health = this.fcmAdapter.getHealth();
    const now = Date.now();
    const last24h = new Date(now - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const [
      activeDeviceTokens,
      activeUsers,
      usersWithDevices,
      invalidTokensLast7Days,
      providerFailuresLast24h,
    ] = await Promise.all([
      this.deviceTokenModel.countDocuments({ isActive: true }),
      this.userModel.countDocuments({ status: UserStatus.ACTIVE }),
      this.deviceTokenModel.distinct('userId', { isActive: true }),
      this.notificationLogModel.countDocuments({
        channel: NotificationChannel.PUSH,
        createdAt: { $gte: last7Days },
        $or: [
          { errorCode: { $in: ['INVALID_TOKEN', 'REGISTRATION_TOKEN_NOT_REGISTERED'] } },
          { deliveryStatus: NotificationDeliveryStatus.INVALID_TOKEN },
        ],
      }),
      this.notificationLogModel.countDocuments({
        channel: NotificationChannel.PUSH,
        createdAt: { $gte: last24h },
        deliveryStatus: {
          $in: [
            NotificationDeliveryStatus.FAILED,
            NotificationDeliveryStatus.PROVIDER_NOT_CONFIGURED,
            NotificationDeliveryStatus.INVALID_TOKEN,
          ],
        },
      }),
    ]);

    return {
      configured: health.configured,
      initialized: health.initialized,
      projectId: health.projectId,
      clientEmail: health.clientEmail,
      activeDeviceTokens,
      usersWithoutDevices: Math.max(0, activeUsers - usersWithDevices.length),
      invalidTokensLast7Days,
      providerFailuresLast24h,
      lastError: health.lastError || null,
    };
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
      const sentAt = new Date();
      const copyVisibleUntil = this.getNotificationVisibleUntil();
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
          sentAt,
          isSystemGenerated: notification.isSystemGenerated,
          createdBy: notification.createdBy,
          visibleUntil: copyVisibleUntil,
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
          actionUrl: notification.actionUrl,
          navigationType: notification.navigationType,
          navigationTarget: notification.navigationTarget,
          createdAt: notification.createdAt,
          sentAt,
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
          actionUrl: notification.actionUrl,
          navigationType: notification.navigationType,
          navigationTarget: notification.navigationTarget,
          createdAt: notification.createdAt,
          sentAt: notification.sentAt,
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
    deadLetter: { waiting: number; active: number; completed: number; failed: number; delayed: number };
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
    // جلب الإشعار مع بيانات المستلم (User يستخدم firstName/lastName)
    const notification = await this.notificationModel
      .findById(notificationId)
      .populate('recipientId', 'firstName lastName phone')
      .lean();

    // جلب جميع السجلات للإشعار
    const logs = await this.notificationLogModel
      .find({ notificationId: new Types.ObjectId(notificationId) })
      .populate('userId', 'firstName lastName phone')
      .sort({ createdAt: -1 })
      .lean();

    // تحضير البيانات (User model uses firstName/lastName, no email)
    const logsWithUserInfo = logs.map((log) => {
      const user = log.userId as { _id?: unknown; firstName?: string; lastName?: string; phone?: string } | null;
      const userName =
        user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.phone || 'غير معروف' : 'غير معروف';
      const userPhone = user?.phone || 'غير متوفر';
      return {
        _id: log._id.toString(),
        userId: user?._id?.toString() || (log.userId as Types.ObjectId)?.toString() || '',
        userName,
        userEmail: userPhone,
        status: log.status,
        deliveryStatus: log.deliveryStatus,
        channel: log.channel,
        sentAt: log.sentAt,
        providerAcceptedAt: log.providerAcceptedAt,
        receivedAt: log.receivedAt,
        openedAt: log.openedAt,
        deliveredAt: log.deliveredAt,
        failedAt: log.failedAt,
        errorMessage: log.errorMessage,
        errorCode: log.errorCode,
        deviceToken: log.deviceToken,
        platform: log.platform,
        providerMessageId: log.providerMessageId,
        createdAt: log.createdAt || new Date(),
      };
    });

    // حساب الملخص
    const summary = {
      total: logsWithUserInfo.length,
      sent: logsWithUserInfo.filter((log) => log.deliveryStatus === NotificationDeliveryStatus.PROVIDER_ACCEPTED).length,
      failed: logsWithUserInfo.filter((log) => log.deliveryStatus === NotificationDeliveryStatus.FAILED).length,
      pending: logsWithUserInfo.filter((log) =>
        !log.deliveryStatus ||
        log.deliveryStatus === NotificationDeliveryStatus.QUEUED ||
        log.deliveryStatus === NotificationDeliveryStatus.SENDING,
      ).length,
      totalRecipients: new Set(logsWithUserInfo.map((log) => log.userId).filter(Boolean)).size,
      totalDeviceAttempts: logsWithUserInfo.filter((log) => !!log.deviceToken).length,
      providerAccepted: logsWithUserInfo.filter((log) => log.deliveryStatus === NotificationDeliveryStatus.PROVIDER_ACCEPTED).length,
      receivedByApp: logsWithUserInfo.filter((log) => log.deliveryStatus === NotificationDeliveryStatus.RECEIVED_BY_APP).length,
      opened: logsWithUserInfo.filter((log) => log.deliveryStatus === NotificationDeliveryStatus.OPENED).length,
      noDeviceToken: logsWithUserInfo.filter((log) => log.deliveryStatus === NotificationDeliveryStatus.NO_DEVICE_TOKEN).length,
      skippedByPreferences: logsWithUserInfo.filter((log) => log.deliveryStatus === NotificationDeliveryStatus.SKIPPED_BY_PREFERENCES).length,
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
      .populate('recipientId', 'firstName lastName phone')
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
    const notificationIds = notifications.map((notification) => notification._id);
    const deliveryLogs = await this.notificationLogModel
      .find({
        $or: [
          { batchId },
          { notificationId: { $in: notificationIds } },
        ],
      })
      .populate('userId', 'firstName lastName phone')
      .sort({ createdAt: -1 })
      .lean();

    if (deliveryLogs.length > 0) {
      const logs = deliveryLogs.map((log) => {
        const user = log.userId as { _id?: unknown; firstName?: string; lastName?: string; phone?: string } | null;
        const userName =
          user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.phone || 'غير معروف' : 'غير معروف';
        const userPhone = user?.phone || 'غير متوفر';
        return {
          _id: log._id.toString(),
          userId: user?._id?.toString() || (log.userId as Types.ObjectId)?.toString() || '',
          userName,
          userEmail: userPhone,
          status: log.status,
          deliveryStatus: log.deliveryStatus,
          channel: log.channel,
          sentAt: log.sentAt,
          providerAcceptedAt: log.providerAcceptedAt,
          receivedAt: log.receivedAt,
          openedAt: log.openedAt,
          deliveredAt: log.deliveredAt,
          failedAt: log.failedAt,
          errorMessage: log.errorMessage,
          errorCode: log.errorCode,
          deviceToken: log.deviceToken,
          platform: log.platform,
          providerMessageId: log.providerMessageId,
          createdAt: log.createdAt || new Date(),
        };
      });

      const summary = {
        total: logs.length,
        sent: logs.filter((log) => log.deliveryStatus === NotificationDeliveryStatus.PROVIDER_ACCEPTED).length,
        failed: logs.filter((log) => log.deliveryStatus === NotificationDeliveryStatus.FAILED).length,
        pending: logs.filter((log) =>
          !log.deliveryStatus ||
          log.deliveryStatus === NotificationDeliveryStatus.QUEUED ||
          log.deliveryStatus === NotificationDeliveryStatus.SENDING,
        ).length,
        totalRecipients: new Set(logs.map((log) => log.userId).filter(Boolean)).size,
        totalDeviceAttempts: logs.filter((log) => !!log.deviceToken).length,
        providerAccepted: logs.filter((log) => log.deliveryStatus === NotificationDeliveryStatus.PROVIDER_ACCEPTED).length,
        receivedByApp: logs.filter((log) => log.deliveryStatus === NotificationDeliveryStatus.RECEIVED_BY_APP).length,
        opened: logs.filter((log) => log.deliveryStatus === NotificationDeliveryStatus.OPENED).length,
        noDeviceToken: logs.filter((log) => log.deliveryStatus === NotificationDeliveryStatus.NO_DEVICE_TOKEN).length,
        skippedByPreferences: logs.filter((log) => log.deliveryStatus === NotificationDeliveryStatus.SKIPPED_BY_PREFERENCES).length,
      };

      return {
        notification: firstNotification as UnifiedNotificationDocument,
        logs,
        summary,
      };
    }

    const logs = notifications.map((notif) => {
      const user = notif.recipientId as { _id?: unknown; firstName?: string; lastName?: string; phone?: string } | null;
      const userName =
        user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.phone || 'غير معروف' : 'غير معروف';
      const userPhone = user?.phone || 'غير متوفر';
      return {
        _id: notif._id.toString(),
        userId: user?._id?.toString() || (notif.recipientId as Types.ObjectId)?.toString() || '',
        userName,
        userEmail: userPhone,
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
