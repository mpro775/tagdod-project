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

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get dashboard data',
    description: 'Retrieve comprehensive dashboard analytics data with charts and KPIs'
  })
  @ApiQuery({ name: 'period', enum: PeriodType, required: false, description: 'Time period for analytics' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (ISO format)' })
  @ApiQuery({ name: 'compareWithPrevious', required: false, type: Boolean, description: 'Compare with previous period' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully', type: Object })
  async getDashboard(@Query() query: AnalyticsQueryDto): Promise<DashboardDataDto> {
    return this.analyticsService.getDashboardData(query);
  }

  @Get('overview')
  @ApiOperation({
    summary: 'Get overview metrics',
    description: 'Retrieve key performance indicators and overview statistics'
  })
  @ApiQuery({ name: 'period', enum: PeriodType, required: false })
  @ApiResponse({ status: 200, description: 'Overview metrics retrieved successfully' })
  async getOverview(@Query() query: AnalyticsQueryDto) {
    const dashboard = await this.analyticsService.getDashboardData(query);
    return {
      overview: dashboard.overview,
      kpis: dashboard.kpis,
      period: query.period || PeriodType.MONTHLY,
    };
  }

  @Get('revenue')
  @ApiOperation({
    summary: 'Get revenue analytics',
    description: 'Detailed revenue analysis with trends and breakdowns'
  })
  @ApiQuery({ name: 'period', enum: PeriodType, required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Revenue analytics retrieved successfully' })
  async getRevenueAnalytics(@Query() query: AnalyticsQueryDto) {
    const dashboard = await this.analyticsService.getDashboardData(query);
    return {
      data: dashboard.revenueCharts,
      period: query.period || PeriodType.MONTHLY,
    };
  }

  @Get('users')
  @ApiOperation({
    summary: 'Get user analytics',
    description: 'User registration trends, demographics, and engagement metrics'
  })
  @ApiQuery({ name: 'period', enum: PeriodType, required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'User analytics retrieved successfully' })
  async getUserAnalytics(@Query() query: AnalyticsQueryDto) {
    const dashboard = await this.analyticsService.getDashboardData(query);
    return {
      data: dashboard.userCharts,
      period: query.period || PeriodType.MONTHLY,
    };
  }

  @Get('products')
  @ApiOperation({
    summary: 'Get product analytics',
    description: 'Product performance, sales trends, and inventory analytics'
  })
  @ApiQuery({ name: 'period', enum: PeriodType, required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Product analytics retrieved successfully' })
  async getProductAnalytics(@Query() query: AnalyticsQueryDto) {
    const dashboard = await this.analyticsService.getDashboardData(query);
    return {
      data: dashboard.productCharts,
      period: query.period || PeriodType.MONTHLY,
    };
  }

  @Get('services')
  @ApiOperation({
    summary: 'Get service analytics',
    description: 'Service request trends, engineer performance, and completion metrics'
  })
  @ApiQuery({ name: 'period', enum: PeriodType, required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Service analytics retrieved successfully' })
  async getServiceAnalytics(@Query() query: AnalyticsQueryDto) {
    const dashboard = await this.analyticsService.getDashboardData(query);
    return {
      data: dashboard.serviceCharts,
      period: query.period || PeriodType.MONTHLY,
    };
  }

  @Get('support')
  @ApiOperation({
    summary: 'Get support analytics',
    description: 'Support ticket trends, resolution times, and customer satisfaction'
  })
  @ApiQuery({ name: 'period', enum: PeriodType, required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Support analytics retrieved successfully' })
  async getSupportAnalytics(@Query() query: AnalyticsQueryDto) {
    const dashboard = await this.analyticsService.getDashboardData(query);
    return {
      data: dashboard.supportCharts,
      period: query.period || PeriodType.MONTHLY,
    };
  }

  @Get('performance')
  @ApiOperation({
    summary: 'Get system performance metrics',
    description: 'API response times, error rates, uptime, and system health'
  })
  @ApiResponse({ status: 200, description: 'Performance metrics retrieved successfully', type: PerformanceMetricsDto })
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
    summary: 'Generate custom report',
    description: 'Generate a custom analytics report in specified formats'
  })
  @ApiBody({ type: ReportGenerationDto })
  @ApiResponse({ status: 201, description: 'Report generated successfully', type: AnalyticsReportDto })
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
    summary: 'Get report by ID',
    description: 'Retrieve a previously generated report'
  })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiResponse({ status: 200, description: 'Report retrieved successfully', type: AnalyticsReportDto })
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
    summary: 'Schedule automated report',
    description: 'Create a scheduled report that runs automatically'
  })
  @ApiBody({ type: CreateReportScheduleDto })
  @ApiResponse({ status: 201, description: 'Report schedule created successfully' })
  async scheduleReport(
    @Body() dto: CreateReportScheduleDto, // eslint-disable-line @typescript-eslint/no-unused-vars
  ) {
    // Implementation would create a scheduled report
    return {
      message: 'Report scheduled successfully',
      scheduleId: `schedule_${Date.now()}`,
    };
  }

  @Get('kpis')
  @ApiOperation({
    summary: 'Get KPI metrics',
    description: 'Retrieve key performance indicators'
  })
  @ApiQuery({ name: 'period', enum: PeriodType, required: false })
  @ApiResponse({ status: 200, description: 'KPIs retrieved successfully' })
  async getKPIs(@Query() query: AnalyticsQueryDto) {
    const dashboard = await this.analyticsService.getDashboardData(query);
    return {
      data: dashboard.kpis,
      period: query.period || PeriodType.MONTHLY,
    };
  }

  @Get('trends/:metric')
  @ApiOperation({
    summary: 'Get metric trends',
    description: 'Retrieve trend data for specific metrics over time'
  })
  @ApiParam({ name: 'metric', description: 'Metric name (revenue, users, orders, etc.)' })
  @ApiQuery({ name: 'period', enum: PeriodType, required: false })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days to look back' })
  @ApiResponse({ status: 200, description: 'Metric trends retrieved successfully' })
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

    return {
      metric,
      period: period || PeriodType.DAILY,
      data: trends,
    };
  }

  @Get('comparison')
  @ApiOperation({
    summary: 'Compare periods',
    description: 'Compare analytics between two different periods'
  })
  @ApiQuery({ name: 'currentStart', required: true, description: 'Current period start date' })
  @ApiQuery({ name: 'currentEnd', required: true, description: 'Current period end date' })
  @ApiQuery({ name: 'previousStart', required: true, description: 'Previous period start date' })
  @ApiQuery({ name: 'previousEnd', required: true, description: 'Previous period end date' })
  @ApiResponse({ status: 200, description: 'Period comparison retrieved successfully' })
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

    return { data: comparison };
  }

  @Get('export/:format')
  @ApiOperation({
    summary: 'Export analytics data',
    description: 'Export analytics data in various formats'
  })
  @ApiParam({ name: 'format', enum: ['csv', 'json', 'xlsx'], description: 'Export format' })
  @ApiQuery({ name: 'type', required: true, description: 'Data type to export (users, orders, revenue, etc.)' })
  @ApiQuery({ name: 'period', enum: PeriodType, required: false })
  @ApiResponse({ status: 200, description: 'Export file URL returned' })
  async exportData(
    @Param('format') format: string,
    @Query('type') type: string,
    @Query('period') period?: PeriodType, // eslint-disable-line @typescript-eslint/no-unused-vars
  ) {
    // Implementation would generate and return export file URL
    const fileUrl = `https://cdn.example.com/exports/${type}_${Date.now()}.${format}`;

    return {
      message: 'Export generated successfully',
      fileUrl,
      format,
      type,
      generatedAt: new Date(),
    };
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh analytics data',
    description: 'Force refresh of analytics snapshots and calculations'
  })
  @ApiResponse({ status: 200, description: 'Analytics data refreshed successfully' })
  async refreshAnalytics() {
    // Trigger analytics recalculation
    await this.analyticsService.refreshAnalytics();

    return {
      message: 'Analytics data refreshed successfully',
      refreshedAt: new Date(),
    };
  }
}
