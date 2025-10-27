import { IsString, IsEnum, IsOptional, IsObject, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export enum Language {
  AR = 'ar',
  EN = 'en',
}

export enum TranslationNamespace {
  COMMON = 'common',
  AUTH = 'auth',
  PRODUCTS = 'products',
  ORDERS = 'orders',
  SERVICES = 'services',
  USERS = 'users',
  SETTINGS = 'settings',
  ERRORS = 'errors',
  VALIDATION = 'validation',
  NOTIFICATIONS = 'notifications',
}

export class CreateTranslationDto {
  @ApiProperty({ description: 'مفتاح الترجمة', example: 'auth.welcome' })
  @IsString()
  key!: string;

  @ApiProperty({ description: 'النص بالعربية' })
  @IsString()
  ar!: string;

  @ApiProperty({ description: 'النص بالإنجليزية' })
  @IsString()
  en!: string;

  @ApiPropertyOptional({ 
    description: 'المساحة/الوحدة', 
    enum: TranslationNamespace,
    default: TranslationNamespace.COMMON
  })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsEnum(TranslationNamespace)
  namespace?: TranslationNamespace;

  @ApiPropertyOptional({ description: 'وصف/ملاحظة' })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  description?: string;
}

export class UpdateTranslationDto {
  @ApiPropertyOptional({ description: 'النص بالعربية' })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  ar?: string;

  @ApiPropertyOptional({ description: 'النص بالإنجليزية' })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  en?: string;

  @ApiPropertyOptional({ 
    description: 'المساحة/الوحدة', 
    enum: TranslationNamespace 
  })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsEnum(TranslationNamespace)
  namespace?: TranslationNamespace;

  @ApiPropertyOptional({ description: 'وصف/ملاحظة' })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  description?: string;
}

export class TranslationsQueryDto {
  @ApiPropertyOptional({ 
    description: 'المساحة/الوحدة', 
    enum: TranslationNamespace 
  })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsEnum(TranslationNamespace)
  namespace?: TranslationNamespace;

  @ApiPropertyOptional({ description: 'البحث في المفتاح أو النص' })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'إظهار الترجمات المفقودة فقط' })
  @IsOptional()
  @IsBoolean()
  missingOnly?: boolean;

  @ApiPropertyOptional({ description: 'اللغة المفقودة', enum: Language })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsEnum(Language)
  missingLanguage?: Language;
}

export class TranslationDto {
  @ApiProperty({ description: 'المعرف' })
  id!: string;

  @ApiProperty({ description: 'مفتاح الترجمة' })
  key!: string;

  @ApiProperty({ description: 'النص بالعربية' })
  ar!: string;

  @ApiProperty({ description: 'النص بالإنجليزية' })
  en!: string;

  @ApiProperty({ 
    description: 'المساحة/الوحدة', 
    enum: TranslationNamespace 
  })
  namespace!: string;

  @ApiProperty({ description: 'الوصف' })
  description?: string;

  @ApiProperty({ description: 'تاريخ الإنشاء' })
  createdAt!: Date;

  @ApiProperty({ description: 'تاريخ آخر تحديث' })
  updatedAt!: Date;

  @ApiProperty({ description: 'آخر من قام بالتحديث' })
  updatedBy?: string;
}

export class TranslationStatsDto {
  @ApiProperty({ description: 'إجمالي الترجمات' })
  totalTranslations!: number;

  @ApiProperty({ description: 'الترجمات حسب المساحة' })
  byNamespace!: Record<string, number>;

  @ApiProperty({ description: 'الترجمات المفقودة بالعربية' })
  missingArabic!: number;

  @ApiProperty({ description: 'الترجمات المفقودة بالإنجليزية' })
  missingEnglish!: number;

  @ApiProperty({ description: 'نسبة الاكتمال بالعربية (%)' })
  arabicCompleteness!: number;

  @ApiProperty({ description: 'نسبة الاكتمال بالإنجليزية (%)' })
  englishCompleteness!: number;

  @ApiProperty({ description: 'آخر التحديثات' })
  recentUpdates!: Array<{
    key: string;
    updatedAt: Date;
    updatedBy: string;
  }>;
}

export class BulkImportDto {
  @ApiProperty({ 
    description: 'ملف JSON للاستيراد',
    type: 'object',
    example: {
      'auth.welcome': { ar: 'مرحبا', en: 'Welcome' },
      'auth.login': { ar: 'تسجيل الدخول', en: 'Login' },
    }
  })
  @IsObject()
  translations!: Record<string, { ar: string; en: string; description?: string }>;

  @ApiPropertyOptional({ 
    description: 'المساحة/الوحدة', 
    enum: TranslationNamespace 
  })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsEnum(TranslationNamespace)
  namespace?: TranslationNamespace;

  @ApiPropertyOptional({ 
    description: 'استبدال الترجمات الموجودة',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  overwrite?: boolean;
}

export class ExportTranslationsDto {
  @ApiPropertyOptional({ 
    description: 'المساحة/الوحدة للتصدير', 
    enum: TranslationNamespace 
  })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsEnum(TranslationNamespace)
  namespace?: TranslationNamespace;

  @ApiPropertyOptional({ 
    description: 'صيغة التصدير',
    enum: ['json', 'csv'],
    default: 'json'
  })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  format?: 'json' | 'csv';

  @ApiPropertyOptional({ 
    description: 'اللغة للتصدير (أو كلاهما)',
    enum: [...Object.values(Language), 'both'],
    default: 'both'
  })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  language?: Language | 'both';
}

export class TranslationHistoryDto {
  @ApiProperty({ description: 'تاريخ التعديلات' })
  history!: Array<{
    action: 'created' | 'updated' | 'deleted';
    changes: {
      field: string;
      oldValue: unknown;
      newValue: unknown;
    }[];
    userId: string;
    userName: string;
    timestamp: Date;
  }>;
}

