import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArticleType, ArticleStatus } from '../schemas/article.schema';

export class CreateArticleDto {
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

  @ApiPropertyOptional({ description: 'ملخص بالعربية' })
  @IsOptional()
  @IsString()
  excerptAr?: string;

  @ApiPropertyOptional({ description: 'ملخص بالإنجليزية' })
  @IsOptional()
  @IsString()
  excerptEn?: string;

  @ApiProperty({ description: 'المحتوى بالعربية' })
  @IsString()
  contentAr!: string;

  @ApiPropertyOptional({ description: 'المحتوى بالإنجليزية' })
  @IsOptional()
  @IsString()
  contentEn?: string;

  @ApiPropertyOptional({ description: 'صورة الغلاف' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ description: 'النوع', enum: ['news', 'article'] })
  @IsOptional()
  @IsEnum(ArticleType)
  type?: ArticleType;

  @ApiPropertyOptional({ description: 'التصنيف' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'الوسوم', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'اسم الكاتب' })
  @IsOptional()
  @IsString()
  authorName?: string;

  @ApiPropertyOptional({ description: 'تاريخ النشر' })
  @IsOptional()
  publishDate?: Date;

  @ApiPropertyOptional({ description: 'الحالة', enum: ['draft', 'published', 'archived'] })
  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

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

  @ApiPropertyOptional({ description: 'وقت القراءة بالدقائق' })
  @IsOptional()
  @IsNumber()
  readTime?: number;

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

export class UpdateArticleDto {
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

  @ApiPropertyOptional({ description: 'ملخص بالعربية' })
  @IsOptional()
  @IsString()
  excerptAr?: string;

  @ApiPropertyOptional({ description: 'ملخص بالإنجليزية' })
  @IsOptional()
  @IsString()
  excerptEn?: string;

  @ApiPropertyOptional({ description: 'المحتوى بالعربية' })
  @IsOptional()
  @IsString()
  contentAr?: string;

  @ApiPropertyOptional({ description: 'المحتوى بالإنجليزية' })
  @IsOptional()
  @IsString()
  contentEn?: string;

  @ApiPropertyOptional({ description: 'صورة الغلاف' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ description: 'النوع', enum: ['news', 'article'] })
  @IsOptional()
  @IsEnum(ArticleType)
  type?: ArticleType;

  @ApiPropertyOptional({ description: 'التصنيف' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'الوسوم', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'اسم الكاتب' })
  @IsOptional()
  @IsString()
  authorName?: string;

  @ApiPropertyOptional({ description: 'تاريخ النشر' })
  @IsOptional()
  publishDate?: Date;

  @ApiPropertyOptional({ description: 'الحالة', enum: ['draft', 'published', 'archived'] })
  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

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

  @ApiPropertyOptional({ description: 'وقت القراءة بالدقائق' })
  @IsOptional()
  @IsNumber()
  readTime?: number;

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

export class ArticleQueryDto {
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

  @ApiPropertyOptional({ description: 'التصنيف' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'الحالة' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'مظهر في Landing' })
  @IsOptional()
  @IsBoolean()
  showOnLanding?: boolean;

  @ApiPropertyOptional({ description: 'مميز' })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}

export class ReorderArticleDto {
  @ApiProperty({ description: 'مصفوفة المعرفات والترتيب', type: [{ id: String, order: Number }] })
  @IsArray()
  items!: Array<{ id: string; order: number }>;
}
