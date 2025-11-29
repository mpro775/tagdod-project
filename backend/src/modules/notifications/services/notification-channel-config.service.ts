import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  NotificationChannelConfig,
  NotificationChannelConfigDocument,
} from '../schemas/notification-channel-config.schema';
import { CreateChannelConfigDto, UpdateChannelConfigDto } from '../dto/unified-notification.dto';
import { NotificationType, NotificationChannel } from '../enums/notification.enums';
import { UserRole } from '../../users/schemas/user.schema';
import {
  NOTIFICATION_TYPE_ROLES,
  NOTIFICATION_TYPE_CHANNELS,
  NOTIFICATION_TYPE_DEFAULT_CHANNEL,
} from '../config/notification-rules';
import { NotificationException, ErrorCode } from '../../../shared/exceptions';

@Injectable()
export class NotificationChannelConfigService {
  private readonly logger = new Logger(NotificationChannelConfigService.name);

  constructor(
    @InjectModel(NotificationChannelConfig.name)
    private configModel: Model<NotificationChannelConfigDocument>,
  ) {}

  /**
   * الحصول على جميع الإعدادات
   */
  async getAllConfigs(): Promise<NotificationChannelConfig[]> {
    return this.configModel.find().sort({ notificationType: 1 }).lean();
  }

  /**
   * الحصول على إعدادات نوع محدد
   */
  async getConfigByType(type: NotificationType): Promise<NotificationChannelConfig | null> {
    return this.configModel.findOne({ notificationType: type }).lean();
  }

  /**
   * إنشاء إعدادات جديدة
   */
  async createConfig(
    dto: CreateChannelConfigDto,
    updatedBy?: string,
  ): Promise<NotificationChannelConfig> {
    // التحقق من وجود إعدادات لنفس النوع
    const existing = await this.configModel.findOne({ notificationType: dto.notificationType });
    if (existing) {
      throw new NotificationException(ErrorCode.NOTIFICATION_CONFIG_ALREADY_EXISTS, {
        notificationType: dto.notificationType,
      });
    }

    // التحقق من أن القناة الافتراضية موجودة في القنوات المسموحة
    if (!dto.allowedChannels.includes(dto.defaultChannel)) {
      throw new NotificationException(ErrorCode.INVALID_NOTIFICATION_CONFIG, {
        message: 'Default channel must be included in allowed channels',
      });
    }

    const config = new this.configModel({
      ...dto,
      updatedBy: updatedBy ? new Types.ObjectId(updatedBy) : undefined,
    });

    const savedConfig = await config.save();
    this.logger.log(`Channel config created for type: ${dto.notificationType}`);
    return savedConfig;
  }

  /**
   * تحديث إعدادات موجودة
   */
  async updateConfig(
    type: NotificationType,
    dto: UpdateChannelConfigDto,
    updatedBy?: string,
  ): Promise<NotificationChannelConfig> {
    const config = await this.configModel.findOne({ notificationType: type });
    if (!config) {
      throw new NotificationException(ErrorCode.NOTIFICATION_CONFIG_NOT_FOUND, {
        notificationType: type,
      });
    }

    // التحقق من أن القناة الافتراضية موجودة في القنوات المسموحة (إذا تم تحديثها)
    if (dto.defaultChannel && dto.allowedChannels) {
      if (!dto.allowedChannels.includes(dto.defaultChannel)) {
        throw new NotificationException(ErrorCode.INVALID_NOTIFICATION_CONFIG, {
          message: 'Default channel must be included in allowed channels',
        });
      }
    } else if (dto.defaultChannel && !dto.allowedChannels) {
      // إذا تم تحديث defaultChannel فقط، التحقق من القنوات الموجودة
      if (!config.allowedChannels.includes(dto.defaultChannel)) {
        throw new NotificationException(ErrorCode.INVALID_NOTIFICATION_CONFIG, {
          message: 'Default channel must be included in allowed channels',
        });
      }
    }

    const updateData: Partial<NotificationChannelConfig> = {
      ...dto,
      updatedBy: updatedBy ? new Types.ObjectId(updatedBy) : config.updatedBy,
    };

    const updatedConfig = await this.configModel
      .findOneAndUpdate({ notificationType: type }, updateData, { new: true })
      .lean();

    if (!updatedConfig) {
      throw new NotificationException(ErrorCode.NOTIFICATION_CONFIG_NOT_FOUND, {
        notificationType: type,
      });
    }

    this.logger.log(`Channel config updated for type: ${type}`);
    return updatedConfig;
  }

  /**
   * حذف إعدادات
   */
  async deleteConfig(type: NotificationType): Promise<boolean> {
    const result = await this.configModel.deleteOne({ notificationType: type });
    return result.deletedCount > 0;
  }

  /**
   * الحصول على القنوات المسموحة لنوع إشعار
   * يعيد القنوات من قاعدة البيانات إذا كانت موجودة، وإلا يعيد القيم الافتراضية
   */
  async getAllowedChannels(type: NotificationType): Promise<NotificationChannel[]> {
    const config = await this.getConfigByType(type);
    if (config && config.isActive) {
      return config.allowedChannels;
    }
    // Fallback إلى القيم الافتراضية
    return NOTIFICATION_TYPE_CHANNELS[type] || [NotificationChannel.IN_APP];
  }

  /**
   * الحصول على القناة الافتراضية لنوع إشعار
   * يعيد القناة من قاعدة البيانات إذا كانت موجودة، وإلا يعيد القيمة الافتراضية
   */
  async getDefaultChannel(type: NotificationType): Promise<NotificationChannel> {
    const config = await this.getConfigByType(type);
    if (config && config.isActive) {
      return config.defaultChannel;
    }
    // Fallback إلى القيمة الافتراضية
    return NOTIFICATION_TYPE_DEFAULT_CHANNEL[type] || NotificationChannel.IN_APP;
  }

  /**
   * الحصول على الأدوار المستهدفة لنوع إشعار
   * يعيد الأدوار من قاعدة البيانات إذا كانت موجودة، وإلا يعيد القيم الافتراضية
   */
  async getTargetRoles(type: NotificationType): Promise<UserRole[]> {
    const config = await this.getConfigByType(type);
    if (config && config.isActive) {
      return config.targetRoles;
    }
    // Fallback إلى القيم الافتراضية
    return NOTIFICATION_TYPE_ROLES[type] || [UserRole.USER];
  }

  /**
   * التحقق من أن القناة مسموحة لنوع إشعار
   */
  async isChannelAllowed(type: NotificationType, channel: NotificationChannel): Promise<boolean> {
    const allowedChannels = await this.getAllowedChannels(type);
    return allowedChannels.includes(channel);
  }

  /**
   * تهيئة القيم الافتراضية من notification-rules.ts
   */
  async initializeDefaults(updatedBy?: string): Promise<{ created: number; updated: number }> {
    let created = 0;
    let updated = 0;

    const allTypes = Object.values(NotificationType);

    for (const type of allTypes) {
      const defaultRoles = NOTIFICATION_TYPE_ROLES[type] || [UserRole.USER];
      const defaultChannels = NOTIFICATION_TYPE_CHANNELS[type] || [NotificationChannel.IN_APP];
      const defaultChannel = NOTIFICATION_TYPE_DEFAULT_CHANNEL[type] || NotificationChannel.IN_APP;

      const existing = await this.configModel.findOne({ notificationType: type });

      if (existing) {
        // تحديث الإعدادات الموجودة
        await this.configModel.updateOne(
          { notificationType: type },
          {
            allowedChannels: defaultChannels,
            defaultChannel: defaultChannel,
            targetRoles: defaultRoles,
            isActive: true,
            updatedBy: updatedBy ? new Types.ObjectId(updatedBy) : existing.updatedBy,
          },
        );
        updated++;
      } else {
        // إنشاء إعدادات جديدة
        await this.configModel.create({
          notificationType: type,
          allowedChannels: defaultChannels,
          defaultChannel: defaultChannel,
          targetRoles: defaultRoles,
          isActive: true,
          updatedBy: updatedBy ? new Types.ObjectId(updatedBy) : undefined,
        });
        created++;
      }
    }

    this.logger.log(`Initialized channel configs: ${created} created, ${updated} updated`);
    return { created, updated };
  }
}
