import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LandingSettings, LandingSettingsDocument } from './schemas/landing-settings.schema';
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

  private mapToDto(settings: any): LandingSettingsResponseDto {
    const obj = settings.toObject ? settings.toObject() : settings;
    return {
      _id: String(obj._id),
      heroTitleAr: obj.heroTitleAr || '',
      heroTitleEn: obj.heroTitleEn || '',
      heroSubtitleAr: obj.heroSubtitleAr || '',
      heroSubtitleEn: obj.heroSubtitleEn || '',
      heroImage: obj.heroImage || '',
      heroVideo: obj.heroVideo || '',
      primaryCtaTextAr: obj.primaryCtaTextAr || '',
      primaryCtaTextEn: obj.primaryCtaTextEn || '',
      primaryCtaUrl: obj.primaryCtaUrl || '',
      secondaryCtaTextAr: obj.secondaryCtaTextAr || '',
      secondaryCtaTextEn: obj.secondaryCtaTextEn || '',
      secondaryCtaUrl: obj.secondaryCtaUrl || '',
      appStoreUrl: obj.appStoreUrl || '',
      playStoreUrl: obj.playStoreUrl || '',
      enableAboutSection: obj.enableAboutSection ?? true,
      enableStatsSection: obj.enableStatsSection ?? true,
      enableFeaturesSection: obj.enableFeaturesSection ?? true,
      enableProductsSection: obj.enableProductsSection ?? true,
      enableProjectsSection: obj.enableProjectsSection ?? true,
      enableBrandsSection: obj.enableBrandsSection ?? true,
      enableArticlesSection: obj.enableArticlesSection ?? true,
      enableContactSection: obj.enableContactSection ?? true,
      enableServiceCenterSection: obj.enableServiceCenterSection ?? true,
      sectionOrder: obj.sectionOrder || [],
      isPublished: obj.isPublished ?? true,
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
      isPublished: dto.isPublished ?? true,
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
    const settings = await this.landingModel.findOne({ isPublished: true }).lean().exec();
    if (!settings) {
      throw new NotFoundException('إعدادات الصفحة الرئيسية غير متوفرة حالياً');
    }
    return this.mapToDto(settings);
  }

  async update(
    dto: UpdateLandingSettingsDto,
    userId: string,
  ): Promise<LandingSettingsResponseDto> {
    let settings = await this.landingModel.findOne();
    if (!settings) {
      settings = new this.landingModel({ ...dto, lastUpdatedBy: userId });
    } else {
      Object.assign(settings, { ...dto, lastUpdatedBy: userId });
    }

    const saved = await settings.save();
    return this.mapToDto(saved);
  }

  async toggle(isPublished: boolean, userId: string): Promise<LandingSettingsResponseDto> {
    const settings = await this.landingModel.findOne();
    if (!settings) {
      throw new NotFoundException('إعدادات الصفحة الرئيسية غير موجودة');
    }

    settings.isPublished = isPublished;
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
