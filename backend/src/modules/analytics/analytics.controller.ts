import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Param,
  UseGuards,
  GatewayTimeoutException,
  Delete,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { TimeoutError, catchError, timeout, from } from 'rxjs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { AnalyticsService } from './analytics.service';
import { AdvancedAnalyticsService } from './advanced-analytics.service';
import {
  AnalyticsQueryDto,
  ReportGenerationDto,
  CreateReportScheduleDto,
  DashboardDataDto,
  AnalyticsReportDto,
  PerformanceMetricsDto,
} from './dto/analytics.dto';
import { PeriodType } from './schemas/analytics-snapshot.schema';
import { ReportType } from './schemas/report-schedule.schema';
import { ReportCategory } from './schemas/advanced-report.schema';

@ApiTags('التحليلات')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('analytics')
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);

  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly advancedAnalyticsService: AdvancedAnalyticsService,
  ) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'الحصول على بيانات لوحة التحكم',
    description:
      'استرداد بيانات تحليلات شاملة للوحة التحكم مع الرسوم البيانية ومؤشرات الأداء الرئيسية',
  })
  @ApiQuery({
    name: 'period',
    enum: PeriodType,
    required: false,
    description: 'الفترة الزمنية للتحليلات',
  })
  @ApiQuery({ name: 'startDate', required: false, description: 'تاريخ البداية (صيغة ISO)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'تاريخ النهاية (صيغة ISO)' })
  @ApiQuery({
    name: 'compareWithPrevious',
    required: false,
    type: Boolean,
    description: 'المقارنة مع الفترة السابقة',
  })
  @ApiResponse({ status: 200, description: 'تم استرداد بيانات لوحة التحكم بنجاح', type: Object })
  async getDashboard(@Query() query: AnalyticsQueryDto): Promise<DashboardDataDto> {
    const result = await from(this.analyticsService.getDashboardData(query))
      .pipe(
        timeout(30000), // Increased from 8s to 30s for large datasets
        catchError((err) => {
          if (err instanceof TimeoutError) {
            throw new GatewayTimeoutException('Dashboard generation timed out');
          }
          throw err;
        }),
      )
      .toPromise();
    return result!;
  }

  @Get('overview')
  @ApiOperation({
    summary: 'الحصول على مقاييس النظرة العامة',
    description: 'استرداد مؤشرات الأداء الرئيسية وإحصائيات النظرة العامة',
  })
  @ApiQuery({ name: 'period', enum: PeriodType, required: false })
  @ApiResponse({ status: 200, description: 'تم استرداد مقاييس النظرة العامة بنجاح' })
  async getOverview(@Query() query: AnalyticsQueryDto) {
    const dashboard = await this.analyticsService.getDashboardData(query);
    return dashboard.overview;
  }

  @Get('revenue')
  @ApiOperation({
    summary: 'الحصول على تحليلات الإيرادات',
    description: 'تحليل مفصل للإيرادات مع الاتجاهات والتفصيلات',
  })
  @ApiQuery({ name: 'period', enum: PeriodType, required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'تم استرداد تحليلات الإيرادات بنجاح' })
  async getRevenueAnalytics(@Query() query: AnalyticsQueryDto) {
    const dashboard = await this.analyticsService.getDashboardData(query);
    return dashboard.revenueCharts;
  }

  @Get('users')
  @ApiOperation({
    summary: 'الحصول على تحليلات المستخدمين',
    description: 'اتجاهات تسجيل المستخدمين والتركيبة السكانية ومقاييس التفاعل',
  })
  @ApiQuery({ name: 'period', enum: PeriodType, required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'تم استرداد تحليلات المستخدمين بنجاح' })
  async getUserAnalytics(@Query() query: AnalyticsQueryDto) {
    const dashboard = await this.analyticsService.getDashboardData(query);
    return dashboard.userCharts;
  }

  @Get('products')
  @ApiOperation({
    summary: 'الحصول على تحليلات المنتجات',
    description: 'أداء المنتجات واتجاهات المبيعات وتحليلات المخزون',
  })
  @ApiQuery({ name: 'period', enum: PeriodType, required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'تم استرداد تحليلات المنتجات بنجاح' })
  async getProductAnalytics(@Query() query: AnalyticsQueryDto) {
    const dashboard = await this.analyticsService.getDashboardData(query);
    return dashboard.productCharts;
  }

  @Get('services')
  @ApiOperation({
    summary: 'الحصول على تحليلات الخدمات',
    description: 'اتجاهات طلبات الخدمات وأداء المهندسين ومقاييس الإنجاز',
  })
  @ApiQuery({ name: 'period', enum: PeriodType, required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'تم استرداد تحليلات الخدمات بنجاح' })
  async getServiceAnalytics(@Query() query: AnalyticsQueryDto) {
    const dashboard = await this.analyticsService.getDashboardData(query);
    return dashboard.serviceCharts;
  }

  @Get('support')
  @ApiOperation({
    summary: 'الحصول على تحليلات الدعم',
    description: 'اتجاهات تذاكر الدعم وأوقات الحل ورضا العملاء',
  })
  @ApiQuery({ name: 'period', enum: PeriodType, required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'تم استرداد تحليلات الدعم بنجاح' })
  async getSupportAnalytics(@Query() query: AnalyticsQueryDto) {
    const dashboard = await this.analyticsService.getDashboardData(query);
    return dashboard.supportCharts;
  }

  @Get('performance')
  @ApiOperation({
    summary: 'الحصول على مقاييس أداء النظام',
    description: 'أوقات استجابة API ومعدلات الأخطاء ووقت التشغيل وصحة النظام',
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد مقاييس الأداء بنجاح',
    type: PerformanceMetricsDto,
  })
  async getPerformanceMetrics(): Promise<PerformanceMetricsDto> {
    // Get performance metrics from analytics service
    const metrics = await this.analyticsService.getPerformanceMetrics();
    return metrics;
  }

  @Post('reports/generate')
  @ApiOperation({
    summary: 'إنشاء تقرير مخصص',
    description: 'إنشاء تقرير تحليلات مخصص بالصيغ المحددة',
  })
  @ApiBody({ type: ReportGenerationDto })
  @ApiResponse({ status: 201, description: 'تم إنشاء التقرير بنجاح', type: AnalyticsReportDto })
  async generateReport(@Body() dto: ReportGenerationDto): Promise<AnalyticsReportDto> {
    // Map ReportType to report category for advanced analytics
    const categoryMap: Partial<Record<ReportType, string>> = {
      [ReportType.MONTHLY_REPORT]: 'sales',
      [ReportType.WEEKLY_REPORT]: 'sales',
      [ReportType.DAILY_SUMMARY]: 'sales',
      [ReportType.REVENUE_REPORT]: 'sales',
      [ReportType.PRODUCT_PERFORMANCE]: 'products',
      [ReportType.USER_ACTIVITY]: 'customers',
      [ReportType.SERVICE_ANALYTICS]: 'services',
      [ReportType.SUPPORT_METRICS]: 'support',
      [ReportType.CUSTOM_REPORT]: 'sales',
    };

    const category = categoryMap[dto.reportType] || 'sales';

    // Generate advanced report
    const report = await this.advancedAnalyticsService.generateAdvancedReport({
      category: category as ReportCategory,
      startDate: dto.startDate,
      endDate: dto.endDate,
      createdBy: 'system',
      creatorName: 'System Generated',
    });

    // Convert to AnalyticsReportDto format
    const dashboard = await this.analyticsService.getDashboardData({
      period: PeriodType.MONTHLY,
      startDate: dto.startDate,
      endDate: dto.endDate,
    });

    // Generate file URLs for requested formats
    const fileUrls: string[] = [];
    if (dto.formats && dto.formats.length > 0) {
      for (const format of dto.formats) {
        try {
          const exportResult = await this.advancedAnalyticsService.exportReport(report.id, {
            format: format.toLowerCase() as 'pdf' | 'xlsx' | 'csv' | 'json',
          });
          if (exportResult && exportResult.fileUrl) {
            fileUrls.push(exportResult.fileUrl);
          }
        } catch (error) {
          this.logger.warn(`Failed to generate ${format} export:`, error);
        }
      }
    }

    // Get full report data to access insights if available
    let insights: string[] = [];
    try {
      const fullReport = await this.advancedAnalyticsService.getAdvancedReport(report.id);
      insights = fullReport.insights || [];
    } catch (error) {
      this.logger.warn('Failed to get full report for insights:', error);
    }

    return {
      id: report.id,
      type: dto.reportType,
      period: `${dto.startDate || 'Start'} to ${dto.endDate || 'End'}`,
      generatedAt:
        typeof report.generatedAt === 'string'
          ? new Date(report.generatedAt)
          : report.generatedAt &&
              typeof report.generatedAt === 'object' &&
              'getTime' in report.generatedAt
            ? (report.generatedAt as Date)
            : new Date(),
      data: dashboard,
      insights,
      fileUrls,
    };
  }

  @Get('reports/:id')
  @ApiOperation({
    summary: 'الحصول على تقرير بالمعرف',
    description: 'استرداد تقرير تم إنشاؤه سابقاً',
  })
  @ApiParam({ name: 'id', description: 'معرف التقرير' })
  @ApiResponse({ status: 200, description: 'تم استرداد التقرير بنجاح', type: AnalyticsReportDto })
  async getReport(@Param('id') id: string): Promise<AnalyticsReportDto> {
    // Retrieve report from database
    const report = await this.advancedAnalyticsService.getAdvancedReport(id);

    // Get dashboard data for the report period
    const dashboard = await this.analyticsService.getDashboardData({
      startDate: report.startDate,
      endDate: report.endDate,
    });

    return {
      id: report.id,
      type: ReportType.MONTHLY_REPORT, // Default type, should be stored in report
      period: `${report.startDate} to ${report.endDate}`,
      generatedAt:
        typeof report.generatedAt === 'string'
          ? new Date(report.generatedAt)
          : report.generatedAt &&
              typeof report.generatedAt === 'object' &&
              'getTime' in report.generatedAt
            ? (report.generatedAt as Date)
            : new Date(),
      data: dashboard,
      insights: report.insights || [],
      fileUrls: [], // fileUrls are generated on-demand via exportReport endpoint
    };
  }

  @Post('reports/schedule')
  @ApiOperation({
    summary: 'جدولة تقرير تلقائي',
    description: 'إنشاء تقرير مجدول يعمل تلقائياً',
  })
  @ApiBody({ type: CreateReportScheduleDto })
  @ApiResponse({ status: 201, description: 'تم إنشاء جدولة التقرير بنجاح' })
  async scheduleReport(
    @Body() dto: CreateReportScheduleDto, // eslint-disable-line @typescript-eslint/no-unused-vars
  ) {
    // Implementation would create a scheduled report
    return {
      scheduleId: `schedule_${Date.now()}`,
      message: 'Report scheduled successfully',
    };
  }

  @Get('kpis')
  @ApiOperation({
    summary: 'الحصول على مقاييس KPI',
    description: 'استرداد مؤشرات الأداء الرئيسية',
  })
  @ApiQuery({ name: 'period', enum: PeriodType, required: false })
  @ApiResponse({ status: 200, description: 'تم استرداد مؤشرات الأداء الرئيسية بنجاح' })
  async getKPIs(@Query() query: AnalyticsQueryDto) {
    const dashboard = await this.analyticsService.getDashboardData(query);
    return dashboard.kpis;
  }

  @Get('trends/:metric')
  @ApiOperation({
    summary: 'الحصول على اتجاهات المقياس',
    description: 'استرداد بيانات الاتجاهات لمقاييس محددة عبر الزمن',
  })
  @ApiParam({ name: 'metric', description: 'اسم المقياس (الإيرادات، المستخدمين، الطلبات، إلخ)' })
  @ApiQuery({ name: 'period', enum: PeriodType, required: false })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'عدد الأيام للبحث للخلف' })
  @ApiResponse({ status: 200, description: 'تم استرداد اتجاهات المقياس بنجاح' })
  async getMetricTrends(
    @Param('metric') metric: string,
    @Query('period') period?: PeriodType,
    @Query('days') days = 30,
  ) {
    // Calculate date range based on days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Use advanced analytics service to get real trend data
    const trends = await this.advancedAnalyticsService.getMetricTrendsAdvanced(
      metric,
      startDate.toISOString(),
      endDate.toISOString(),
    );

    return trends;
  }

  @Get('comparison')
  @ApiOperation({
    summary: 'مقارنة الفترات',
    description: 'مقارنة التحليلات بين فترتين مختلفتين',
  })
  @ApiQuery({ name: 'currentStart', required: true, description: 'تاريخ بداية الفترة الحالية' })
  @ApiQuery({ name: 'currentEnd', required: true, description: 'تاريخ نهاية الفترة الحالية' })
  @ApiQuery({ name: 'previousStart', required: true, description: 'تاريخ بداية الفترة السابقة' })
  @ApiQuery({ name: 'previousEnd', required: true, description: 'تاريخ نهاية الفترة السابقة' })
  @ApiResponse({ status: 200, description: 'تم استرداد مقارنة الفترات بنجاح' })
  async comparePeriods(
    @Query('currentStart') currentStart: string,
    @Query('currentEnd') currentEnd: string,
    @Query('previousStart') previousStart: string,
    @Query('previousEnd') previousEnd: string,
  ) {
    // Implementation would compare two periods
    const current = await this.analyticsService.getDashboardData({
      startDate: currentStart,
      endDate: currentEnd,
    });

    const previous = await this.analyticsService.getDashboardData({
      startDate: previousStart,
      endDate: previousEnd,
    });

    // Calculate differences
    const comparison = {
      overview: {
        totalUsers: {
          current: current.overview.totalUsers,
          previous: previous.overview.totalUsers,
          change:
            ((current.overview.totalUsers - previous.overview.totalUsers) /
              previous.overview.totalUsers) *
            100,
        },
        totalRevenue: {
          current: current.overview.totalRevenue,
          previous: previous.overview.totalRevenue,
          change:
            ((current.overview.totalRevenue - previous.overview.totalRevenue) /
              previous.overview.totalRevenue) *
            100,
        },
        totalOrders: {
          current: current.overview.totalOrders,
          previous: previous.overview.totalOrders,
          change:
            ((current.overview.totalOrders - previous.overview.totalOrders) /
              previous.overview.totalOrders) *
            100,
        },
      },
      currentPeriod: `${currentStart} to ${currentEnd}`,
      previousPeriod: `${previousStart} to ${previousEnd}`,
    };

    return comparison;
  }

  @Get('export/:format')
  @ApiOperation({
    summary: 'تصدير بيانات التحليلات',
    description: 'تصدير بيانات التحليلات بصيغ مختلفة',
  })
  @ApiParam({ name: 'format', enum: ['csv', 'json', 'xlsx'], description: 'صيغة التصدير' })
  @ApiQuery({
    name: 'type',
    required: true,
    description: 'نوع البيانات المراد تصديرها (sales, products, customers)',
  })
  @ApiQuery({ name: 'period', enum: PeriodType, required: false })
  @ApiQuery({ name: 'startDate', required: false, description: 'تاريخ البداية' })
  @ApiQuery({ name: 'endDate', required: false, description: 'تاريخ النهاية' })
  @ApiResponse({ status: 200, description: 'تم إرجاع رابط ملف التصدير' })
  async exportData(
    @Param('format') format: string,
    @Query('type') type: string,
    @Query('period') period?: PeriodType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // Use advanced analytics service export methods
    let fileUrl: string;

    switch (type.toLowerCase()) {
      case 'sales':
        fileUrl = await this.advancedAnalyticsService.exportSalesData(
          format,
          startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate || new Date().toISOString(),
        );
        break;
      case 'products':
        fileUrl = await this.advancedAnalyticsService.exportProductsData(
          format,
          startDate,
          endDate,
        );
        break;
      case 'customers':
        fileUrl = await this.advancedAnalyticsService.exportCustomersData(
          format,
          startDate,
          endDate,
        );
        break;
      default:
        // Default to sales export
        fileUrl = await this.advancedAnalyticsService.exportSalesData(
          format,
          startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate || new Date().toISOString(),
        );
    }

    return {
      fileUrl,
      format,
      type,
      generatedAt: new Date(),
      message: 'Export generated successfully',
    };
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'تحديث بيانات التحليلات',
    description: 'إجبار تحديث لقطات التحليلات وحساباتها',
  })
  @ApiResponse({ status: 200, description: 'تم تحديث بيانات التحليلات بنجاح' })
  async refreshAnalytics() {
    // Trigger analytics recalculation
    await this.analyticsService.refreshAnalytics();

    return {
      refreshedAt: new Date(),
      message: 'Analytics data refreshed successfully',
    };
  }

  @Delete('cache')
  @ApiOperation({
    summary: 'مسح ذاكرة التخزين المؤقت للتحليلات',
    description: 'مسح جميع بيانات التحليلات المخزنة مؤقتاً لإجبار قراءة البيانات الجديدة',
  })
  @ApiResponse({ status: 200, description: 'تم مسح ذاكرة التخزين المؤقت بنجاح' })
  async clearCache() {
    await this.analyticsService.clearAnalyticsCaches();
    return {
      clearedAt: new Date(),
      message: 'Analytics cache cleared successfully',
    };
  }
}
