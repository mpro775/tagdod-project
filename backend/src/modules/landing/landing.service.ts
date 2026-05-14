import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LandingSettings, LandingSettingsDocument } from './schemas/landing.schema';
import {
  CreateLandingSettingsDto,
  UpdateLandingSettingsDto,
  LandingSettingsResponseDto,
} from './dto/landing.dto';

@Injectable()
export class LandingService {
  constructor(
    @InjectModel(LandingSettings.name)
    private landingModel: Model<LandingSettingsDocument>,
  ) {}

  private mapToDto(
    settings: LandingSettings & { _id: unknown; createdAt?: Date; updatedAt?: Date },
  ): LandingSettingsResponseDto {
    const obj = settings.toObject ? settings.toObject() : (settings as Record<string, unknown>);
    return {
      _id: String(obj._id),
      hero: obj.hero as Record<string, unknown> | undefined,
      features: (obj.features || []) as Record<string, unknown>[],
      stats: (obj.stats || []) as Record<string, unknown>[],
      testimonials: (obj.testimonials || []) as Record<string, unknown>[],
      appDownload: obj.appDownload as Record<string, unknown> | undefined,
      partners: (obj.partners || []) as Record<string, unknown>[],
      seoTitleAr: obj.seoTitleAr as string | undefined,
      seoTitleEn: obj.seoTitleEn as string | undefined,
      seoDescriptionAr: obj.seoDescriptionAr as string | undefined,
      seoDescriptionEn: obj.seoDescriptionEn as string | undefined,
      faviconUrl: obj.faviconUrl as string | undefined,
      isActive: obj.isActive as boolean,
      lastUpdatedBy: obj.lastUpdatedBy as string | undefined,
      createdAt: obj.createdAt || new Date(),
      updatedAt: obj.updatedAt || new Date(),
    };
  }

  async create(dto: CreateLandingSettingsDto, userId: string): Promise<LandingSettingsResponseDto> {
    const existing = await this.landingModel.findOne();
    if (existing) {
      throw new ConflictException('إعدادات الصفحة الرئيسية موجودة بالفعل. استخدم التحديث بدلاً من الإنشاء.');
    }

    const settings = new this.landingModel({
      ...dto,
      lastUpdatedBy: userId,
      isActive: dto.isActive ?? true,
    });

    const saved = await settings.save();
    return this.mapToDto(saved);
  }

  async getForAdmin(): Promise<LandingSettingsResponseDto | null> {
    const settings = await this.landingModel.findOne().lean().exec();
    if (!settings) {
      return null;
    }
    return this.mapToDto(settings);
  }

  async getPublic(): Promise<LandingSettingsResponseDto> {
    const settings = await this.landingModel.findOne({ isActive: true }).lean().exec();
    if (!settings) {
      throw new NotFoundException('إعدادات الصفحة الرئيسية غير متوفرة حالياً');
    }

    const filtered = {
      ...settings,
      features: (settings.features || []).filter((f: { isVisible?: boolean }) => f.isVisible !== false),
      stats: (settings.stats || []).filter((s: { isVisible?: boolean }) => s.isVisible !== false),
      testimonials: (settings.testimonials || []).filter((t: { isVisible?: boolean }) => t.isVisible !== false),
      partners: (settings.partners || []).filter((p: { isVisible?: boolean }) => p.isVisible !== false),
    };

    return this.mapToDto(filtered);
  }

  async update(
    dto: UpdateLandingSettingsDto,
    userId: string,
  ): Promise<LandingSettingsResponseDto> {
    const settings = await this.landingModel.findOne();
    if (!settings) {
      throw new NotFoundException('إعدادات الصفحة الرئيسية غير موجودة. قم بإنشائها أولاً.');
    }

    Object.assign(settings, {
      ...dto,
      lastUpdatedBy: userId,
    });

    const saved = await settings.save();
    return this.mapToDto(saved);
  }

  async toggle(isActive: boolean, userId: string): Promise<LandingSettingsResponseDto> {
    const settings = await this.landingModel.findOne();
    if (!settings) {
      throw new NotFoundException('إعدادات الصفحة الرئيسية غير موجودة');
    }

    settings.isActive = isActive;
    settings.lastUpdatedBy = userId;

    const saved = await settings.save();
    return this.mapToDto(saved);
  }

  async delete(): Promise<void> {
    const result = await this.landingModel.deleteOne().exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('إعدادات الصفحة الرئيسية غير موجودة');
    }
  }
}
