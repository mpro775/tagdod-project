import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  IsObject,
  IsBoolean,
  IsEmail,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ReportType, ReportFormat, ScheduleFrequency } from '../schemas/report-schedule.schema';

export class CreateReportScheduleDto {
  @ApiProperty({ description: 'اسم الجدولة', example: 'تقرير المبيعات الأسبوعي' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'وصف الجدولة', example: 'تقرير شامل للمبيعات والإيرادات', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'نوع التقرير', enum: ReportType, example: ReportType.WEEKLY_REPORT })
  @IsEnum(ReportType)
  reportType!: ReportType;

  @ApiProperty({ description: 'التكرار', enum: ScheduleFrequency, example: ScheduleFrequency.WEEKLY })
  @IsEnum(ScheduleFrequency)
  frequency!: ScheduleFrequency;

  @ApiProperty({
    description: 'صيغ التصدير',
    enum: ReportFormat,
    isArray: true,
    example: [ReportFormat.PDF, ReportFormat.EXCEL],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(ReportFormat, { each: true })
  formats?: ReportFormat[] = [ReportFormat.PDF];

  @ApiProperty({
    description: 'المستلمون',
    type: [String],
    example: ['admin@example.com'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  recipients?: string[];

  @ApiProperty({ description: 'فلاتر التقرير', example: { category: 'sales' }, required: false })
  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;

  @ApiProperty({ description: 'إعدادات إضافية', example: { includeCharts: true }, required: false })
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}

export class UpdateReportScheduleDto {
  @ApiPropertyOptional({ description: 'اسم الجدولة' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'وصف الجدولة' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'نوع التقرير', enum: ReportType })
  @IsOptional()
  @IsEnum(ReportType)
  reportType?: ReportType;

  @ApiPropertyOptional({ description: 'التكرار', enum: ScheduleFrequency })
  @IsOptional()
  @IsEnum(ScheduleFrequency)
  frequency?: ScheduleFrequency;

  @ApiPropertyOptional({ description: 'صيغ التصدير', enum: ReportFormat, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(ReportFormat, { each: true })
  formats?: ReportFormat[];

  @ApiPropertyOptional({ description: 'المستلمون', type: [String] })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  recipients?: string[];

  @ApiPropertyOptional({ description: 'فلاتر التقرير' })
  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'إعدادات إضافية' })
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}

export class ToggleScheduleDto {
  @ApiProperty({ description: 'حالة التفعيل', example: true })
  @IsBoolean()
  isActive!: boolean;
}

export class RunNowDto {
  @ApiPropertyOptional({ description: 'صيغ التصدير للتشغيل اليدوي', enum: ReportFormat, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(ReportFormat, { each: true })
  formats?: ReportFormat[];

  @ApiPropertyOptional({ description: 'المستلمون للتشغيل اليدوي', type: [String] })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  recipients?: string[];
}

export class ScheduleFiltersDto {
  @ApiPropertyOptional({ description: 'صفحة النتائج', example: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'عدد النتائج في الصفحة', example: 20 })
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'تصفية حسب النوع', enum: ReportType })
  @IsOptional()
  @IsEnum(ReportType)
  reportType?: ReportType;

  @ApiPropertyOptional({ description: 'تصفية حسب الحالة' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'بحث بالاسم' })
  @IsOptional()
  @IsString()
  search?: string;
}
