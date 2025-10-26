import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MetricType {
  CPU = 'cpu',
  MEMORY = 'memory',
  DISK = 'disk',
  DATABASE = 'database',
  REDIS = 'redis',
  API = 'api',
}

export enum TimeRange {
  LAST_HOUR = 'last_hour',
  LAST_24_HOURS = 'last_24_hours',
  LAST_7_DAYS = 'last_7_days',
  LAST_30_DAYS = 'last_30_days',
  CUSTOM = 'custom',
}

export class SystemMetricsQueryDto {
  @ApiPropertyOptional({ 
    description: 'نوع المقياس المراد عرضه',
    enum: MetricType 
  })
  @IsOptional()
  @IsEnum(MetricType)
  metricType?: MetricType;

  @ApiPropertyOptional({ 
    description: 'النطاق الزمني',
    enum: TimeRange,
    default: TimeRange.LAST_24_HOURS
  })
  @IsOptional()
  @IsEnum(TimeRange)
  timeRange?: TimeRange;

  @ApiPropertyOptional({ description: 'تاريخ البداية (صيغة ISO)' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'تاريخ النهاية (صيغة ISO)' })
  @IsOptional()
  @IsString()
  endDate?: string;
}

export class SystemHealthDto {
  @ApiProperty({ description: 'حالة النظام العامة' })
  status!: 'healthy' | 'warning' | 'critical';

  @ApiProperty({ description: 'وقت التشغيل بالثواني' })
  uptime!: number;

  @ApiProperty({ description: 'استخدام CPU (نسبة مئوية)' })
  cpuUsage!: number;

  @ApiProperty({ description: 'استخدام الذاكرة (نسبة مئوية)' })
  memoryUsage!: number;

  @ApiProperty({ description: 'استخدام القرص (نسبة مئوية)' })
  diskUsage!: number;

  @ApiProperty({ description: 'حالة قاعدة البيانات' })
  databaseStatus!: {
    connected: boolean;
    responseTime: number;
    collections: number;
    totalSize: number;
  };

  @ApiProperty({ description: 'حالة Redis Cache' })
  redisStatus!: {
    connected: boolean;
    responseTime: number;
    memoryUsage: number;
    hitRate: number;
  };

  @ApiProperty({ description: 'متوسط وقت استجابة API (ms)' })
  avgApiResponseTime!: number;

  @ApiProperty({ description: 'عدد الطلبات النشطة' })
  activeRequests!: number;

  @ApiProperty({ description: 'معدل الأخطاء (نسبة مئوية)' })
  errorRate!: number;

  @ApiProperty({ description: 'وقت آخر تحديث' })
  lastUpdated!: Date;
}

export class ResourceUsageDto {
  @ApiProperty({ description: 'الطابع الزمني' })
  timestamp!: Date;

  @ApiProperty({ description: 'استخدام CPU' })
  cpu!: {
    usage: number;
    cores: number;
    load: number[];
  };

  @ApiProperty({ description: 'استخدام الذاكرة' })
  memory!: {
    total: number;
    used: number;
    free: number;
    usagePercentage: number;
    heapUsed: number;
    heapTotal: number;
  };

  @ApiProperty({ description: 'استخدام القرص' })
  disk!: {
    total: number;
    used: number;
    free: number;
    usagePercentage: number;
  };
}

export class DatabaseMetricsDto {
  @ApiProperty({ description: 'حالة الاتصال' })
  connected!: boolean;

  @ApiProperty({ description: 'وقت الاستجابة (ms)' })
  responseTime!: number;

  @ApiProperty({ description: 'عدد المجموعات' })
  collectionsCount!: number;

  @ApiProperty({ description: 'إجمالي عدد الوثائق' })
  totalDocuments!: number;

  @ApiProperty({ description: 'حجم قاعدة البيانات (bytes)' })
  databaseSize!: number;

  @ApiProperty({ description: 'حجم الفهارس (bytes)' })
  indexSize!: number;

  @ApiProperty({ description: 'العمليات النشطة' })
  activeOperations!: number;

  @ApiProperty({ description: 'قائمة بأبطأ الاستعلامات' })
  slowQueries!: Array<{
    operation: string;
    collection: string;
    duration: number;
    timestamp: Date;
  }>;
}

export class ApiPerformanceDto {
  @ApiProperty({ description: 'إجمالي عدد الطلبات' })
  totalRequests!: number;

  @ApiProperty({ description: 'الطلبات الناجحة' })
  successfulRequests!: number;

  @ApiProperty({ description: 'الطلبات الفاشلة' })
  failedRequests!: number;

  @ApiProperty({ description: 'متوسط وقت الاستجابة (ms)' })
  avgResponseTime!: number;

  @ApiProperty({ description: 'أدنى وقت استجابة (ms)' })
  minResponseTime!: number;

  @ApiProperty({ description: 'أقصى وقت استجابة (ms)' })
  maxResponseTime!: number;

  @ApiProperty({ description: 'عدد الطلبات في الدقيقة' })
  requestsPerMinute!: number;

  @ApiProperty({ description: 'معدل الأخطاء (%)' })
  errorRate!: number;

  @ApiProperty({ description: 'أبطأ نقاط النهاية' })
  slowestEndpoints!: Array<{
    endpoint: string;
    method: string;
    avgTime: number;
    maxTime: number;
    callCount: number;
  }>;
}

export class RedisMetricsDto {
  @ApiProperty({ description: 'حالة الاتصال' })
  connected!: boolean;

  @ApiProperty({ description: 'وقت الاستجابة (ms)' })
  responseTime!: number;

  @ApiProperty({ description: 'استخدام الذاكرة (bytes)' })
  memoryUsage!: number;

  @ApiProperty({ description: 'الذاكرة القصوى (bytes)' })
  maxMemory!: number;

  @ApiProperty({ description: 'نسبة استخدام الذاكرة (%)' })
  memoryUsagePercentage!: number;

  @ApiProperty({ description: 'عدد المفاتيح' })
  keysCount!: number;

  @ApiProperty({ description: 'معدل الإصابة (%)' })
  hitRate!: number;

  @ApiProperty({ description: 'معدل الفشل (%)' })
  missRate!: number;

  @ApiProperty({ description: 'العمليات في الثانية' })
  operationsPerSecond!: number;
}

export class SystemAlertsDto {
  @ApiProperty({ description: 'قائمة التنبيهات' })
  alerts!: Array<{
    id: string;
    type: 'warning' | 'critical' | 'info';
    category: string;
    message: string;
    details: string;
    timestamp: Date;
    resolved: boolean;
  }>;

  @ApiProperty({ description: 'عدد التنبيهات النشطة' })
  activeAlertsCount?: number;

  @ApiProperty({ description: 'عدد التنبيهات الحرجة' })
  criticalAlertsCount?: number;
}

export class SystemMetricsHistoryDto {
  @ApiProperty({ description: 'نوع المقياس' })
  metricType!: MetricType;

  @ApiProperty({ description: 'البيانات التاريخية' })
  data!: Array<{
    timestamp: Date;
    value: number;
    metadata?: Record<string, unknown>;
  }>;

  @ApiProperty({ description: 'الإحصائيات' })
  statistics!: {
    min: number;
    max: number;
    avg: number;
    current: number;
  };
}

