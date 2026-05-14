import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProjectType, ProjectStatus } from '../schemas/project.schema';

export class CreateProjectDto {
  @ApiProperty({ description: 'العنوان بالعربية' })
  @IsString()
  titleAr!: string;

  @ApiPropertyOptional({ description: 'العنوان بالإنجليزية' })
  @IsOptional()
  @IsString()
  titleEn?: string;

  @ApiProperty({ description: 'الرابط المختصر' })
  @IsString()
  slug!: string;

  @ApiPropertyOptional({ description: 'وصف مختصر بالعربية' })
  @IsOptional()
  @IsString()
  shortDescriptionAr?: string;

  @ApiPropertyOptional({ description: 'وصف مختصر بالإنجليزية' })
  @IsOptional()
  @IsString()
  shortDescriptionEn?: string;

  @ApiPropertyOptional({ description: 'الوصف بالعربية' })
  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @ApiPropertyOptional({ description: 'الوصف بالإنجليزية' })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({ description: 'نوع المشروع', enum: ['system', 'contracting', 'maintenance', 'installation', 'supply', 'partnership', 'other'] })
  @IsOptional()
  @IsEnum(ProjectType)
  type?: ProjectType;

  @ApiPropertyOptional({ description: 'الحالة', enum: ['planned', 'in_progress', 'completed'] })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional({ description: 'اسم العميل' })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiPropertyOptional({ description: 'الموقع' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'المدينة' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'صورة الغلاف' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ description: 'معرض الصور', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ description: 'تاريخ البدء' })
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({ description: 'تاريخ الانتهاء' })
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional({ description: 'المؤشرات', type: [{ labelAr: String, labelEn: String, value: String }] })
  @IsOptional()
  @IsArray()
  metrics?: Array<{ labelAr: string; labelEn?: string; value: string }>;

  @ApiPropertyOptional({ description: 'الوسوم', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'مميز', default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'إظهار في Landing Page', default: false })
  @IsOptional()
  @IsBoolean()
  showOnLanding?: boolean;

  @ApiPropertyOptional({ description: 'ترتيب العرض', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  landingOrder?: number;

  @ApiPropertyOptional({ description: 'منشور', default: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'عنوان SEO بالعربية' })
  @IsOptional()
  @IsString()
  metaTitleAr?: string;

  @ApiPropertyOptional({ description: 'عنوان SEO بالإنجليزية' })
  @IsOptional()
  @IsString()
  metaTitleEn?: string;

  @ApiPropertyOptional({ description: 'وصف SEO بالعربية' })
  @IsOptional()
  @IsString()
  metaDescriptionAr?: string;

  @ApiPropertyOptional({ description: 'وصف SEO بالإنجليزية' })
  @IsOptional()
  @IsString()
  metaDescriptionEn?: string;
}

export class UpdateProjectDto {
  @ApiPropertyOptional({ description: 'العنوان بالعربية' })
  @IsOptional()
  @IsString()
  titleAr?: string;

  @ApiPropertyOptional({ description: 'العنوان بالإنجليزية' })
  @IsOptional()
  @IsString()
  titleEn?: string;

  @ApiPropertyOptional({ description: 'الرابط المختصر' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'وصف مختصر بالعربية' })
  @IsOptional()
  @IsString()
  shortDescriptionAr?: string;

  @ApiPropertyOptional({ description: 'وصف مختصر بالإنجليزية' })
  @IsOptional()
  @IsString()
  shortDescriptionEn?: string;

  @ApiPropertyOptional({ description: 'الوصف بالعربية' })
  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @ApiPropertyOptional({ description: 'الوصف بالإنجليزية' })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({ description: 'نوع المشروع', enum: ['system', 'contracting', 'maintenance', 'installation', 'supply', 'partnership', 'other'] })
  @IsOptional()
  @IsEnum(ProjectType)
  type?: ProjectType;

  @ApiPropertyOptional({ description: 'الحالة', enum: ['planned', 'in_progress', 'completed'] })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional({ description: 'اسم العميل' })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiPropertyOptional({ description: 'الموقع' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'المدينة' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'صورة الغلاف' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ description: 'معرض الصور', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ description: 'تاريخ البدء' })
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({ description: 'تاريخ الانتهاء' })
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional({ description: 'المؤشرات', type: [{ labelAr: String, labelEn: String, value: String }] })
  @IsOptional()
  @IsArray()
  metrics?: Array<{ labelAr: string; labelEn?: string; value: string }>;

  @ApiPropertyOptional({ description: 'الوسوم', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'مميز' })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'إظهار في Landing Page' })
  @IsOptional()
  @IsBoolean()
  showOnLanding?: boolean;

  @ApiPropertyOptional({ description: 'ترتيب العرض' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  landingOrder?: number;

  @ApiPropertyOptional({ description: 'منشور' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'عنوان SEO بالعربية' })
  @IsOptional()
  @IsString()
  metaTitleAr?: string;

  @ApiPropertyOptional({ description: 'عنوان SEO بالإنجليزية' })
  @IsOptional()
  @IsString()
  metaTitleEn?: string;

  @ApiPropertyOptional({ description: 'وصف SEO بالعربية' })
  @IsOptional()
  @IsString()
  metaDescriptionAr?: string;

  @ApiPropertyOptional({ description: 'وصف SEO بالإنجليزية' })
  @IsOptional()
  @IsString()
  metaDescriptionEn?: string;
}

export class ProjectQueryDto {
  @ApiPropertyOptional({ description: 'رقم الصفحة', example: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'عدد العناصر', example: 20 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'البحث' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'النوع' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'الحالة' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'منشور' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'مظهر في Landing' })
  @IsOptional()
  @IsBoolean()
  showOnLanding?: boolean;

  @ApiPropertyOptional({ description: 'مميز' })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'ترتيب حسب', example: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'اتجاه الترتيب', example: 'desc', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

export class ReorderProjectDto {
  @ApiProperty({ description: 'مصفوفة المعرفات والترتيب', type: [{ id: String, order: Number }] })
  @IsArray()
  items!: Array<{ id: string; order: number }>;
}
