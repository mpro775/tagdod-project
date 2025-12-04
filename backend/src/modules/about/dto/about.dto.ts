import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsNumber,
  IsUrl,
  IsEmail,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// DTO للقيم
export class ValueItemDto {
  @ApiProperty({ description: 'العنوان بالعربية' })
  @IsString()
  @IsNotEmpty()
  titleAr!: string;

  @ApiProperty({ description: 'العنوان بالإنجليزية' })
  @IsString()
  @IsNotEmpty()
  titleEn!: string;

  @ApiPropertyOptional({ description: 'الوصف بالعربية' })
  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @ApiPropertyOptional({ description: 'الوصف بالإنجليزية' })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({ description: 'اسم الأيقونة' })
  @IsOptional()
  @IsString()
  icon?: string;
}

// DTO للإحصائيات
export class StatItemDto {
  @ApiProperty({ description: 'التسمية بالعربية' })
  @IsString()
  @IsNotEmpty()
  labelAr!: string;

  @ApiProperty({ description: 'التسمية بالإنجليزية' })
  @IsString()
  @IsNotEmpty()
  labelEn!: string;

  @ApiProperty({ description: 'القيمة', example: '500+' })
  @IsString()
  @IsNotEmpty()
  value!: string;

  @ApiPropertyOptional({ description: 'اسم الأيقونة' })
  @IsOptional()
  @IsString()
  icon?: string;
}

// DTO لأعضاء الفريق
export class TeamMemberDto {
  @ApiProperty({ description: 'الاسم بالعربية' })
  @IsString()
  @IsNotEmpty()
  nameAr!: string;

  @ApiProperty({ description: 'الاسم بالإنجليزية' })
  @IsString()
  @IsNotEmpty()
  nameEn!: string;

  @ApiProperty({ description: 'المنصب بالعربية' })
  @IsString()
  @IsNotEmpty()
  positionAr!: string;

  @ApiProperty({ description: 'المنصب بالإنجليزية' })
  @IsString()
  @IsNotEmpty()
  positionEn!: string;

  @ApiPropertyOptional({ description: 'رابط الصورة' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: 'رابط LinkedIn' })
  @IsOptional()
  @IsString()
  linkedIn?: string;

  @ApiPropertyOptional({ description: 'مرئي', default: true })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @ApiPropertyOptional({ description: 'الترتيب', default: 0 })
  @IsOptional()
  @IsNumber()
  order?: number;
}

// DTO لروابط التواصل الاجتماعي
export class SocialLinksDto {
  @ApiPropertyOptional({ description: 'رابط Facebook' })
  @IsOptional()
  @IsString()
  facebook?: string;

  @ApiPropertyOptional({ description: 'رابط Twitter/X' })
  @IsOptional()
  @IsString()
  twitter?: string;

  @ApiPropertyOptional({ description: 'رابط Instagram' })
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiPropertyOptional({ description: 'رابط LinkedIn' })
  @IsOptional()
  @IsString()
  linkedin?: string;

  @ApiPropertyOptional({ description: 'رابط YouTube' })
  @IsOptional()
  @IsString()
  youtube?: string;

  @ApiPropertyOptional({ description: 'رقم WhatsApp' })
  @IsOptional()
  @IsString()
  whatsapp?: string;

  @ApiPropertyOptional({ description: 'رابط TikTok' })
  @IsOptional()
  @IsString()
  tiktok?: string;
}

// DTO لمعلومات التواصل
export class ContactInfoDto {
  @ApiPropertyOptional({ description: 'العنوان بالعربية' })
  @IsOptional()
  @IsString()
  addressAr?: string;

  @ApiPropertyOptional({ description: 'العنوان بالإنجليزية' })
  @IsOptional()
  @IsString()
  addressEn?: string;

  @ApiPropertyOptional({ description: 'رقم الهاتف' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'البريد الإلكتروني' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'ساعات العمل بالعربية' })
  @IsOptional()
  @IsString()
  workingHoursAr?: string;

  @ApiPropertyOptional({ description: 'ساعات العمل بالإنجليزية' })
  @IsOptional()
  @IsString()
  workingHoursEn?: string;

  @ApiPropertyOptional({ type: SocialLinksDto, description: 'روابط التواصل الاجتماعي' })
  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  socialLinks?: SocialLinksDto;
}

// DTO لإنشاء صفحة من نحن
export class CreateAboutDto {
  @ApiProperty({ description: 'العنوان الرئيسي بالعربية' })
  @IsString()
  @IsNotEmpty()
  titleAr!: string;

  @ApiProperty({ description: 'العنوان الرئيسي بالإنجليزية' })
  @IsString()
  @IsNotEmpty()
  titleEn!: string;

  @ApiProperty({ description: 'الوصف بالعربية' })
  @IsString()
  @IsNotEmpty()
  descriptionAr!: string;

  @ApiProperty({ description: 'الوصف بالإنجليزية' })
  @IsString()
  @IsNotEmpty()
  descriptionEn!: string;

  @ApiPropertyOptional({ description: 'صورة الـ Hero' })
  @IsOptional()
  @IsString()
  heroImage?: string;

  @ApiPropertyOptional({ description: 'الرؤية بالعربية' })
  @IsOptional()
  @IsString()
  visionAr?: string;

  @ApiPropertyOptional({ description: 'الرؤية بالإنجليزية' })
  @IsOptional()
  @IsString()
  visionEn?: string;

  @ApiPropertyOptional({ description: 'الرسالة بالعربية' })
  @IsOptional()
  @IsString()
  missionAr?: string;

  @ApiPropertyOptional({ description: 'الرسالة بالإنجليزية' })
  @IsOptional()
  @IsString()
  missionEn?: string;

  @ApiPropertyOptional({ type: [ValueItemDto], description: 'القيم' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ValueItemDto)
  values?: ValueItemDto[];

  @ApiPropertyOptional({ description: 'قصتنا بالعربية (HTML)' })
  @IsOptional()
  @IsString()
  storyAr?: string;

  @ApiPropertyOptional({ description: 'قصتنا بالإنجليزية (HTML)' })
  @IsOptional()
  @IsString()
  storyEn?: string;

  @ApiPropertyOptional({ type: [TeamMemberDto], description: 'فريق العمل' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeamMemberDto)
  teamMembers?: TeamMemberDto[];

  @ApiPropertyOptional({ type: [StatItemDto], description: 'الإحصائيات' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StatItemDto)
  stats?: StatItemDto[];

  @ApiPropertyOptional({ type: ContactInfoDto, description: 'معلومات التواصل' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ContactInfoDto)
  contactInfo?: ContactInfoDto;

  @ApiPropertyOptional({ description: 'حالة النشر', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// DTO لتحديث صفحة من نحن
export class UpdateAboutDto {
  @ApiPropertyOptional({ description: 'العنوان الرئيسي بالعربية' })
  @IsOptional()
  @IsString()
  titleAr?: string;

  @ApiPropertyOptional({ description: 'العنوان الرئيسي بالإنجليزية' })
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

  @ApiPropertyOptional({ description: 'صورة الـ Hero' })
  @IsOptional()
  @IsString()
  heroImage?: string;

  @ApiPropertyOptional({ description: 'الرؤية بالعربية' })
  @IsOptional()
  @IsString()
  visionAr?: string;

  @ApiPropertyOptional({ description: 'الرؤية بالإنجليزية' })
  @IsOptional()
  @IsString()
  visionEn?: string;

  @ApiPropertyOptional({ description: 'الرسالة بالعربية' })
  @IsOptional()
  @IsString()
  missionAr?: string;

  @ApiPropertyOptional({ description: 'الرسالة بالإنجليزية' })
  @IsOptional()
  @IsString()
  missionEn?: string;

  @ApiPropertyOptional({ type: [ValueItemDto], description: 'القيم' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ValueItemDto)
  values?: ValueItemDto[];

  @ApiPropertyOptional({ description: 'قصتنا بالعربية (HTML)' })
  @IsOptional()
  @IsString()
  storyAr?: string;

  @ApiPropertyOptional({ description: 'قصتنا بالإنجليزية (HTML)' })
  @IsOptional()
  @IsString()
  storyEn?: string;

  @ApiPropertyOptional({ type: [TeamMemberDto], description: 'فريق العمل' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeamMemberDto)
  teamMembers?: TeamMemberDto[];

  @ApiPropertyOptional({ type: [StatItemDto], description: 'الإحصائيات' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StatItemDto)
  stats?: StatItemDto[];

  @ApiPropertyOptional({ type: ContactInfoDto, description: 'معلومات التواصل' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ContactInfoDto)
  contactInfo?: ContactInfoDto;

  @ApiPropertyOptional({ description: 'حالة النشر' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// DTO لتفعيل/تعطيل
export class ToggleAboutDto {
  @ApiProperty({ description: 'حالة النشر' })
  @IsBoolean()
  @IsNotEmpty()
  isActive!: boolean;
}

// DTO للاستجابة
export class AboutResponseDto {
  @ApiProperty()
  _id!: string;

  @ApiProperty()
  titleAr!: string;

  @ApiProperty()
  titleEn!: string;

  @ApiProperty()
  descriptionAr!: string;

  @ApiProperty()
  descriptionEn!: string;

  @ApiPropertyOptional()
  heroImage?: string;

  @ApiPropertyOptional()
  visionAr?: string;

  @ApiPropertyOptional()
  visionEn?: string;

  @ApiPropertyOptional()
  missionAr?: string;

  @ApiPropertyOptional()
  missionEn?: string;

  @ApiPropertyOptional({ type: [ValueItemDto] })
  values?: ValueItemDto[];

  @ApiPropertyOptional()
  storyAr?: string;

  @ApiPropertyOptional()
  storyEn?: string;

  @ApiPropertyOptional({ type: [TeamMemberDto] })
  teamMembers?: TeamMemberDto[];

  @ApiPropertyOptional({ type: [StatItemDto] })
  stats?: StatItemDto[];

  @ApiPropertyOptional({ type: ContactInfoDto })
  contactInfo?: ContactInfoDto;

  @ApiProperty()
  isActive!: boolean;

  @ApiPropertyOptional()
  lastUpdatedBy?: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

