import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationTemplate, NotificationTemplateDocument } from '../schemas/notification-template.schema';
import { CreateTemplateDto, UpdateTemplateDto } from '../dto/unified-notification.dto';
import { NotificationCategory } from '../enums/notification.enums';
import { render } from '../templates';
import { 
  NotificationException,
  ErrorCode 
} from '../../../shared/exceptions';

@Injectable()
export class NotificationTemplateService {
  private readonly logger = new Logger(NotificationTemplateService.name);

  constructor(
    @InjectModel(NotificationTemplate.name) 
    private templateModel: Model<NotificationTemplateDocument>,
  ) {}

  /**
   * الحصول على جميع القوالب
   */
  async getTemplates(): Promise<NotificationTemplate[]> {
    return this.templateModel
      .find({ isActive: true })
      .sort({ name: 1 })
      .lean();
  }

  /**
   * الحصول على قالب بالمعرف
   */
  async getTemplateById(id: string): Promise<NotificationTemplate> {
    const template = await this.templateModel.findById(id).lean();
    
    if (!template) {
      throw new NotificationException(ErrorCode.NOTIFICATION_TEMPLATE_NOT_FOUND, { templateId: id });
    }

    return template;
  }

  /**
   * الحصول على قالب بالمفتاح
   */
  async getTemplateByKey(key: string): Promise<NotificationTemplate> {
    const template = await this.templateModel.findOne({ key, isActive: true }).lean();
    
    if (!template) {
      throw new NotificationException(ErrorCode.NOTIFICATION_TEMPLATE_NOT_FOUND, { key });
    }

    return template;
  }

  /**
   * إنشاء قالب جديد
   */
  async createTemplate(dto: CreateTemplateDto): Promise<NotificationTemplate> {
    try {
      // التحقق من عدم تكرار المفتاح
      const existing = await this.templateModel.findOne({ key: dto.key });
      if (existing) {
        throw new NotificationException(ErrorCode.NOTIFICATION_TEMPLATE_NOT_FOUND, { key: dto.key, reason: 'already_exists' });
      }

      const template = new this.templateModel({
        ...dto,
        usageCount: 0,
        isActive: true,
      });

      const savedTemplate = await template.save();
      this.logger.log(`Template created: ${savedTemplate._id} (${dto.key})`);

      return savedTemplate;
    } catch (error) {
      this.logger.error('Failed to create template:', error);
      throw error;
    }
  }

  /**
   * تحديث قالب
   */
  async updateTemplate(id: string, dto: UpdateTemplateDto): Promise<NotificationTemplate> {
    const template = await this.templateModel.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true }
    );

    if (!template) {
      throw new NotificationException(ErrorCode.NOTIFICATION_TEMPLATE_NOT_FOUND, { templateId: id });
    }

    this.logger.log(`Template updated: ${id}`);
    return template;
  }

  /**
   * حذف قالب
   */
  async deleteTemplate(id: string): Promise<boolean> {
    const result = await this.templateModel.findByIdAndDelete(id);
    return !!result;
  }

  /**
   * تفعيل/تعطيل قالب
   */
  async toggleTemplateStatus(id: string, isActive: boolean): Promise<NotificationTemplate> {
    const template = await this.templateModel.findByIdAndUpdate(
      id,
      { $set: { isActive } },
      { new: true }
    );

    if (!template) {
      throw new NotificationException(ErrorCode.NOTIFICATION_TEMPLATE_NOT_FOUND, { templateId: id });
    }

    this.logger.log(`Template ${isActive ? 'activated' : 'deactivated'}: ${id}`);
    return template;
  }

  /**
   * عرض قالب مع البيانات
   */
  async renderTemplate(
    templateKey: string, 
    data: Record<string, unknown>
  ): Promise<{ title: string; message: string; messageEn: string }> {
    try {
      // محاولة الحصول على القالب من قاعدة البيانات أولاً
      let template;
      try {
        template = await this.getTemplateByKey(templateKey);
      } catch (error) {
        // إذا لم يوجد في قاعدة البيانات، استخدم القوالب المدمجة
        template = null;
      }

      if (template) {
        // استخدام القالب من قاعدة البيانات
        return {
          title: render(template.title, data),
          message: render(template.message, data),
          messageEn: render(template.messageEn, data),
        };
      } else {
        // استخدام القوالب المدمجة
        const builtInTemplates = await this.getBuiltInTemplates();
        const builtInTemplate = builtInTemplates[templateKey];
        
        if (!builtInTemplate) {
          throw new NotificationException(ErrorCode.NOTIFICATION_TEMPLATE_NOT_FOUND, { templateKey });
        }

        return {
          title: render(builtInTemplate.title, data),
          message: render(builtInTemplate.body, data),
          messageEn: render(builtInTemplate.body, data), // استخدام نفس المحتوى للإنجليزية
        };
      }
    } catch (error) {
      this.logger.error('Failed to render template:', error);
      throw error;
    }
  }

  /**
   * الحصول على القوالب المدمجة
   */
  async getBuiltInTemplates(): Promise<Record<string, { title: string; body: string; link?: (p: Record<string, unknown>) => string | undefined }>> {
    // استيراد القوالب المدمجة
    const { TEMPLATES } = await import('../templates');
    return TEMPLATES;
  }

  /**
   * تحديث إحصائيات استخدام القالب
   */
  async updateTemplateUsage(templateId: string): Promise<void> {
    await this.templateModel.findByIdAndUpdate(
      templateId,
      { 
        $inc: { usageCount: 1 },
        $set: { lastUsedAt: new Date() }
      }
    );
  }

  /**
   * الحصول على إحصائيات القوالب
   */
  async getTemplateStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    mostUsed: Array<{ template: string; usageCount: number }>;
    byCategory: Record<string, number>;
  }> {
    const [total, active, inactive, mostUsed, byCategory] = await Promise.all([
      this.templateModel.countDocuments(),
      this.templateModel.countDocuments({ isActive: true }),
      this.templateModel.countDocuments({ isActive: false }),
      this.templateModel
        .find({ isActive: true })
        .sort({ usageCount: -1 })
        .limit(10)
        .select('name usageCount')
        .lean(),
      this.templateModel.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $project: { category: '$_id', count: 1, _id: 0 } }
      ])
    ]);

    return {
      total,
      active,
      inactive,
      mostUsed: mostUsed.map(t => ({ template: t.name, usageCount: t.usageCount })),
      byCategory: byCategory.reduce((acc, item) => ({ ...acc, [item.category]: item.count }), {}),
    };
  }

  /**
   * البحث في القوالب
   */
  async searchTemplates(query: {
    search?: string;
    category?: NotificationCategory;
    type?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ templates: NotificationTemplate[]; total: number }> {
    const {
      search,
      category,
      type,
      isActive,
      limit = 20,
      offset = 0
    } = query;

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (type) {
      filter.type = type;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    const [templates, total] = await Promise.all([
      this.templateModel
        .find(filter)
        .sort({ name: 1 })
        .limit(limit)
        .skip(offset)
        .lean(),
      this.templateModel.countDocuments(filter)
    ]);

    return { templates, total };
  }
}
