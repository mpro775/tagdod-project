import { IsOptional, IsString, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum ErrorLevel {
  ERROR = 'error',
  WARN = 'warn',
  FATAL = 'fatal',
  DEBUG = 'debug',
}

export enum ErrorCategory {
  DATABASE = 'database',
  API = 'api',
  AUTHENTICATION = 'authentication',
  VALIDATION = 'validation',
  BUSINESS_LOGIC = 'business_logic',
  EXTERNAL_SERVICE = 'external_service',
  SYSTEM = 'system',
  UNKNOWN = 'unknown',
}

export class ErrorLogsQueryDto {
  @ApiPropertyOptional({ description: 'مستوى الخطأ', enum: ErrorLevel })
  @IsOptional()
  @IsEnum(ErrorLevel)
  level?: ErrorLevel;

  @ApiPropertyOptional({ description: 'فئة الخطأ', enum: ErrorCategory })
  @IsOptional()
  @IsEnum(ErrorCategory)
  category?: ErrorCategory;

  @ApiPropertyOptional({ description: 'نص البحث في الرسالة' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'تاريخ البداية (صيغة ISO)' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'تاريخ النهاية (صيغة ISO)' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'رقم الصفحة', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'عدد العناصر في الصفحة', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class CreateErrorLogDto {
  @ApiProperty({ description: 'مستوى الخطأ', enum: ErrorLevel })
  @IsEnum(ErrorLevel)
  level: ErrorLevel;

  @ApiProperty({ description: 'فئة الخطأ', enum: ErrorCategory })
  @IsEnum(ErrorCategory)
  category: ErrorCategory;

  @ApiProperty({ description: 'رسالة الخطأ' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Stack trace' })
  @IsOptional()
  @IsString()
  stack?: string;

  @ApiPropertyOptional({ description: 'معلومات إضافية' })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'معرف المستخدم (إن وجد)' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'مسار الطلب (endpoint)' })
  @IsOptional()
  @IsString()
  endpoint?: string;

  @ApiPropertyOptional({ description: 'طريقة HTTP' })
  @IsOptional()
  @IsString()
  method?: string;

  @ApiPropertyOptional({ description: 'رمز حالة HTTP' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  statusCode?: number;
}

export class ErrorStatisticsDto {
  @ApiProperty({ description: 'إجمالي الأخطاء' })
  totalErrors: number;

  @ApiProperty({ description: 'الأخطاء في آخر 24 ساعة' })
  last24Hours: number;

  @ApiProperty({ description: 'الأخطاء في آخر 7 أيام' })
  last7Days: number;

  @ApiProperty({ description: 'معدل الأخطاء (نسبة مئوية)' })
  errorRate: number;

  @ApiProperty({ description: 'الأخطاء حسب المستوى' })
  byLevel: {
    error: number;
    warn: number;
    fatal: number;
    debug: number;
  };

  @ApiProperty({ description: 'الأخطاء حسب الفئة' })
  byCategory: Record<string, number>;

  @ApiProperty({ description: 'أكثر الأخطاء تكراراً' })
  topErrors: Array<{
    message: string;
    count: number;
    level: ErrorLevel;
    category: ErrorCategory;
    lastOccurrence: Date;
  }>;

  @ApiProperty({ description: 'الأخطاء حسب نقطة النهاية' })
  byEndpoint: Array<{
    endpoint: string;
    count: number;
    errorRate: number;
  }>;
}

export class ErrorTrendDto {
  @ApiProperty({ description: 'البيانات التاريخية' })
  data: Array<{
    date: string;
    total: number;
    byLevel: {
      error: number;
      warn: number;
      fatal: number;
      debug: number;
    };
  }>;

  @ApiProperty({ description: 'الاتجاه' })
  trend: 'increasing' | 'decreasing' | 'stable';

  @ApiProperty({ description: 'نسبة التغيير (%)' })
  changePercentage: number;
}

export class ErrorLogDto {
  @ApiProperty({ description: 'معرف السجل' })
  id: string;

  @ApiProperty({ description: 'مستوى الخطأ', enum: ErrorLevel })
  level: ErrorLevel;

  @ApiProperty({ description: 'فئة الخطأ', enum: ErrorCategory })
  category: ErrorCategory;

  @ApiProperty({ description: 'رسالة الخطأ' })
  message: string;

  @ApiProperty({ description: 'Stack trace' })
  stack?: string;

  @ApiProperty({ description: 'معلومات إضافية' })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'معرف المستخدم' })
  userId?: string;

  @ApiProperty({ description: 'مسار الطلب' })
  endpoint?: string;

  @ApiProperty({ description: 'طريقة HTTP' })
  method?: string;

  @ApiProperty({ description: 'رمز حالة HTTP' })
  statusCode?: number;

  @ApiProperty({ description: 'عدد التكرارات' })
  occurrences: number;

  @ApiProperty({ description: 'أول ظهور' })
  firstOccurrence: Date;

  @ApiProperty({ description: 'آخر ظهور' })
  lastOccurrence: Date;

  @ApiProperty({ description: 'هل تم الحل؟' })
  resolved: boolean;

  @ApiProperty({ description: 'تاريخ الإنشاء' })
  createdAt: Date;
}

export class SystemLogDto {
  @ApiProperty({ description: 'معرف السجل' })
  id: string;

  @ApiProperty({ description: 'المستوى' })
  level: string;

  @ApiProperty({ description: 'الرسالة' })
  message: string;

  @ApiProperty({ description: 'السياق/الوحدة' })
  context?: string;

  @ApiProperty({ description: 'البيانات الإضافية' })
  data?: Record<string, any>;

  @ApiProperty({ description: 'الطابع الزمني' })
  timestamp: Date;
}

export class LogsExportDto {
  @ApiPropertyOptional({ 
    description: 'صيغة التصدير',
    enum: ['json', 'csv', 'txt'],
    default: 'json'
  })
  @IsOptional()
  @IsString()
  format?: 'json' | 'csv' | 'txt' = 'json';

  @ApiPropertyOptional({ description: 'تاريخ البداية' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'تاريخ النهاية' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'مستوى الخطأ', enum: ErrorLevel })
  @IsOptional()
  @IsEnum(ErrorLevel)
  level?: ErrorLevel;
}

