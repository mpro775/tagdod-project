import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  Min,
  Max,
  MaxLength,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO لتحديث بروفايل المهندس
 */
export class UpdateEngineerProfileDto {
  @ApiPropertyOptional({
    description: 'النبذة عن المهندس',
    example: 'مهندس ميكانيكي محترف مع أكثر من 10 سنوات من الخبرة في صيانة السيارات',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @ApiPropertyOptional({
    description: 'رابط الأفاتار (من Bunny.net)',
    example: 'https://cdn.example.com/avatars/engineer123.jpg',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'رقم الواتساب',
    example: '967711234567',
  })
  @IsOptional()
  @IsString()
  whatsappNumber?: string;

  @ApiPropertyOptional({
    description: 'المسمى الوظيفي',
    example: 'مهندس ميكانيكي',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  jobTitle?: string;

  @ApiPropertyOptional({
    description: 'التخصصات',
    example: ['ميكانيك', 'كهرباء', 'سباكة'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @ApiPropertyOptional({
    description: 'سنوات الخبرة',
    example: 10,
    minimum: 0,
    maximum: 50,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  yearsOfExperience?: number;

  @ApiPropertyOptional({
    description: 'الشهادات',
    example: ['شهادة معتمدة في الميكانيك', 'شهادة السلامة المهنية'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];
}

/**
 * DTO لإضافة تقييم للمهندس
 */
export class AddEngineerRatingDto {
  @ApiProperty({
    description: 'النجوم (من 1 إلى 5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  score!: number;

  @ApiProperty({
    description: 'التعليق/النص (مطلوب)',
    example: 'خدمة ممتازة ومهندس محترف جداً. أنصح بالتعامل معه.',
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500)
  comment!: string;
}

/**
 * DTO لاستعلام التقييمات
 */
export class GetRatingsQueryDto {
  @ApiPropertyOptional({
    description: 'رقم الصفحة',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'عدد العناصر في الصفحة',
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;

  @ApiPropertyOptional({
    description: 'طريقة الترتيب',
    enum: ['recent', 'top', 'oldest'],
    default: 'recent',
  })
  @IsOptional()
  @IsString()
  sortBy?: 'recent' | 'top' | 'oldest';

  @ApiPropertyOptional({
    description: 'الحد الأدنى للنجوم',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  minScore?: number;
}
