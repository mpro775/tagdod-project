import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsArray, IsObject, IsBoolean, IsDateString } from 'class-validator';

export class CreateReportTemplateDto {
  @ApiProperty({ description: 'Template key (unique)', example: 'sales_report' })
  @IsString()
  key!: string;

  @ApiProperty({ description: 'Template name in Arabic', example: 'تقرير المبيعات' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Template name in English', example: 'Sales Report' })
  @IsString()
  nameEn!: string;

  @ApiProperty({ description: 'Description in Arabic', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Description in English', required: false })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiProperty({ description: 'Category', example: 'sales' })
  @IsString()
  category!: string;

  @ApiProperty({ description: 'Available sections', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableSections?: string[];

  @ApiProperty({ description: 'Available metrics', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableMetrics?: string[];

  @ApiProperty({ description: 'Available charts', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableCharts?: string[];

  @ApiProperty({ description: 'Available filters', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableFilters?: string[];

  @ApiProperty({ description: 'Default sections', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  defaultSections?: string[];

  @ApiProperty({ description: 'Default filters', required: false })
  @IsOptional()
  @IsObject()
  defaultFilters?: Record<string, unknown>;

  @ApiProperty({ description: 'Default metrics', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  defaultMetrics?: string[];

  @ApiProperty({ description: 'Default charts', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  defaultCharts?: string[];

  @ApiProperty({ description: 'Is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateReportTemplateDto {
  @ApiProperty({ description: 'Template name in Arabic', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Template name in English', required: false })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiProperty({ description: 'Description in Arabic', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Description in English', required: false })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiProperty({ description: 'Available sections', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableSections?: string[];

  @ApiProperty({ description: 'Available metrics', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableMetrics?: string[];

  @ApiProperty({ description: 'Available charts', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableCharts?: string[];

  @ApiProperty({ description: 'Available filters', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableFilters?: string[];

  @ApiProperty({ description: 'Default sections', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  defaultSections?: string[];

  @ApiProperty({ description: 'Default filters', required: false })
  @IsOptional()
  @IsObject()
  defaultFilters?: Record<string, unknown>;

  @ApiProperty({ description: 'Default metrics', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  defaultMetrics?: string[];

  @ApiProperty({ description: 'Default charts', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  defaultCharts?: string[];

  @ApiProperty({ description: 'Is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class GenerateCustomReportDto {
  @ApiProperty({ description: 'Template key or report type', example: 'sales_report' })
  @IsString()
  templateKey!: string;

  @ApiProperty({ description: 'Report title', example: 'تقرير مبيعات مخصص' })
  @IsString()
  title!: string;

  @ApiProperty({ description: 'Report title in English', example: 'Custom Sales Report' })
  @IsString()
  titleEn!: string;

  @ApiProperty({ description: 'Start date', example: '2024-01-01' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ description: 'End date', example: '2024-01-31' })
  @IsDateString()
  endDate!: string;

  @ApiProperty({ description: 'Selected sections', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sections?: string[];

  @ApiProperty({ description: 'Selected metrics', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metrics?: string[];

  @ApiProperty({ description: 'Selected charts', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  charts?: string[];

  @ApiProperty({ description: 'Custom filters', required: false })
  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;

  @ApiProperty({ description: 'Compare with previous period', required: false })
  @IsOptional()
  @IsBoolean()
  compareWithPrevious?: boolean;

  @ApiProperty({ description: 'Include recommendations', required: false })
  @IsOptional()
  @IsBoolean()
  includeRecommendations?: boolean;
}

export class PreviewCustomReportDto {
  @ApiProperty({ description: 'Template key or report type', example: 'sales_report' })
  @IsString()
  templateKey!: string;

  @ApiProperty({ description: 'Start date', example: '2024-01-01' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ description: 'End date', example: '2024-01-31' })
  @IsDateString()
  endDate!: string;

  @ApiProperty({ description: 'Selected sections', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sections?: string[];

  @ApiProperty({ description: 'Selected metrics', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metrics?: string[];

  @ApiProperty({ description: 'Custom filters', required: false })
  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;
}

export class UpdateAlertStatusDto {
  @ApiProperty({ description: 'New status', enum: ['open', 'acknowledged', 'resolved', 'ignored'] })
  @IsEnum(['open', 'acknowledged', 'resolved', 'ignored'])
  status!: 'open' | 'acknowledged' | 'resolved' | 'ignored';
}

export class ListAlertsQueryDto {
  @ApiProperty({ description: 'Filter by status', required: false })
  @IsOptional()
  @IsEnum(['open', 'acknowledged', 'resolved', 'ignored'])
  status?: 'open' | 'acknowledged' | 'resolved' | 'ignored';

  @ApiProperty({ description: 'Filter by severity', required: false })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'critical'])
  severity?: 'low' | 'medium' | 'high' | 'critical';

  @ApiProperty({ description: 'Filter by source', required: false })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiProperty({ description: 'Page number', required: false })
  @IsOptional()
  page?: number;

  @ApiProperty({ description: 'Items per page', required: false })
  @IsOptional()
  limit?: number;
}
