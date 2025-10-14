import { IsString, IsEnum, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { MediaCategory } from '../schemas/media.schema';

export class UpdateMediaDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(MediaCategory)
  category?: MediaCategory;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

