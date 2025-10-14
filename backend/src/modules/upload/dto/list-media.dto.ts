import { IsOptional, IsString, IsNumber, IsEnum, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { MediaCategory, MediaType } from '../schemas/media.schema';

export class ListMediaDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 24; // 24 للعرض بشكل grid

  @IsOptional()
  @IsString()
  search?: string; // البحث في name, description, tags

  @IsOptional()
  @IsEnum(MediaCategory)
  category?: MediaCategory; // فلترة حسب الفئة

  @IsOptional()
  @IsEnum(MediaType)
  type?: MediaType; // فلترة حسب النوع

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPublic?: boolean; // فلترة العامة/الخاصة

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeDeleted?: boolean = false; // عرض المحذوفة

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt'; // الترتيب حسب

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

