import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  UnifiedNotification,
  UnifiedNotificationDocument,
} from '../schemas/unified-notification.schema';
import {
  CreateNotificationDto,
  UpdateNotificationDto,
  ListNotificationsDto,
  MarkAsReadDto,
  BulkSendNotificationDto,
} from '../dto/unified-notification.dto';
import {
  NotificationStatus,
  NotificationChannel,
  NotificationPriority,
} from '../enums/notification.enums';
import {
  NotificationNotFoundException,
  NotificationException,
  ErrorCode,
} from '../../../shared/exceptions';
import { WebSocketService } from '../../../shared/websocket/websocket.service';
import { PushNotificationAdapter } from '../adapters/notification.adapters';
import { DeviceToken, DeviceTokenDocument } from '../schemas/device-token.schema';
import { User, UserDocument, UserStatus } from '../../users/schemas/user.schema';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectModel(UnifiedNotification.name)
    private notificationModel: Model<UnifiedNotificationDocument>,
    @InjectModel(DeviceToken.name)
    private deviceTokenModel: Model<DeviceTokenDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private readonly webSocketService: WebSocketService,
    private readonly pushNotificationAdapter: PushNotificationAdapter,
  ) {}

  // ===== Core CRUD Operations =====

  /**
   * إنشاء إشعار جديد
   */
  async createNotification(dto: CreateNotificationDto): Promise<UnifiedNotification> {
    try {
      const notification = new this.notificationModel({
        ...dto,
        recipientId: dto.recipientId ? new Types.ObjectId(dto.recipientId) : undefined,
        createdBy: dto.createdBy ? new Types.ObjectId(dto.createdBy) : undefined,
        scheduledFor: dto.scheduledFor || new Date(),
        isSystemGenerated: dto.isSystemGenerated || false,
        priority: dto.priority || NotificationPriority.MEDIUM,
        channel: dto.channel || NotificationChannel.IN_APP,
      });

      const savedNotification = await notification.save();
      this.logger.log(`Notification created: ${savedNotification._id} (${dto.type})`);

      // إرسال الإشعار حسب القناة
      if (dto.recipientId) {
        if (dto.channel === NotificationChannel.IN_APP) {
          // IN_APP: إرسال عبر WebSocket فقط - المستخدم موجود داخل التطبيق
          this.webSocketService.sendToUser(dto.recipientId, 'notification:new', {
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
          });
        } else if (dto.channel === NotificationChannel.PUSH) {
          // PUSH: إرسال Push Notification فقط - المستخدم خارج التطبيق
          this.sendPushNotification(savedNotification, dto.recipientId).catch((error) => {
            this.logger.error(
              `Failed to send push notification: ${error instanceof Error ? error.message : String(error)}`,
            );
          });
        } else if (dto.channel === NotificationChannel.DASHBOARD) {
          // DASHBOARD: خاص بالإداريين - حفظ في قاعدة البيانات فقط
          // يمكن إضافة WebSocket للإداريين هنا إذا لزم الأمر
          this.logger.log(`Dashboard notification created for admin: ${dto.recipientId}`);
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
    const notification = await this.notificationModel.findByIdAndUpdate(
      id,
      { $set: dto },
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

  // ===== User Operations =====

  /**
   * الحصول على إشعارات المستخدم
   */
  async getUserNotifications(
    userId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<{ notifications: UnifiedNotification[]; total: number }> {
    const [notifications, total] = await Promise.all([
      this.notificationModel
        .find({ recipientId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .lean(),
      this.notificationModel.countDocuments({ recipientId: new Types.ObjectId(userId) }),
    ]);

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
    return this.notificationModel.countDocuments({
      recipientId: new Types.ObjectId(userId),
      status: { $ne: NotificationStatus.READ },
    });
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
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt = { $gte: new Date(startDate) };
      }
      if (endDate) {
        filter.createdAt = { $lte: new Date(endDate) };
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
  }> {
    const results: Array<{ userId: string; success: boolean; error?: string }> = [];
    let sent = 0;
    let failed = 0;

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

    this.logger.log(`Bulk send completed: ${sent} sent, ${failed} failed`);
    return { sent, failed, results };
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
        this.logger.debug(`No active device tokens found for user ${userId}`);
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
}
