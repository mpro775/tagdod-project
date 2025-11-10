import { IsOptional, IsString, IsBoolean, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO للبحث والفلترة في العناوين (Admin)
 */
export class AdminAddressFilterDto {
  @ApiPropertyOptional({ description: 'معرف المستخدم' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'المدينة' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'تسمية العنوان' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ description: 'العناوين الافتراضية فقط' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'العناوين النشطة فقط' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'تضمين المحذوفة' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeDeleted?: boolean;

  @ApiPropertyOptional({ description: 'العناوين المحذوفة فقط' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  deletedOnly?: boolean;

  @ApiPropertyOptional({ description: 'البحث في النص', example: 'شارع' })
  @IsOptional()
  @IsString()
  search?: string;

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

  @ApiPropertyOptional({ description: 'ترتيب حسب', enum: ['createdAt', 'usageCount', 'lastUsedAt'] })
  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'usageCount' | 'lastUsedAt';

  @ApiPropertyOptional({ description: 'اتجاه الترتيب', enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

/**
 * DTO لإحصائيات الاستخدام
 */
export class UsageStatsFilterDto {
  @ApiPropertyOptional({ description: 'من تاريخ', example: '2024-01-01' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'إلى تاريخ', example: '2024-12-31' })
  @IsOptional()
  @IsString()
  endDate?: string;
}

/**
 * DTO للتحليل الجغرافي
 */
export class GeographicAnalyticsDto {
  @ApiPropertyOptional({ description: 'عدد المدن الأولى', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  topCitiesLimit?: number;
}

