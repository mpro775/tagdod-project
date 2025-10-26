import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { SystemMonitoringService } from './system-monitoring.service';
import {
  SystemHealthDto,
  ResourceUsageDto,
  DatabaseMetricsDto,
  ApiPerformanceDto,
  RedisMetricsDto,
  SystemAlertsDto,
  SystemMetricsHistoryDto,
  SystemMetricsQueryDto,
  MetricType,
  TimeRange,
} from './dto/system-monitoring.dto';

@ApiTags('مراقبة النظام')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('system-monitoring')
export class SystemMonitoringController {
  constructor(
    private readonly systemMonitoringService: SystemMonitoringService,
  ) {}

  @Get('health')
  @ApiOperation({
    summary: 'الحصول على صحة النظام العامة',
    description: 'استرداد مقاييس صحة النظام الشاملة مع جميع المكونات',
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد صحة النظام بنجاح',
    type: SystemHealthDto,
  })
  async getSystemHealth(): Promise<SystemHealthDto> {
    return this.systemMonitoringService.getSystemHealth();
  }

  @Get('resources')
  @ApiOperation({
    summary: 'الحصول على استخدام الموارد',
    description: 'استرداد معلومات استخدام CPU والذاكرة والقرص',
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد استخدام الموارد بنجاح',
    type: ResourceUsageDto,
  })
  async getResourceUsage(): Promise<ResourceUsageDto> {
    return this.systemMonitoringService.getResourceUsage();
  }

  @Get('database')
  @ApiOperation({
    summary: 'الحصول على مقاييس قاعدة البيانات',
    description: 'استرداد معلومات أداء وحالة MongoDB',
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد مقاييس قاعدة البيانات بنجاح',
    type: DatabaseMetricsDto,
  })
  async getDatabaseMetrics(): Promise<DatabaseMetricsDto> {
    return this.systemMonitoringService.getDatabaseMetrics();
  }

  @Get('redis')
  @ApiOperation({
    summary: 'الحصول على مقاييس Redis',
    description: 'استرداد معلومات أداء وحالة Redis Cache',
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد مقاييس Redis بنجاح',
    type: RedisMetricsDto,
  })
  async getRedisMetrics(): Promise<RedisMetricsDto> {
    return this.systemMonitoringService.getRedisMetrics();
  }

  @Get('api-performance')
  @ApiOperation({
    summary: 'الحصول على أداء API',
    description: 'استرداد إحصائيات أداء واستجابة API',
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد أداء API بنجاح',
    type: ApiPerformanceDto,
  })
  async getApiPerformance(): Promise<ApiPerformanceDto> {
    return this.systemMonitoringService.getApiPerformance();
  }

  @Get('metrics/history')
  @ApiOperation({
    summary: 'الحصول على تاريخ المقاييس',
    description: 'استرداد البيانات التاريخية للمقاييس المختلفة',
  })
  @ApiQuery({
    name: 'metricType',
    enum: MetricType,
    required: false,
    description: 'نوع المقياس',
  })
  @ApiQuery({
    name: 'timeRange',
    enum: TimeRange,
    required: false,
    description: 'النطاق الزمني',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'تاريخ البداية (صيغة ISO)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'تاريخ النهاية (صيغة ISO)',
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد تاريخ المقاييس بنجاح',
    type: SystemMetricsHistoryDto,
  })
  async getMetricsHistory(
    @Query() query: SystemMetricsQueryDto,
  ): Promise<SystemMetricsHistoryDto> {
    return this.systemMonitoringService.getMetricsHistory(query);
  }

  @Get('alerts')
  @ApiOperation({
    summary: 'الحصول على تنبيهات النظام',
    description: 'استرداد قائمة التنبيهات النشطة والحرجة',
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد التنبيهات بنجاح',
    type: SystemAlertsDto,
  })
  async getSystemAlerts(): Promise<SystemAlertsDto> {
    return this.systemMonitoringService.getSystemAlerts();
  }

  @Post('alerts/:id/resolve')
  @ApiOperation({
    summary: 'حل تنبيه',
    description: 'وضع علامة على تنبيه كمحلول',
  })
  @ApiParam({
    name: 'id',
    description: 'معرف التنبيه',
  })
  @ApiResponse({
    status: 200,
    description: 'تم حل التنبيه بنجاح',
  })
  async resolveAlert(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ): Promise<{ message: string }> {
    const userId = req.user.userId;
    await this.systemMonitoringService.resolveAlert(id, userId);
    return { message: 'تم حل التنبيه بنجاح' };
  }

  @Get('overview')
  @ApiOperation({
    summary: 'الحصول على نظرة عامة شاملة',
    description: 'استرداد جميع المقاييس في استجابة واحدة',
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد النظرة العامة بنجاح',
  })
  async getSystemOverview() {
    const [health, resources, database, redis, apiPerf, alerts] =
      await Promise.all([
        this.systemMonitoringService.getSystemHealth(),
        this.systemMonitoringService.getResourceUsage(),
        this.systemMonitoringService.getDatabaseMetrics(),
        this.systemMonitoringService.getRedisMetrics(),
        this.systemMonitoringService.getApiPerformance(),
        this.systemMonitoringService.getSystemAlerts(),
      ]);

    return {
      health,
      resources,
      database,
      redis,
      apiPerformance: apiPerf,
      alerts,
      timestamp: new Date(),
    };
  }
}

