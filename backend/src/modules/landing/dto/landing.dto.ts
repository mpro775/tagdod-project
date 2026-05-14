import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHeroSectionDto {
  @ApiProperty({ description: 'العنوان بالعربية' })
  @IsString()
  titleAr!: string;

  @ApiProperty({ description: 'العنوان بالإنجليزية' })
  @IsString()
  titleEn!: string;

  @ApiPropertyOptional({ description: 'العنوان الفرعي بالعربية' })
  @IsOptional()
  @IsString()
  subtitleAr?: string;

  @ApiPropertyOptional({ description: 'العنوان الفرعي بالإنجليزية' })
  @IsOptional()
  @IsString()
  subtitleEn?: string;

  @ApiPropertyOptional({ description: 'صورة الخلفية' })
  @IsOptional()
  @IsString()
  backgroundImage?: string;

  @ApiPropertyOptional({ description: 'نص زر الدعوة بالعربية' })
  @IsOptional()
  @IsString()
  ctaButtonTextAr?: string;

  @ApiPropertyOptional({ description: 'نص زر الدعوة بالإنجليزية' })
  @IsOptional()
  @IsString()
  ctaButtonTextEn?: string;

  @ApiPropertyOptional({ description: 'رابط زر الدعوة' })
  @IsOptional()
  @IsString()
  ctaButtonLink?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateFeatureItemDto {
  @ApiProperty({ description: 'العنوان بالعربية' })
  @IsString()
  titleAr!: string;

  @ApiProperty({ description: 'العنوان بالإنجليزية' })
  @IsString()
  titleEn!: string;

  @ApiPropertyOptional({ description: 'الوصف بالعربية' })
  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @ApiPropertyOptional({ description: 'الوصف بالإنجليزية' })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({ description: 'الأيقونة' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}

export class CreateStatItemDto {
  @ApiProperty({ description: 'التسمية بالعربية' })
  @IsString()
  labelAr!: string;

  @ApiProperty({ description: 'التسمية بالإنجليزية' })
  @IsString()
  labelEn!: string;

  @ApiProperty({ description: 'القيمة' })
  @IsString()
  value!: string;

  @ApiPropertyOptional({ description: 'الأيقونة' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}

export class CreateTestimonialItemDto {
  @ApiProperty({ description: 'الاسم بالعربية' })
  @IsString()
  nameAr!: string;

  @ApiProperty({ description: 'الاسم بالإنجليزية' })
  @IsString()
  nameEn!: string;

  @ApiPropertyOptional({ description: 'المنصب بالعربية' })
  @IsOptional()
  @IsString()
  positionAr?: string;

  @ApiPropertyOptional({ description: 'المنصب بالإنجليزية' })
  @IsOptional()
  @IsString()
  positionEn?: string;

  @ApiProperty({ description: 'الاقتباس بالعربية' })
  @IsString()
  quoteAr!: string;

  @ApiProperty({ description: 'الاقتباس بالإنجليزية' })
  @IsString()
  quoteEn!: string;

  @ApiPropertyOptional({ description: 'الصورة الشخصية' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}

export class CreateAppDownloadSectionDto {
  @ApiPropertyOptional({ description: 'العنوان بالعربية' })
  @IsOptional()
  @IsString()
  titleAr?: string;

  @ApiPropertyOptional({ description: 'العنوان بالإنجليزية' })
  @IsOptional()
  @IsString()
  titleEn?: string;

  @ApiPropertyOptional({ description: 'الوصف بالعربية' })
  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @ApiPropertyOptional({ description: 'الوصف بالإنجليزية' })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({ description: 'صورة الخلفية' })
  @IsOptional()
  @IsString()
  backgroundImage?: string;

  @ApiPropertyOptional({ description: 'رابط Google Play' })
  @IsOptional()
  @IsString()
  googlePlayUrl?: string;

  @ApiPropertyOptional({ description: 'رابط App Store' })
  @IsOptional()
  @IsString()
  appStoreUrl?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreatePartnerItemDto {
  @ApiProperty({ description: 'اسم الشريك' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'الشعار' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({ description: 'رابط الموقع' })
  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}

export class UpdateHeroSectionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  titleAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  titleEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subtitleAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subtitleEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  backgroundImage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ctaButtonTextAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ctaButtonTextEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ctaButtonLink?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateFeatureItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  titleAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  titleEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}

export class UpdateStatItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  labelAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  labelEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  value?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}

export class UpdateTestimonialItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nameAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  positionAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  positionEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  quoteAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  quoteEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}

export class UpdateAppDownloadSectionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  titleAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  titleEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  backgroundImage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  googlePlayUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  appStoreUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePartnerItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}

export class CreateLandingSettingsDto {
  @ApiPropertyOptional({ type: CreateHeroSectionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateHeroSectionDto)
  hero?: CreateHeroSectionDto;

  @ApiPropertyOptional({ type: [CreateFeatureItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFeatureItemDto)
  features?: CreateFeatureItemDto[];

  @ApiPropertyOptional({ type: [CreateStatItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStatItemDto)
  stats?: CreateStatItemDto[];

  @ApiPropertyOptional({ type: [CreateTestimonialItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTestimonialItemDto)
  testimonials?: CreateTestimonialItemDto[];

  @ApiPropertyOptional({ type: CreateAppDownloadSectionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAppDownloadSectionDto)
  appDownload?: CreateAppDownloadSectionDto;

  @ApiPropertyOptional({ type: [CreatePartnerItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePartnerItemDto)
  partners?: CreatePartnerItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoTitleAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoTitleEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoDescriptionAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoDescriptionEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  faviconUrl?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateLandingSettingsDto {
  @ApiPropertyOptional({ type: UpdateHeroSectionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateHeroSectionDto)
  hero?: UpdateHeroSectionDto;

  @ApiPropertyOptional({ type: [UpdateFeatureItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateFeatureItemDto)
  features?: UpdateFeatureItemDto[];

  @ApiPropertyOptional({ type: [UpdateStatItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateStatItemDto)
  stats?: UpdateStatItemDto[];

  @ApiPropertyOptional({ type: [UpdateTestimonialItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTestimonialItemDto)
  testimonials?: UpdateTestimonialItemDto[];

  @ApiPropertyOptional({ type: UpdateAppDownloadSectionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateAppDownloadSectionDto)
  appDownload?: UpdateAppDownloadSectionDto;

  @ApiPropertyOptional({ type: [UpdatePartnerItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePartnerItemDto)
  partners?: UpdatePartnerItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoTitleAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoTitleEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoDescriptionAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoDescriptionEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  faviconUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class LandingSettingsResponseDto {
  @ApiProperty()
  _id!: string;

  @ApiPropertyOptional({ type: () => Object })
  hero?: Record<string, unknown>;

  @ApiProperty({ type: [Object] })
  features!: Record<string, unknown>[];

  @ApiProperty({ type: [Object] })
  stats!: Record<string, unknown>[];

  @ApiProperty({ type: [Object] })
  testimonials!: Record<string, unknown>[];

  @ApiPropertyOptional({ type: () => Object })
  appDownload?: Record<string, unknown>;

  @ApiProperty({ type: [Object] })
  partners!: Record<string, unknown>[];

  @ApiPropertyOptional()
  seoTitleAr?: string;

  @ApiPropertyOptional()
  seoTitleEn?: string;

  @ApiPropertyOptional()
  seoDescriptionAr?: string;

  @ApiPropertyOptional()
  seoDescriptionEn?: string;

  @ApiPropertyOptional()
  faviconUrl?: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiPropertyOptional()
  lastUpdatedBy?: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
