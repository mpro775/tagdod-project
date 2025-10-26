import { IsOptional, IsString, IsNumber, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO لفلترة إحصائيات البحث
 */
export class SearchAnalyticsFilterDto {
  @ApiPropertyOptional({ description: 'من تاريخ', example: '2024-01-01' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'إلى تاريخ', example: '2024-12-31' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'اللغة', enum: ['ar', 'en'] })
  @IsOptional()
  @IsString()
  language?: 'ar' | 'en';

  @ApiPropertyOptional({ description: 'نوع الكيان', enum: ['products', 'categories', 'brands', 'all'] })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({ description: 'عمليات البحث بدون نتائج فقط' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  zeroResults?: boolean;
}

/**
 * DTO للبحث في سجلات البحث
 */
export class SearchLogsFilterDto {
  @ApiPropertyOptional({ description: 'نص البحث' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ description: 'معرف المستخدم' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'وجود نتائج' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  hasResults?: boolean;

  @ApiPropertyOptional({ description: 'من تاريخ', example: '2024-01-01' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'إلى تاريخ', example: '2024-12-31' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'عدد النتائج', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ description: 'الصفحة', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;
}

/**
 * DTO للكلمات المفتاحية الشائعة
 */
export class TopSearchTermsDto {
  @ApiPropertyOptional({ description: 'عدد النتائج', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ description: 'من تاريخ', example: '2024-01-01' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'إلى تاريخ', example: '2024-12-31' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'اللغة', enum: ['ar', 'en'] })
  @IsOptional()
  @IsString()
  language?: 'ar' | 'en';
}

