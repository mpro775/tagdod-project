import { IsString, IsEnum, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { MediaCategory } from '../schemas/media.schema';

export class UploadMediaDto {
  @IsString()
  name!: string; // الاسم الوصفي

  @IsEnum(MediaCategory)
  category!: MediaCategory; // الفئة

  @IsOptional()
  @IsString()
  description?: string; // وصف اختياري

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [value];
      }
    }
    if (Array.isArray(value)) {
      return value;
    }
    return [];
  })
  tags?: string[]; // وسوم

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return Boolean(value);
  })
  isPublic?: boolean; // عامة أم خاصة
}

