import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument, NotificationType, NotificationStatus, NotificationChannel } from './schemas/notification.schema';

export interface CreateNotificationDto {
  type: NotificationType;
  title: string;
  message: string;
  messageEn: string;
  data?: Record<string, unknown>;
  channel?: NotificationChannel;
  recipientId?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  scheduledFor?: Date;
  createdBy?: string;
  isSystemGenerated?: boolean;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
  ) {}

  /**
   * Create a new notification
   */
  async createNotification(dto: CreateNotificationDto): Promise<Notification> {
    try {
      const notification = new this.notificationModel({
        ...dto,
        recipientId: dto.recipientId ? dto.recipientId : undefined,
        createdBy: dto.createdBy ? dto.createdBy : undefined,
        scheduledFor: dto.scheduledFor || new Date(),
      });

      const savedNotification = await notification.save();
      this.logger.log(`Notification created: ${savedNotification._id} (${dto.type})`);

      return savedNotification;
    } catch (error) {
      this.logger.error('Failed to create notification:', error);
      throw error;
    }
  }

  /**
   * Create stock alert notification
   */
  async createStockAlert(alert: {
    type: 'LOW_STOCK' | 'OUT_OF_STOCK';
    productId: string;
    productName: string;
    currentStock?: number;
    minStock?: number;
    message: string;
    messageEn: string;
  }): Promise<Notification> {
    return this.createNotification({
      type: alert.type as NotificationType,
      title: alert.type === 'LOW_STOCK' ? 'تنبيه مخزون منخفض' : 'تنبيه نفاد المخزون',
      message: alert.message,
      messageEn: alert.messageEn,
      data: {
        productId: alert.productId,
        currentStock: alert.currentStock,
        minStock: alert.minStock,
      },
      channel: NotificationChannel.DASHBOARD,
      isSystemGenerated: true,
    });
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(userId: string, limit = 20, offset = 0): Promise<{
    notifications: Notification[];
    total: number;
  }> {
    const [notifications, total] = await Promise.all([
      this.notificationModel
        .find({ recipientId: userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .lean(),
      this.notificationModel.countDocuments({ recipientId: userId }),
    ]);

    return { notifications, total };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const result = await this.notificationModel.updateOne(
      { _id: notificationId, recipientId: userId, status: { $ne: NotificationStatus.READ } },
      { 
        status: NotificationStatus.READ,
        readAt: new Date()
      }
    );

    return result.modifiedCount > 0;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.notificationModel.updateMany(
      { recipientId: userId, status: { $ne: NotificationStatus.READ } },
      { 
        status: NotificationStatus.READ,
        readAt: new Date()
      }
    );

    return result.modifiedCount;
  }

  /**
   * Get unread notifications count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      recipientId: userId,
      status: { $ne: NotificationStatus.READ }
    });
  }

  /**
   * Get notifications by type and status
   */
  async getNotificationsByType(type: NotificationType, status?: NotificationStatus): Promise<Notification[]> {
    const query: Record<string, unknown> = { type };
    if (status) {
      query.status = status;
    }

    return this.notificationModel.find(query).sort({ createdAt: -1 }).lean();
  }

  /**
   * Update notification status
   */
  async updateNotificationStatus(
    notificationId: string, 
    status: NotificationStatus, 
    errorMessage?: string
  ): Promise<boolean> {
    const updateData: Record<string, unknown> = { status };
    
    if (status === NotificationStatus.SENT) {
      updateData.sentAt = new Date();
    } else if (status === NotificationStatus.FAILED) {
      updateData.errorMessage = errorMessage;
      updateData.retryCount = { $inc: 1 };
    }

    const result = await this.notificationModel.updateOne(
      { _id: notificationId },
      updateData
    );

    return result.modifiedCount > 0;
  }

  /**
   * Delete old notifications (cleanup)
   */
  async deleteOldNotifications(olderThanDays = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await this.notificationModel.deleteMany({
      createdAt: { $lt: cutoffDate },
      status: NotificationStatus.READ
    });

    this.logger.log(`Deleted ${result.deletedCount} old notifications`);
    return result.deletedCount;
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    byChannel: Record<string, number>;
    unreadCount: number;
  }> {
    const [total, byType, byStatus, byChannel, unreadCount] = await Promise.all([
      this.notificationModel.countDocuments(),
      this.notificationModel.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $project: { type: '$_id', count: 1, _id: 0 } }
      ]),
      this.notificationModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } }
      ]),
      this.notificationModel.aggregate([
        { $group: { _id: '$channel', count: { $sum: 1 } } },
        { $project: { channel: '$_id', count: 1, _id: 0 } }
      ]),
      this.notificationModel.countDocuments({ status: { $ne: NotificationStatus.READ } })
    ]);

    return {
      total,
      byType: byType.reduce((acc, item) => ({ ...acc, [item.type]: item.count }), {}),
      byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item.status]: item.count }), {}),
      byChannel: byChannel.reduce((acc, item) => ({ ...acc, [item.channel]: item.count }), {}),
      unreadCount,
    };
  }

  // Admin methods
  /**
   * Admin: List notifications with filters
   */
  async adminList(query: {
    page: number;
    limit: number;
    channel?: string;
    status?: string;
    search?: string;
    userId?: string;
  }): Promise<{ items: Notification[]; meta: { total: number; page: number; limit: number } }> {
    const { page, limit, channel, status, search, userId } = query;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    
    if (channel) {
      filter.channel = channel;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (userId) {
      filter.recipientId = userId;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { messageEn: { $regex: search, $options: 'i' } }
      ];
    }

    const [notifications, total] = await Promise.all([
      this.notificationModel
        .find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
      this.notificationModel.countDocuments(filter)
    ]);

    return {
      items: notifications,
      meta: {
        total,
        page,
        limit
      }
    };
  }

  /**
   * Admin: Get available templates
   */
  async getAvailableTemplates(): Promise<string[]> {
    // Return predefined template keys
    return [
      'welcome',
      'order_confirmation',
      'order_shipped',
      'order_delivered',
      'payment_failed',
      'stock_alert',
      'promotion',
      'system_maintenance'
    ];
  }

  /**
   * Admin: Create notification
   */
  async adminCreate(dto: {
    title: string;
    body: string;
    channel: string;
    templateKey?: string;
    payload?: Record<string, unknown>;
    link?: string;
    targetUsers?: string[];
    scheduledAt?: string;
  }): Promise<Notification> {
    const notificationData: CreateNotificationDto = {
      type: NotificationType.SYSTEM_ALERT,
      title: dto.title,
      message: dto.body,
      messageEn: dto.body, // For now, use same as Arabic
      channel: dto.channel as NotificationChannel,
      data: {
        ...dto.payload,
        link: dto.link,
        templateKey: dto.templateKey
      },
      recipientId: dto.targetUsers?.[0], // For single user notifications
      scheduledFor: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      isSystemGenerated: false
    };

    return this.createNotification(notificationData);
  }

  /**
   * Admin: Get notification by ID
   */
  async adminGetById(id: string): Promise<Notification> {
    const notification = await this.notificationModel.findById(id).lean();
    if (!notification) {
      throw new Error('Notification not found');
    }
    return notification;
  }

  /**
   * Admin: Update notification
   */
  async adminUpdate(id: string, dto: {
    title?: string;
    body?: string;
    link?: string;
    payload?: Record<string, unknown>;
  }): Promise<Notification> {
    const updateData: Record<string, unknown> = {};
    
    if (dto.title) updateData.title = dto.title;
    if (dto.body) {
      updateData.message = dto.body;
      updateData.messageEn = dto.body;
    }
    if (dto.link) updateData['data.link'] = dto.link;
    if (dto.payload) updateData.data = { ...(updateData.data as Record<string, unknown>), ...dto.payload };

    const notification = await this.notificationModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).lean();

    if (!notification) {
      throw new Error('Notification not found');
    }

    return notification;
  }

  /**
   * Admin: Send notification
   */
  async adminSend(id: string, dto: {
    targetUsers?: string[];
    scheduledAt?: string;
  }): Promise<{ sent: boolean; message: string }> {
    const notification = await this.notificationModel.findById(id);
    if (!notification) {
      throw new Error('Notification not found');
    }

    // Update notification with target users if provided
    if (dto.targetUsers && dto.targetUsers.length > 0) {
      notification.recipientId = dto.targetUsers[0] as unknown as Types.ObjectId; // For single user
    }

    if (dto.scheduledAt) {
      notification.scheduledFor = new Date(dto.scheduledAt);
    }

    // Mark as sent (in real implementation, this would trigger actual sending)
    notification.status = NotificationStatus.SENT;
    notification.sentAt = new Date();
    
    await notification.save();

    return {
      sent: true,
      message: 'Notification sent successfully'
    };
  }

  /**
   * Admin: Delete notification
   */
  async adminDelete(id: string): Promise<boolean> {
    const result = await this.notificationModel.findByIdAndDelete(id);
    return !!result;
  }

  /**
   * Admin: Get admin statistics
   */
  async getAdminStats(): Promise<{
    total: number;
    sent: number;
    pending: number;
    failed: number;
    read: number;
    byChannel: Record<string, number>;
    byType: Record<string, number>;
  }> {
    const [total, sent, pending, failed, read, byChannel, byType] = await Promise.all([
      this.notificationModel.countDocuments(),
      this.notificationModel.countDocuments({ status: NotificationStatus.SENT }),
      this.notificationModel.countDocuments({ status: NotificationStatus.PENDING }),
      this.notificationModel.countDocuments({ status: NotificationStatus.FAILED }),
      this.notificationModel.countDocuments({ status: NotificationStatus.READ }),
      this.notificationModel.aggregate([
        { $group: { _id: '$channel', count: { $sum: 1 } } },
        { $project: { channel: '$_id', count: 1, _id: 0 } }
      ]),
      this.notificationModel.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $project: { type: '$_id', count: 1, _id: 0 } }
      ])
    ]);

    return {
      total,
      sent,
      pending,
      failed,
      read,
      byChannel: byChannel.reduce((acc, item) => ({ ...acc, [item.channel]: item.count }), {}),
      byType: byType.reduce((acc, item) => ({ ...acc, [item.type]: item.count }), {})
    };
  }

  /**
   * Admin: Bulk send notifications
   */
  async adminBulkSend(dto: {
    title: string;
    body: string;
    channel: string;
    templateKey?: string;
    payload?: Record<string, unknown>;
    link?: string;
    targetUsers: string[];
    scheduledAt?: string;
  }): Promise<{ sent: number; failed: number; results: Array<{ userId: string; success: boolean; error?: string }> }> {
    const results: Array<{ userId: string; success: boolean; error?: string }> = [];
    let sent = 0;
    let failed = 0;

    for (const userId of dto.targetUsers) {
      try {
        const notificationData: CreateNotificationDto = {
          type: NotificationType.SYSTEM_ALERT,
          title: dto.title,
          message: dto.body,
          messageEn: dto.body,
          channel: dto.channel as NotificationChannel,
          data: {
            ...dto.payload,
            link: dto.link,
            templateKey: dto.templateKey
          },
          recipientId: userId,
          scheduledFor: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
          isSystemGenerated: false
        };

        await this.createNotification(notificationData);
        results.push({ userId, success: true });
        sent++;
      } catch (error) {
        results.push({ 
          userId, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        failed++;
      }
    }

    return { sent, failed, results };
  }

  /**
   * Emit notification (for testing)
   */
  async emit(userId: string, templateKey: string, payload: Record<string, unknown>): Promise<void> {
    // This is a simplified emit method for testing
    const notificationData: CreateNotificationDto = {
      type: NotificationType.SYSTEM_ALERT,
      title: `Test notification for ${templateKey}`,
      message: `Test message with template: ${templateKey}`,
      messageEn: `Test message with template: ${templateKey}`,
      channel: NotificationChannel.DASHBOARD,
      data: payload,
      recipientId: userId,
      isSystemGenerated: false
    };

    await this.createNotification(notificationData);
  }
}