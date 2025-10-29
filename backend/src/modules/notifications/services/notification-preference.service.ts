import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  NotificationPreference,
  NotificationPreferenceDocument,
} from '../schemas/notification-preference.schema';
import { UpdatePreferenceDto } from '../dto/unified-notification.dto';
import { NotificationCategory } from '../enums/notification.enums';
import { 
  NotificationException,
  ErrorCode 
} from '../../../shared/exceptions';

interface FrequencyLimits {
  maxNotificationsPerDay?: number;
  maxEmailsPerWeek?: number;
  maxSmsPerMonth?: number;
  maxPushPerHour?: number;
}

@Injectable()
export class NotificationPreferenceService {
  private readonly logger = new Logger(NotificationPreferenceService.name);

  constructor(
    @InjectModel(NotificationPreference.name)
    private preferenceModel: Model<NotificationPreferenceDocument>,
  ) {}

  /**
   * الحصول على تفضيلات المستخدم
   */
  async getUserPreferences(userId: string): Promise<NotificationPreference> {
    let preferences = await this.preferenceModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean();

    if (!preferences) {
      // إنشاء تفضيلات افتراضية إذا لم توجد
      const defaultPrefs = await this.createDefaultPreferences(userId);
      preferences = defaultPrefs.toObject();
    }

    return preferences as NotificationPreference;
  }

  /**
   * تحديث تفضيلات المستخدم
   */
  async updateUserPreferences(
    userId: string,
    dto: UpdatePreferenceDto,
  ): Promise<NotificationPreference> {
    try {
      const updateData = {
        ...dto,
        lastModifiedAt: new Date(),
        lastModifiedBy: 'user',
      };

      const preferences = await this.preferenceModel.findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        { $set: updateData },
        { new: true, upsert: true },
      );

      this.logger.log(`Preferences updated for user: ${userId}`);
      return preferences;
    } catch (error) {
      this.logger.error('Failed to update preferences:', error);
      throw new NotificationException(ErrorCode.NOTIFICATION_PREFERENCE_UPDATE_FAILED, { error: error instanceof Error ? error.message : String(error) });
    }
  }

  /**
   * إنشاء تفضيلات افتراضية
   */
  async createDefaultPreferences(userId: string): Promise<NotificationPreferenceDocument> {
    try {
      const defaultPreferences = {
        userId: new Types.ObjectId(userId),
        enableNotifications: true,
        enableInApp: true,
        enablePush: true,
        enableSms: false,
        enableEmail: true,
        quietHours: {
          enabled: false,
          startTime: '22:00',
          endTime: '08:00',
          timezone: 'Asia/Riyadh',
          days: [0, 1, 2, 3, 4, 5, 6], // جميع الأيام
        },
        categoryPreferences: {
          [NotificationCategory.ORDER]: {
            inApp: true,
            push: true,
            sms: false,
            email: true,
          },
          [NotificationCategory.PRODUCT]: {
            inApp: true,
            push: true,
            sms: false,
            email: false,
          },
          [NotificationCategory.SERVICE]: {
            inApp: true,
            push: true,
            sms: false,
            email: true,
          },
          [NotificationCategory.PROMOTION]: {
            inApp: true,
            push: true,
            sms: false,
            email: true,
          },
          [NotificationCategory.ACCOUNT]: {
            inApp: true,
            push: true,
            sms: false,
            email: true,
          },
          [NotificationCategory.SYSTEM]: {
            inApp: true,
            push: true,
            sms: false,
            email: true,
          },
          [NotificationCategory.SUPPORT]: {
            inApp: true,
            push: true,
            sms: false,
            email: true,
          },
          [NotificationCategory.PAYMENT]: {
            inApp: true,
            push: true,
            sms: false,
            email: true,
          },
          [NotificationCategory.MARKETING]: {
            inApp: true,
            push: false,
            sms: false,
            email: false,
          },
        },
        mutedTemplates: [],
        priorityTemplates: ['ORDER_CONFIRMED', 'PAYMENT_FAILED', 'SYSTEM_ALERT'],
        deliveryPreferences: {
          groupNotifications: true,
          batchInterval: 5, // 5 دقائق
          instantDelivery: false,
        },
        preferredLanguage: 'ar',
        receiveMarketingEmails: true,
        receiveMarketingSms: false,
        receivePromotionalPush: true,
        receiveNewsletter: true,
        frequencyLimits: {
          maxNotificationsPerDay: 50,
          maxEmailsPerWeek: 10,
          maxSmsPerMonth: 5,
          maxPushPerHour: 10,
        },
        lastModifiedAt: new Date(),
        lastModifiedBy: 'system',
      };

      const preferences = new this.preferenceModel(defaultPreferences);
      const savedPreferences = await preferences.save();

      this.logger.log(`Default preferences created for user: ${userId}`);
      return savedPreferences;
    } catch (error) {
      this.logger.error('Failed to create default preferences:', error);
      throw new NotificationException(ErrorCode.NOTIFICATION_PREFERENCE_UPDATE_FAILED, { error: error instanceof Error ? error.message : String(error) });
    }
  }

  /**
   * التحقق من إمكانية إرسال إشعار
   */
  async canSendNotification(
    userId: string,
    type: string,
    channel: string,
  ): Promise<{ canSend: boolean; reason?: string }> {
    try {
      const preferences = await this.getUserPreferences(userId);

      // التحقق من الإشعارات العامة
      if (!preferences.enableNotifications) {
        return { canSend: false, reason: 'Notifications disabled globally' };
      }

      // التحقق من القناة المحددة
      switch (channel) {
        case 'inApp':
          if (!preferences.enableInApp) {
            return { canSend: false, reason: 'In-app notifications disabled' };
          }
          break;
        case 'push':
          if (!preferences.enablePush) {
            return { canSend: false, reason: 'Push notifications disabled' };
          }
          break;
        case 'sms':
          if (!preferences.enableSms) {
            return { canSend: false, reason: 'SMS notifications disabled' };
          }
          break;
        case 'email':
          if (!preferences.enableEmail) {
            return { canSend: false, reason: 'Email notifications disabled' };
          }
          break;
      }

      // التحقق من القوالب المهملة
      if (preferences.mutedTemplates.includes(type)) {
        return { canSend: false, reason: 'Template is muted' };
      }

      // التحقق من ساعات الهدوء
      if (preferences.quietHours?.enabled) {
        const now = new Date();
        const currentTime = now.toLocaleTimeString('en-US', {
          hour12: false,
          timeZone: preferences.quietHours.timezone,
        });
        const currentDay = now.getDay();

        const isQuietTime = this.isInQuietHours(
          currentTime,
          preferences.quietHours.startTime,
          preferences.quietHours.endTime,
          preferences.quietHours.days.includes(currentDay),
        );

        if (isQuietTime && !preferences.priorityTemplates.includes(type)) {
          return { canSend: false, reason: 'Quiet hours active' };
        }
      }

      // التحقق من حدود التكرار
      const frequencyCheck = await this.checkFrequencyLimits(
        userId,
        channel,
        preferences.frequencyLimits || {},
      );
      if (!frequencyCheck.canSend) {
        return { canSend: false, reason: frequencyCheck.reason };
      }

      return { canSend: true };
    } catch (error) {
      this.logger.error('Failed to check notification permissions:', error);
      return { canSend: false, reason: 'Error checking permissions' };
    }
  }

  /**
   * التحقق من ساعات الهدوء
   */
  private isInQuietHours(
    currentTime: string,
    startTime: string,
    endTime: string,
    isQuietDay: boolean,
  ): boolean {
    if (!isQuietDay) return false;

    const current = this.timeToMinutes(currentTime);
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);

    if (start <= end) {
      // نفس اليوم (مثل 22:00 إلى 08:00)
      return current >= start && current <= end;
    } else {
      // عبر منتصف الليل (مثل 22:00 إلى 08:00)
      return current >= start || current <= end;
    }
  }

  /**
   * تحويل الوقت إلى دقائق
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * التحقق من حدود التكرار
   */
  private async checkFrequencyLimits(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    userId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    channel: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    limits: FrequencyLimits,
  ): Promise<{ canSend: boolean; reason?: string }> {
    // هذا يتطلب تنفيذ أكثر تعقيداً مع تتبع الإحصائيات
    // للآن، سنعود بـ true
    return { canSend: true };
  }

  /**
   * الحصول على إحصائيات التفضيلات
   */
  async getPreferenceStats(): Promise<{
    totalUsers: number;
    enabledNotifications: number;
    enabledInApp: number;
    enabledPush: number;
    enabledSms: number;
    enabledEmail: number;
    quietHoursEnabled: number;
    byLanguage: Record<string, number>;
  }> {
    const [
      totalUsers,
      enabledNotifications,
      enabledInApp,
      enabledPush,
      enabledSms,
      enabledEmail,
      quietHoursEnabled,
      byLanguage,
    ] = await Promise.all([
      this.preferenceModel.countDocuments(),
      this.preferenceModel.countDocuments({ enableNotifications: true }),
      this.preferenceModel.countDocuments({ enableInApp: true }),
      this.preferenceModel.countDocuments({ enablePush: true }),
      this.preferenceModel.countDocuments({ enableSms: true }),
      this.preferenceModel.countDocuments({ enableEmail: true }),
      this.preferenceModel.countDocuments({ 'quietHours.enabled': true }),
      this.preferenceModel.aggregate([
        { $group: { _id: '$preferredLanguage', count: { $sum: 1 } } },
        { $project: { language: '$_id', count: 1, _id: 0 } },
      ]),
    ]);

    return {
      totalUsers,
      enabledNotifications,
      enabledInApp,
      enabledPush,
      enabledSms,
      enabledEmail,
      quietHoursEnabled,
      byLanguage: byLanguage.reduce((acc, item) => ({ ...acc, [item.language]: item.count }), {}),
    };
  }

  /**
   * إعادة تعيين التفضيلات إلى الافتراضية
   */
  async resetToDefaults(userId: string): Promise<NotificationPreference> {
    await this.preferenceModel.deleteOne({ userId: new Types.ObjectId(userId) });
    const preferences = await this.createDefaultPreferences(userId);
    return preferences.toObject();
  }

  /**
   * تحديث تفضيلات فئة معينة
   */
  async updateCategoryPreferences(
    userId: string,
    category: NotificationCategory,
    preferences: {
      inApp?: boolean;
      push?: boolean;
      sms?: boolean;
      email?: boolean;
    },
  ): Promise<NotificationPreference> {
    const updateData = {
      [`categoryPreferences.${category}`]: preferences,
      lastModifiedAt: new Date(),
      lastModifiedBy: 'user',
    };

    const result = await this.preferenceModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: updateData },
      { new: true, upsert: true },
    );

    return result;
  }
}
