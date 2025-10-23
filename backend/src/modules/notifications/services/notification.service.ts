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
import { AppException } from '../../../shared/exceptions/app.exception';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectModel(UnifiedNotification.name)
    private notificationModel: Model<UnifiedNotificationDocument>,
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

      return savedNotification;
    } catch (error) {
      this.logger.error('Failed to create notification:', error);
      throw new AppException('NOTIFICATION_CREATE_FAILED', 'فشل في إنشاء الإشعار', error, 500);
    }
  }

  /**
   * الحصول على إشعار بالمعرف
   */
  async getNotificationById(id: string): Promise<UnifiedNotification> {
    const notification = await this.notificationModel.findById(id).lean();

    if (!notification) {
      throw new AppException('NOTIFICATION_NOT_FOUND', 'الإشعار غير موجود', null, 404);
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
      throw new AppException('NOTIFICATION_NOT_FOUND', 'الإشعار غير موجود', null, 404);
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

      const [total, byType, byStatus, byChannel, byCategory, unreadCount, readCount, deliveredCount] =
        await Promise.all([
          this.notificationModel.countDocuments(baseFilter),
          this.notificationModel.aggregate([
            { $match: baseFilter },
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $project: { type: '$_id', count: 1, _id: 0 } },
          ]).catch(() => []),
          this.notificationModel.aggregate([
            { $match: baseFilter },
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $project: { status: '$_id', count: 1, _id: 0 } },
          ]).catch(() => []),
          this.notificationModel.aggregate([
            { $match: baseFilter },
            { $group: { _id: '$channel', count: { $sum: 1 } } },
            { $project: { channel: '$_id', count: 1, _id: 0 } },
          ]).catch(() => []),
          this.notificationModel.aggregate([
            { $match: baseFilter },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $project: { category: '$_id', count: 1, _id: 0 } },
          ]).catch(() => []),
          this.notificationModel.countDocuments({
            ...baseFilter,
            status: { $ne: NotificationStatus.READ },
          }).catch(() => 0),
          this.notificationModel.countDocuments({
            ...baseFilter,
            status: NotificationStatus.READ,
          }).catch(() => 0),
          this.notificationModel.countDocuments({
            ...baseFilter,
            status: NotificationStatus.DELIVERED,
          }).catch(() => 0),
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
}
