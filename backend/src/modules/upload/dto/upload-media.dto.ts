import { IsString, IsEnum, IsOptional, IsArray, IsBoolean } from 'class-validator';
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
  tags?: string[]; // وسوم

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean; // عامة أم خاصة
}

