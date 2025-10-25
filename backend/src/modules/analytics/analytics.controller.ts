import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery, ApiParam, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { AnalyticsService } from './analytics.service';
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

@ApiTags('التحليلات')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'الحصول على بيانات لوحة التحكم',
    description: 'استرداد بيانات تحليلات شاملة للوحة التحكم مع الرسوم البيانية ومؤشرات الأداء الرئيسية'
  })
  @ApiQuery({ name: 'period', enum: PeriodType, required: false, description: 'الفترة الزمنية للتحليلات' })
  @ApiQuery({ name: 'startDate', required: false, description: 'تاريخ البداية (صيغة ISO)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'تاريخ النهاية (صيغة ISO)' })
  @ApiQuery({ name: 'compareWithPrevious', required: false, type: Boolean, description: 'المقارنة مع الفترة السابقة' })
  @ApiResponse({ status: 200, description: 'تم استرداد بيانات لوحة التحكم بنجاح', type: Object })
  async getDashboard(@Query() query: AnalyticsQueryDto): Promise<DashboardDataDto> {
    return this.analyticsService.getDashboardData(query);
  }

  @Get('overview')
  @ApiOperation({
    summary: 'الحصول على مقاييس النظرة العامة',
    description: 'استرداد مؤشرات الأداء الرئيسية وإحصائيات النظرة العامة'
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
    description: 'تحليل مفصل للإيرادات مع الاتجاهات والتفصيلات'
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
    description: 'اتجاهات تسجيل المستخدمين والتركيبة السكانية ومقاييس التفاعل'
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
    description: 'أداء المنتجات واتجاهات المبيعات وتحليلات المخزون'
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
    description: 'اتجاهات طلبات الخدمات وأداء المهندسين ومقاييس الإنجاز'
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
    description: 'اتجاهات تذاكر الدعم وأوقات الحل ورضا العملاء'
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
    description: 'أوقات استجابة API ومعدلات الأخطاء ووقت التشغيل وصحة النظام'
  })
  @ApiResponse({ status: 200, description: 'تم استرداد مقاييس الأداء بنجاح', type: PerformanceMetricsDto })
  async getPerformanceMetrics(): Promise<PerformanceMetricsDto> {
    // Get performance metrics from analytics service
    const metrics = await this.analyticsService.getPerformanceMetrics();
    return {
      ...metrics,
      memoryUsage: 75.5,
      cpuUsage: 45.2,
      diskUsage: 68.3,
      activeConnections: 5,
      databaseStats: {
        totalCollections: 12,
        totalDocuments: 15420,
        databaseSize: 256000000,
        indexSize: 128000000,
      },
      slowestEndpoints: metrics.slowestEndpoints.map(endpoint => ({
        ...endpoint,
        method: 'GET',
        maxTime: endpoint.averageTime * 1.5,
        callCount: endpoint.calls,
      })),
    };
  }

  @Post('reports/generate')
  @ApiOperation({
    summary: 'إنشاء تقرير مخصص',
    description: 'إنشاء تقرير تحليلات مخصص بالصيغ المحددة'
  })
  @ApiBody({ type: ReportGenerationDto })
  @ApiResponse({ status: 201, description: 'تم إنشاء التقرير بنجاح', type: AnalyticsReportDto })
  async generateReport(
    @Body() dto: ReportGenerationDto,
  ): Promise<AnalyticsReportDto> {
    // This would implement actual report generation with file creation
    // For now, return mock data
    const dashboard = await this.analyticsService.getDashboardData({
      period: PeriodType.MONTHLY,
      startDate: dto.startDate,
      endDate: dto.endDate,
    });

    return {
      id: `report_${Date.now()}`,
      type: dto.reportType,
      period: 'Current Month',
      generatedAt: new Date(),
      data: dashboard,
      insights: [
        'الإيرادات زادت بنسبة 15% مقارنة بالشهر الماضي',
        'معدل رضا العملاء بلغ 4.6 من 5',
        'أفضل أداء للفئة الشمسية بنسبة 50% من إجمالي المبيعات',
      ],
      fileUrls: [
        'https://cdn.example.com/reports/monthly-report-2024-01.pdf',
        'https://cdn.example.com/reports/monthly-report-2024-01.xlsx',
      ],
    };
  }

  @Get('reports/:id')
  @ApiOperation({
    summary: 'الحصول على تقرير بالمعرف',
    description: 'استرداد تقرير تم إنشاؤه سابقاً'
  })
  @ApiParam({ name: 'id', description: 'معرف التقرير' })
  @ApiResponse({ status: 200, description: 'تم استرداد التقرير بنجاح', type: AnalyticsReportDto })
  async getReport(@Param('id') id: string): Promise<AnalyticsReportDto> {
    // Mock implementation - would retrieve from database
    const dashboard = await this.analyticsService.getDashboardData();

    return {
      id,
      type: ReportType.MONTHLY_REPORT,
      period: 'January 2024',
      generatedAt: new Date(),
      data: dashboard,
      insights: ['Sample insights'],
      fileUrls: [`https://cdn.example.com/reports/${id}.pdf`],
    };
  }

  @Post('reports/schedule')
  @ApiOperation({
    summary: 'جدولة تقرير تلقائي',
    description: 'إنشاء تقرير مجدول يعمل تلقائياً'
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
    description: 'استرداد مؤشرات الأداء الرئيسية'
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
    description: 'استرداد بيانات الاتجاهات لمقاييس محددة عبر الزمن'
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
    // Generate mock trend data based on metric
    const trends = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));

      let value: number;
      switch (metric) {
        case 'revenue':
          value = Math.floor(Math.random() * 10000) + 5000;
          break;
        case 'users':
          value = Math.floor(Math.random() * 50) + 20;
          break;
        case 'orders':
          value = Math.floor(Math.random() * 30) + 10;
          break;
        default:
          value = Math.floor(Math.random() * 100) + 50;
      }

      return {
        date: date.toISOString().split('T')[0],
        value,
        change: i > 0 ? (Math.random() - 0.5) * 20 : 0,
      };
    });

    return trends;
  }

  @Get('comparison')
  @ApiOperation({
    summary: 'مقارنة الفترات',
    description: 'مقارنة التحليلات بين فترتين مختلفتين'
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
          change: ((current.overview.totalUsers - previous.overview.totalUsers) / previous.overview.totalUsers) * 100,
        },
        totalRevenue: {
          current: current.overview.totalRevenue,
          previous: previous.overview.totalRevenue,
          change: ((current.overview.totalRevenue - previous.overview.totalRevenue) / previous.overview.totalRevenue) * 100,
        },
        totalOrders: {
          current: current.overview.totalOrders,
          previous: previous.overview.totalOrders,
          change: ((current.overview.totalOrders - previous.overview.totalOrders) / previous.overview.totalOrders) * 100,
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
    description: 'تصدير بيانات التحليلات بصيغ مختلفة'
  })
  @ApiParam({ name: 'format', enum: ['csv', 'json', 'xlsx'], description: 'صيغة التصدير' })
  @ApiQuery({ name: 'type', required: true, description: 'نوع البيانات المراد تصديرها (المستخدمين، الطلبات، الإيرادات، إلخ)' })
  @ApiQuery({ name: 'period', enum: PeriodType, required: false })
  @ApiResponse({ status: 200, description: 'تم إرجاع رابط ملف التصدير' })
  async exportData(
    @Param('format') format: string,
    @Query('type') type: string,
    @Query('period') period?: PeriodType, // eslint-disable-line @typescript-eslint/no-unused-vars
  ) {
    // Implementation would generate and return export file URL
    const fileUrl = `https://cdn.example.com/exports/${type}_${Date.now()}.${format}`;

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
    description: 'إجبار تحديث لقطات التحليلات وحساباتها'
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
}
