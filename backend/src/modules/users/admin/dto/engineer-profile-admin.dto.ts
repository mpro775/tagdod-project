import { IsString, IsOptional, IsNumber, IsArray, Min, Max, MaxLength, IsUrl, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO لتحديث بروفايل المهندس (إداري)
 */
export class UpdateEngineerProfileAdminDto {
  @ApiPropertyOptional({
    description: 'النبذة عن المهندس',
    example: 'مهندس ميكانيكي محترف مع أكثر من 10 سنوات من الخبرة',
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
  })
  @IsOptional()
  @IsString()
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
    example: ['شهادة معتمدة في الميكانيك'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @ApiPropertyOptional({
    description: 'اللغات المتحدث بها',
    example: ['العربية', 'الإنجليزية'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];
}

/**
 * DTO لإدارة الرصيد
 */
export class ManageWalletDto {
  @ApiProperty({
    description: 'نوع العملية',
    enum: ['add', 'deduct', 'withdraw'],
    example: 'add',
  })
  @IsEnum(['add', 'deduct', 'withdraw'])
  @IsNotEmpty()
  type!: 'add' | 'deduct' | 'withdraw';

  @ApiProperty({
    description: 'المبلغ',
    example: 100,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({
    description: 'سبب العملية',
    example: 'إضافة رصيد مكافأة',
  })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

/**
 * DTO لمزامنة الإحصائيات
 */
export class SyncStatsDto {
  @ApiPropertyOptional({
    description: 'مزامنة التقييمات من ServiceRequest و Order',
    default: true,
  })
  @IsOptional()
  syncRatings?: boolean = true;

  @ApiPropertyOptional({
    description: 'مزامنة الإحصائيات (الخدمات المكتملة والأرباح)',
    default: true,
  })
  @IsOptional()
  syncStatistics?: boolean = true;
}

