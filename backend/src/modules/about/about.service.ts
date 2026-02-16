import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { About, AboutDocument } from './schemas/about.schema';
import { CreateAboutDto, UpdateAboutDto, AboutResponseDto } from './dto/about.dto';

@Injectable()
export class AboutService {
  constructor(
    @InjectModel(About.name)
    private aboutModel: Model<AboutDocument>,
  ) {}

  /**
   * تحويل About إلى DTO
   */
  private mapToDto(about: About & { _id: unknown; createdAt?: Date; updatedAt?: Date }): AboutResponseDto {
    return {
      _id: String(about._id),
      titleAr: about.titleAr,
      titleEn: about.titleEn,
      descriptionAr: about.descriptionAr,
      descriptionEn: about.descriptionEn,
      heroImage: about.heroImage,
      visionAr: about.visionAr,
      visionEn: about.visionEn,
      missionAr: about.missionAr,
      missionEn: about.missionEn,
      values: about.values || [],
      storyAr: about.storyAr,
      storyEn: about.storyEn,
      teamMembers: about.teamMembers || [],
      stats: about.stats || [],
      contactInfo: about.contactInfo,
      isActive: about.isActive,
      lastUpdatedBy: about.lastUpdatedBy,
      createdAt: about.createdAt || new Date(),
      updatedAt: about.updatedAt || new Date(),
    };
  }

  /**
   * إنشاء صفحة من نحن (مرة واحدة فقط)
   */
  async create(dto: CreateAboutDto, userId: string): Promise<AboutResponseDto> {
    // التحقق من عدم وجود صفحة من نحن مسبقاً
    const existing = await this.aboutModel.findOne();
    if (existing) {
      throw new ConflictException('صفحة "من نحن" موجودة بالفعل. استخدم التحديث بدلاً من الإنشاء.');
    }

    const about = new this.aboutModel({
      ...dto,
      lastUpdatedBy: userId,
      isActive: dto.isActive ?? true,
    });

    const savedAbout = await about.save();
    return this.mapToDto(savedAbout.toObject());
  }

  /**
   * جلب صفحة من نحن (للأدمن - بدون فحص isActive)
   */
  async getForAdmin(): Promise<AboutResponseDto | null> {
    const about = await this.aboutModel.findOne().lean().exec();
    if (!about) {
      return null;
    }
    return this.mapToDto(about);
  }

  /**
   * جلب صفحة من نحن (للعامة - النشطة فقط)
   */
  async getPublic(): Promise<AboutResponseDto> {
    const about = await this.aboutModel.findOne({ isActive: true }).lean().exec();
    if (!about) {
      throw new NotFoundException('صفحة "من نحن" غير متوفرة حالياً');
    }
    return this.mapToDto(about);
  }

  /**
   * جلب رقم الهاتف فقط
   */
  async getPhone(): Promise<string> {
    const about = await this.aboutModel.findOne({ isActive: true }).lean().exec();
    if (!about) {
      throw new NotFoundException('صفحة "من نحن" غير متوفرة حالياً');
    }
    return about.contactInfo?.phone ?? '';
  }

  /**
   * تحديث صفحة من نحن
   */
  async update(dto: UpdateAboutDto, userId: string): Promise<AboutResponseDto> {
    const about = await this.aboutModel.findOne();
    if (!about) {
      throw new NotFoundException('صفحة "من نحن" غير موجودة. قم بإنشائها أولاً.');
    }

    // تحديث الحقول المحددة فقط
    Object.assign(about, {
      ...dto,
      lastUpdatedBy: userId,
    });

    const savedAbout = await about.save();
    return this.mapToDto(savedAbout.toObject());
  }

  /**
   * تفعيل/تعطيل صفحة من نحن
   */
  async toggle(isActive: boolean, userId: string): Promise<AboutResponseDto> {
    const about = await this.aboutModel.findOne();
    if (!about) {
      throw new NotFoundException('صفحة "من نحن" غير موجودة');
    }

    about.isActive = isActive;
    about.lastUpdatedBy = userId;

    const savedAbout = await about.save();
    return this.mapToDto(savedAbout.toObject());
  }

  /**
   * حذف صفحة من نحن (اختياري)
   */
  async delete(): Promise<void> {
    const result = await this.aboutModel.deleteOne().exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('صفحة "من نحن" غير موجودة');
    }
  }
}

