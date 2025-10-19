import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsArray,
  IsObject,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { PeriodType } from '../schemas/analytics-snapshot.schema';
import { ReportType, ReportFormat, ScheduleFrequency } from '../schemas/report-schedule.schema';
import { ReportCategory } from '../schemas/advanced-report.schema';

// ===== Unified Analytics Query DTO =====
export class UnifiedAnalyticsQueryDto {
  @ApiProperty({
    description: 'نوع الفترة الزمنية',
    enum: PeriodType,
    example: PeriodType.MONTHLY,
    required: false,
  })
  @IsOptional()
  @IsEnum(PeriodType)
  period?: PeriodType = PeriodType.MONTHLY;

  @ApiProperty({
    description: 'تاريخ البداية',
    example: '2023-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'تاريخ النهاية',
    example: '2023-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'مقارنة مع الفترة السابقة',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  compareWithPrevious?: boolean = false;

  @ApiProperty({
    description: 'عدد الصفحات',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({
    description: 'حجم الصفحة',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

// ===== Unified Report Generation DTO =====
export class UnifiedReportGenerationDto {
  @ApiProperty({
    description: 'عنوان التقرير',
    example: 'تقرير المبيعات الشهري',
  })
  @IsString()
  title!: string;

  @ApiProperty({
    description: 'نوع التقرير',
    enum: ReportType,
    example: ReportType.MONTHLY_REPORT,
  })
  @IsEnum(ReportType)
  reportType!: ReportType;

  @ApiProperty({
    description: 'فئة التقرير',
    enum: ReportCategory,
    example: ReportCategory.SALES,
  })
  @IsEnum(ReportCategory)
  category!: ReportCategory;

  @ApiProperty({
    description: 'تنسيقات التقرير',
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
    description: 'تاريخ البداية',
    example: '2023-01-01',
  })
  @IsDateString()
  startDate!: string;

  @ApiProperty({
    description: 'تاريخ النهاية',
    example: '2023-12-31',
  })
  @IsDateString()
  endDate!: string;

  @ApiProperty({
    description: 'فلاتر إضافية',
    example: { category: 'solar_panels', status: 'active' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;

  @ApiProperty({
    description: 'تضمين الرسوم البيانية',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  includeCharts?: boolean = true;

  @ApiProperty({
    description: 'تضمين البيانات الأولية',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  includeRawData?: boolean = false;
}

// ===== Unified Dashboard Data DTO =====
export class UnifiedDashboardDataDto {
  @ApiProperty({
    description: 'بيانات لوحة التحكم الرئيسية',
  })
  overview!: {
    totalUsers: number;
    totalRevenue: number;
    totalOrders: number;
    activeServices: number;
    openSupportTickets: number;
    systemHealth: number;
  };

  @ApiProperty({
    description: 'مخططات الإيرادات',
  })
  revenueCharts!: {
    daily: Array<{ date: string; revenue: number; orders: number }>;
    monthly: Array<{ month: string; revenue: number; growth: number }>;
    byCategory: Array<{ category: string; revenue: number; percentage: number }>;
  };

  @ApiProperty({
    description: 'مخططات المستخدمين',
  })
  userCharts!: {
    registrationTrend: Array<{ date: string; newUsers: number; activeUsers: number }>;
    userTypes: Array<{ type: string; count: number; percentage: number }>;
    geographic: Array<{ location: string; users: number; revenue: number }>;
  };

  @ApiProperty({
    description: 'مخططات المنتجات',
  })
  productCharts!: {
    topSelling: Array<{ name: string; sold: number; revenue: number }>;
    categoryPerformance: Array<{ category: string; products: number; revenue: number }>;
    stockAlerts: Array<{ name: string; currentStock: number; minRequired: number }>;
  };

  @ApiProperty({
    description: 'مخططات الخدمات',
  })
  serviceCharts!: {
    requestTrend: Array<{ date: string; requests: number; completed: number }>;
    engineerPerformance: Array<{ name: string; completed: number; rating: number }>;
    responseTimes: { average: number; target: number; trend: number[] };
  };

  @ApiProperty({
    description: 'مخططات الدعم',
  })
  supportCharts!: {
    ticketTrend: Array<{ date: string; new: number; resolved: number }>;
    categoryBreakdown: Array<{ category: string; count: number; avgResolutionTime: number }>;
    agentPerformance: Array<{ name: string; resolved: number; satisfaction: number }>;
  };

  @ApiProperty({
    description: 'المؤشرات الرئيسية',
  })
  kpis!: {
    revenueGrowth: number;
    customerSatisfaction: number;
    orderConversion: number;
    serviceEfficiency: number;
    supportResolution: number;
    systemUptime: number;
  };
}

// ===== Unified Performance Metrics DTO =====
export class UnifiedPerformanceMetricsDto {
  @ApiProperty({
    description: 'متوسط وقت استجابة API',
    example: 245,
  })
  apiResponseTime!: number;

  @ApiProperty({
    description: 'معدل الأخطاء',
    example: 0.02,
  })
  errorRate!: number;

  @ApiProperty({
    description: 'نسبة التشغيل',
    example: 99.9,
  })
  uptime!: number;

  @ApiProperty({
    description: 'المستخدمون المتزامنون',
    example: 1250,
  })
  concurrentUsers!: number;

  @ApiProperty({
    description: 'ذاكرة النظام المستخدمة',
    example: 75.5,
  })
  memoryUsage!: number;

  @ApiProperty({
    description: 'استخدام المعالج',
    example: 45.2,
  })
  cpuUsage!: number;

  @ApiProperty({
    description: 'مساحة القرص المستخدمة',
    example: 68.3,
  })
  diskUsage!: number;

  @ApiProperty({
    description: 'عدد قواعد البيانات النشطة',
    example: 5,
  })
  activeConnections!: number;

  @ApiProperty({
    description: 'أبطأ نقاط النهاية',
  })
  slowestEndpoints!: Array<{
    endpoint: string;
    method: string;
    averageTime: number;
    maxTime: number;
    callCount: number;
  }>;

  @ApiProperty({
    description: 'إحصائيات قاعدة البيانات',
  })
  databaseStats!: {
    totalCollections: number;
    totalDocuments: number;
    databaseSize: number;
    indexSize: number;
  };
}

// ===== Unified Report Response DTO =====
export class UnifiedReportResponseDto {
  @ApiProperty({
    description: 'معرف التقرير',
    example: '507f1f77bcf86cd799439011',
  })
  id!: string;

  @ApiProperty({
    description: 'نوع التقرير',
    enum: ReportType,
    example: ReportType.MONTHLY_REPORT,
  })
  type!: ReportType;

  @ApiProperty({
    description: 'فترة التقرير',
    example: 'يناير 2024',
  })
  period!: string;

  @ApiProperty({
    description: 'تاريخ إنشاء التقرير',
    example: '2024-01-31T23:59:59Z',
  })
  generatedAt!: Date;

  @ApiProperty({
    description: 'البيانات التحليلية',
  })
  data!: UnifiedDashboardDataDto;

  @ApiProperty({
    description: 'التوصيات والملاحظات',
    example: ['الإيرادات زادت بنسبة 15%', 'تحتاج إلى تحسين خدمة العملاء'],
    required: false,
  })
  insights?: string[];

  @ApiProperty({
    description: 'روابط ملفات التقرير',
    example: ['https://cdn.example.com/reports/monthly-2024-01.pdf'],
    required: false,
  })
  fileUrls?: string[];
}

// ===== Unified Schedule DTO =====
export class UnifiedScheduleDto {
  @ApiProperty({
    description: 'اسم التقرير المجدول',
    example: 'تقرير المبيعات الأسبوعي',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'وصف التقرير',
    example: 'تقرير شامل للمبيعات والإيرادات الأسبوعية',
  })
  @IsString()
  description!: string;

  @ApiProperty({
    description: 'نوع التقرير',
    enum: ReportType,
    example: ReportType.WEEKLY_REPORT,
  })
  @IsEnum(ReportType)
  reportType!: ReportType;

  @ApiProperty({
    description: 'التكرار',
    enum: ScheduleFrequency,
    example: ScheduleFrequency.WEEKLY,
  })
  @IsEnum(ScheduleFrequency)
  frequency!: ScheduleFrequency;

  @ApiProperty({
    description: 'تنسيقات التقرير',
    enum: ReportFormat,
    isArray: true,
    example: [ReportFormat.PDF],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(ReportFormat, { each: true })
  formats?: ReportFormat[] = [ReportFormat.PDF];

  @ApiProperty({
    description: 'عناوين البريد الإلكتروني للمستلمين',
    type: [String],
    example: ['admin@example.com', 'manager@example.com'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipients?: string[];

  @ApiProperty({
    description: 'فلاتر إضافية',
    example: { includeCharts: true, dateRange: { months: 3 } },
    required: false,
  })
  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;

  @ApiProperty({
    description: 'إعدادات إضافية',
    example: {
      includeCharts: true,
      branding: { companyName: 'شركة الطاقة الشمسية' }
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}
