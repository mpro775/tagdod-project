import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SystemSetting,
  SystemSettingDocument,
} from './schemas/system-setting.schema';
import {
  CreateSettingDto,
  UpdateSettingDto,
  SettingDto,
  BulkUpdateSettingsDto,
  SettingCategory,
} from './dto/system-settings.dto';

@Injectable()
export class SystemSettingsService {
  constructor(
    @InjectModel(SystemSetting.name)
    private systemSettingModel: Model<SystemSettingDocument>,
  ) {
    // Initialize default settings
    this.initializeDefaultSettings();
  }

  // ==================== CRUD Operations ====================

  async createSetting(dto: CreateSettingDto, userId: string): Promise<SettingDto> {
    const setting = new this.systemSettingModel({
      ...dto,
      updatedBy: userId,
    });

    await setting.save();
    return this.mapToDto(setting);
  }

  async getAllSettings(category?: SettingCategory): Promise<SettingDto[]> {
    const filter: any = {};
    if (category) {
      filter.category = category;
    }

    const settings = await this.systemSettingModel.find(filter).lean();
    return settings.map((s) => this.mapToDto(s));
  }

  async getPublicSettings(category?: SettingCategory): Promise<Record<string, any>> {
    const filter: any = { isPublic: true };
    if (category) {
      filter.category = category;
    }

    const settings = await this.systemSettingModel.find(filter).lean();

    const result: Record<string, any> = {};
    settings.forEach((s) => {
      result[s.key] = s.value;
    });

    return result;
  }

  async getSetting(key: string): Promise<SettingDto> {
    const setting = await this.systemSettingModel.findOne({ key }).lean();
    if (!setting) {
      throw new NotFoundException(`Setting with key "${key}" not found`);
    }
    return this.mapToDto(setting);
  }

  async getSettingValue(key: string, defaultValue?: any): Promise<any> {
    try {
      const setting = await this.getSetting(key);
      return setting.value;
    } catch {
      return defaultValue;
    }
  }

  async updateSetting(
    key: string,
    dto: UpdateSettingDto,
    userId: string,
  ): Promise<SettingDto> {
    const setting = await this.systemSettingModel.findOne({ key });
    if (!setting) {
      throw new NotFoundException(`Setting with key "${key}" not found`);
    }

    setting.value = dto.value;
    if (dto.description !== undefined) {
      setting.description = dto.description;
    }
    setting.updatedBy = userId;

    await setting.save();
    return this.mapToDto(setting);
  }

  async bulkUpdate(dto: BulkUpdateSettingsDto, userId: string): Promise<{ updated: number }> {
    const { settings } = dto;
    let updated = 0;

    for (const [key, value] of Object.entries(settings)) {
      try {
        await this.updateSetting(key, { value }, userId);
        updated++;
      } catch (error) {
        // If setting doesn't exist, create it
        await this.systemSettingModel.create({
          key,
          value,
          category: SettingCategory.GENERAL,
          type: typeof value,
          updatedBy: userId,
        });
        updated++;
      }
    }

    return { updated };
  }

  async deleteSetting(key: string): Promise<void> {
    const result = await this.systemSettingModel.deleteOne({ key });
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Setting with key "${key}" not found`);
    }
  }

  // ==================== Category-specific getters ====================

  async getSettingsByCategory(category: SettingCategory): Promise<Record<string, any>> {
    const settings = await this.systemSettingModel.find({ category }).lean();

    const result: Record<string, any> = {};
    settings.forEach((s) => {
      result[s.key] = s.value;
    });

    return result;
  }

  // ==================== Helper Methods ====================

  private async initializeDefaultSettings() {
    const defaults = [
      // General
      { key: 'site_name', value: 'TagDoD', category: SettingCategory.GENERAL, isPublic: true, description: 'اسم الموقع' },
      { key: 'site_description', value: 'منصة خدمات الطاقة الشمسية', category: SettingCategory.GENERAL, isPublic: true, description: 'وصف الموقع' },
      { key: 'default_language', value: 'ar', category: SettingCategory.GENERAL, isPublic: true, description: 'اللغة الافتراضية' },
      { key: 'default_currency', value: 'YER', category: SettingCategory.GENERAL, isPublic: true, description: 'العملة الافتراضية' },
      { key: 'maintenance_mode', value: false, category: SettingCategory.GENERAL, isPublic: true, description: 'وضع الصيانة' },
      { key: 'timezone', value: 'Asia/Aden', category: SettingCategory.GENERAL, isPublic: true, description: 'المنطقة الزمنية' },

      // Security
      { key: 'force_2fa', value: false, category: SettingCategory.SECURITY, isPublic: false, description: 'إجبار المصادقة الثنائية' },
      { key: 'session_timeout', value: 60, category: SettingCategory.SECURITY, isPublic: false, description: 'مدة صلاحية الجلسة (دقائق)' },
      { key: 'max_login_attempts', value: 5, category: SettingCategory.SECURITY, isPublic: false, description: 'الحد الأقصى لمحاولات الدخول' },
      { key: 'lockout_duration', value: 15, category: SettingCategory.SECURITY, isPublic: false, description: 'مدة الحظر (دقائق)' },

      // Email
      { key: 'from_email', value: 'noreply@tagdod.com', category: SettingCategory.EMAIL, isPublic: false, description: 'بريد المرسل' },
      { key: 'from_name', value: 'TagDoD', category: SettingCategory.EMAIL, isPublic: false, description: 'اسم المرسل' },

      // Notifications
      { key: 'email_notifications_enabled', value: true, category: SettingCategory.NOTIFICATIONS, isPublic: false, description: 'تفعيل إشعارات البريد' },
      { key: 'notify_new_orders', value: true, category: SettingCategory.NOTIFICATIONS, isPublic: false, description: 'إشعار الطلبات الجديدة' },
      { key: 'notify_low_stock', value: true, category: SettingCategory.NOTIFICATIONS, isPublic: false, description: 'إشعار المخزون المنخفض' },

      // Shipping
      { key: 'free_shipping_enabled', value: false, category: SettingCategory.SHIPPING, isPublic: true, description: 'تفعيل الشحن المجاني' },
      { key: 'free_shipping_threshold', value: 100000, category: SettingCategory.SHIPPING, isPublic: true, description: 'الحد الأدنى للشحن المجاني' },
      { key: 'default_shipping_cost', value: 5000, category: SettingCategory.SHIPPING, isPublic: true, description: 'تكلفة الشحن الافتراضية' },

      // Payment
      { key: 'cod_enabled', value: true, category: SettingCategory.PAYMENT, isPublic: true, description: 'تفعيل الدفع عند الاستلام' },
      { key: 'card_enabled', value: false, category: SettingCategory.PAYMENT, isPublic: true, description: 'تفعيل البطاقات' },
    ];

    for (const defaultSetting of defaults) {
      const exists = await this.systemSettingModel.findOne({ key: defaultSetting.key });
      if (!exists) {
        await this.systemSettingModel.create({
          ...defaultSetting,
          type: typeof defaultSetting.value,
          updatedBy: 'system',
        });
      }
    }
  }

  private mapToDto(setting: any): SettingDto {
    return {
      id: setting._id.toString(),
      key: setting.key,
      value: setting.value,
      category: setting.category,
      type: setting.type,
      description: setting.description,
      isPublic: setting.isPublic,
      updatedAt: setting.updatedAt,
      updatedBy: setting.updatedBy,
    };
  }
}

