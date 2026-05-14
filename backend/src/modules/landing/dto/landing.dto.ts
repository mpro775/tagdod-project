import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class UpdateLandingSettingsDto {
  @ApiPropertyOptional({ description: 'عنوان Hero بالعربية' })
  @IsOptional()
  @IsString()
  heroTitleAr?: string;

  @ApiPropertyOptional({ description: 'عنوان Hero بالإنجليزية' })
  @IsOptional()
  @IsString()
  heroTitleEn?: string;

  @ApiPropertyOptional({ description: 'وصف Hero بالعربية' })
  @IsOptional()
  @IsString()
  heroSubtitleAr?: string;

  @ApiPropertyOptional({ description: 'وصف Hero بالإنجليزية' })
  @IsOptional()
  @IsString()
  heroSubtitleEn?: string;

  @ApiPropertyOptional({ description: 'صورة Hero' })
  @IsOptional()
  @IsString()
  heroImage?: string;

  @ApiPropertyOptional({ description: 'رابط فيديو اختياري' })
  @IsOptional()
  @IsString()
  heroVideo?: string;

  @ApiPropertyOptional({ description: 'نص الزر الأساسي بالعربية' })
  @IsOptional()
  @IsString()
  primaryCtaTextAr?: string;

  @ApiPropertyOptional({ description: 'نص الزر الأساسي بالإنجليزية' })
  @IsOptional()
  @IsString()
  primaryCtaTextEn?: string;

  @ApiPropertyOptional({ description: 'رابط الزر الأساسي' })
  @IsOptional()
  @IsString()
  primaryCtaUrl?: string;

  @ApiPropertyOptional({ description: 'نص الزر الثانوي بالعربية' })
  @IsOptional()
  @IsString()
  secondaryCtaTextAr?: string;

  @ApiPropertyOptional({ description: 'نص الزر الثانوي بالإنجليزية' })
  @IsOptional()
  @IsString()
  secondaryCtaTextEn?: string;

  @ApiPropertyOptional({ description: 'رابط الزر الثانوي' })
  @IsOptional()
  @IsString()
  secondaryCtaUrl?: string;

  @ApiPropertyOptional({ description: 'رابط App Store' })
  @IsOptional()
  @IsString()
  appStoreUrl?: string;

  @ApiPropertyOptional({ description: 'رابط Google Play' })
  @IsOptional()
  @IsString()
  playStoreUrl?: string;

  @ApiPropertyOptional({ description: 'تفعيل قسم عن الشركة' })
  @IsOptional()
  @IsBoolean()
  enableAboutSection?: boolean;

  @ApiPropertyOptional({ description: 'تفعيل قسم الإحصائيات' })
  @IsOptional()
  @IsBoolean()
  enableStatsSection?: boolean;

  @ApiPropertyOptional({ description: 'تفعيل قسم المميزات' })
  @IsOptional()
  @IsBoolean()
  enableFeaturesSection?: boolean;

  @ApiPropertyOptional({ description: 'تفعيل قسم المنتجات' })
  @IsOptional()
  @IsBoolean()
  enableProductsSection?: boolean;

  @ApiPropertyOptional({ description: 'تفعيل قسم المشاريع' })
  @IsOptional()
  @IsBoolean()
  enableProjectsSection?: boolean;

  @ApiPropertyOptional({ description: 'تفعيل قسم البراندات' })
  @IsOptional()
  @IsBoolean()
  enableBrandsSection?: boolean;

  @ApiPropertyOptional({ description: 'تفعيل قسم الأخبار' })
  @IsOptional()
  @IsBoolean()
  enableArticlesSection?: boolean;

  @ApiPropertyOptional({ description: 'تفعيل قسم التواصل' })
  @IsOptional()
  @IsBoolean()
  enableContactSection?: boolean;

  @ApiPropertyOptional({ description: 'تفعيل قسم مركز الصيانة' })
  @IsOptional()
  @IsBoolean()
  enableServiceCenterSection?: boolean;

  @ApiPropertyOptional({ description: 'ترتيب الأقسام' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sectionOrder?: string[];

  @ApiPropertyOptional({ description: 'حالة النشر' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class CreateLandingSettingsDto extends UpdateLandingSettingsDto {}

export class LandingSettingsResponseDto {
  @ApiProperty()
  _id!: string;

  @ApiProperty()
  heroTitleAr!: string;

  @ApiPropertyOptional()
  heroTitleEn?: string;

  @ApiPropertyOptional()
  heroSubtitleAr?: string;

  @ApiPropertyOptional()
  heroSubtitleEn?: string;

  @ApiPropertyOptional()
  heroImage?: string;

  @ApiPropertyOptional()
  heroVideo?: string;

  @ApiPropertyOptional()
  primaryCtaTextAr?: string;

  @ApiPropertyOptional()
  primaryCtaTextEn?: string;

  @ApiPropertyOptional()
  primaryCtaUrl?: string;

  @ApiPropertyOptional()
  secondaryCtaTextAr?: string;

  @ApiPropertyOptional()
  secondaryCtaTextEn?: string;

  @ApiPropertyOptional()
  secondaryCtaUrl?: string;

  @ApiPropertyOptional()
  appStoreUrl?: string;

  @ApiPropertyOptional()
  playStoreUrl?: string;

  @ApiProperty()
  enableAboutSection!: boolean;

  @ApiProperty()
  enableStatsSection!: boolean;

  @ApiProperty()
  enableFeaturesSection!: boolean;

  @ApiProperty()
  enableProductsSection!: boolean;

  @ApiProperty()
  enableProjectsSection!: boolean;

  @ApiProperty()
  enableBrandsSection!: boolean;

  @ApiProperty()
  enableArticlesSection!: boolean;

  @ApiProperty()
  enableContactSection!: boolean;

  @ApiProperty()
  enableServiceCenterSection!: boolean;

  @ApiProperty()
  sectionOrder!: string[];

  @ApiProperty()
  isPublished!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
