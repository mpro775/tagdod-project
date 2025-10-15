import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Param,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { AdvancedReportsService } from './services/advanced-reports.service';
import {
  GenerateAdvancedReportDto,
  SalesReportQueryDto,
  ProductPerformanceQueryDto,
  CustomerAnalyticsQueryDto,
  InventoryReportQueryDto,
  FinancialReportQueryDto,
  CartAnalyticsQueryDto,
  MarketingReportQueryDto,
  RealTimeMetricsDto,
  ExportReportDto,
} from './dto/advanced-analytics.dto';
import { ReportCategory } from './schemas/advanced-report.schema';

@ApiTags('Advanced Analytics & Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('analytics/advanced')
export class AdvancedAnalyticsController {
  constructor(private readonly reportsService: AdvancedReportsService) {}

  // ========== Advanced Reports ==========

  @Post('reports/generate')
  @ApiOperation({
    summary: 'إنشاء تقرير متقدم شامل',
    description: 'إنشاء تقرير تحليلي متقدم مع إحصائيات مفصلة وتوصيات',
  })
  @ApiBody({ type: GenerateAdvancedReportDto })
  @ApiResponse({
    status: 201,
    description: 'تم إنشاء التقرير بنجاح',
  })
  async generateReport(@Body() dto: GenerateAdvancedReportDto, @Request() req: ExpressRequest) {
    const userId = req.user!.userId;
    const report = await this.reportsService.generateAdvancedReport(dto, userId);
    return {
      success: true,
      message: 'تم إنشاء التقرير بنجاح',
      data: report,
    };
  }

  @Get('reports')
  @ApiOperation({
    summary: 'قائمة التقارير المتقدمة',
    description: 'الحصول على قائمة جميع التقارير مع إمكانية الفلترة والترقيم',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'category', required: false, enum: ReportCategory })
  @ApiResponse({ status: 200, description: 'تم استرجاع القائمة بنجاح' })
  async listReports(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('category') category?: ReportCategory,
    @Request() req?: ExpressRequest,
  ) {
    const result = await this.reportsService.listReports(
      Number(page),
      Number(limit),
      category,
      req?.user?.userId,
    );

    return {
      success: true,
      data: result.reports,
      meta: {
        page: result.page,
        limit: Number(limit),
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }

  @Get('reports/:reportId')
  @ApiOperation({
    summary: 'الحصول على تقرير محدد',
    description: 'استرجاع تفاصيل تقرير محدد بواسطة معرفه',
  })
  @ApiParam({ name: 'reportId', description: 'معرف التقرير', example: 'REP-2024-00001' })
  @ApiResponse({ status: 200, description: 'تم استرجاع التقرير بنجاح' })
  async getReport(@Param('reportId') reportId: string) {
    const report = await this.reportsService.getReportById(reportId);
    return {
      success: true,
      data: report,
    };
  }

  @Post('reports/:reportId/archive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'أرشفة تقرير',
    description: 'نقل التقرير إلى الأرشيف',
  })
  @ApiParam({ name: 'reportId', description: 'معرف التقرير' })
  @ApiResponse({ status: 200, description: 'تم أرشفة التقرير بنجاح' })
  async archiveReport(@Param('reportId') reportId: string) {
    const report = await this.reportsService.archiveReport(reportId);
    return {
      success: true,
      message: 'تم أرشفة التقرير بنجاح',
      data: report,
    };
  }

  @Delete('reports/:reportId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'حذف تقرير',
    description: 'حذف تقرير نهائياً من النظام',
  })
  @ApiParam({ name: 'reportId', description: 'معرف التقرير' })
  @ApiResponse({ status: 200, description: 'تم حذف التقرير بنجاح' })
  async deleteReport(@Param('reportId') reportId: string) {
    await this.reportsService.deleteReport(reportId);
    return {
      success: true,
      message: 'تم حذف التقرير بنجاح',
    };
  }

  @Post('reports/:reportId/export')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'تصدير تقرير',
    description: 'تصدير التقرير بصيغة محددة (PDF, Excel, CSV)',
  })
  @ApiParam({ name: 'reportId', description: 'معرف التقرير' })
  @ApiBody({ type: ExportReportDto })
  @ApiResponse({ status: 200, description: 'تم تصدير التقرير بنجاح' })
  async exportReport(@Param('reportId') reportId: string, @Body() dto: ExportReportDto) {
    // TODO: Implement actual file generation
    const report = await this.reportsService.getReportById(reportId);

    const fileUrl = `https://cdn.example.com/reports/${reportId}.${dto.format}`;

    return {
      success: true,
      message: 'تم تصدير التقرير بنجاح',
      data: {
        reportId: report.reportId,
        format: dto.format,
        fileUrl,
        generatedAt: new Date(),
      },
    };
  }

  // ========== Specialized Analytics Endpoints ==========

  @Get('sales')
  @ApiOperation({
    summary: 'تحليلات المبيعات التفصيلية',
    description: 'الحصول على تحليلات شاملة للمبيعات والإيرادات',
  })
  @ApiResponse({ status: 200, description: 'تم استرجاع تحليلات المبيعات بنجاح' })
  async getSalesAnalytics(
    @Query() query: SalesReportQueryDto,
  ): Promise<{ success: boolean; data: any; query: SalesReportQueryDto }> {
    const analytics = await this.reportsService.generateSalesAnalytics(query);
    return {
      success: true,
      data: analytics,
      query,
    };
  }

  @Get('products/performance')
  @ApiOperation({
    summary: 'تحليل أداء المنتجات',
    description: 'تحليل مفصل لأداء المنتجات والمبيعات والتقييمات',
  })
  @ApiResponse({ status: 200, description: 'تم استرجاع تحليل الأداء بنجاح' })
  async getProductPerformance(
    @Query() query: ProductPerformanceQueryDto,
  ): Promise<{ success: boolean; data: any; query: ProductPerformanceQueryDto }> {
    const analytics = await this.reportsService.generateProductAnalytics(query);
    return {
      success: true,
      data: analytics,
      query,
    };
  }

  @Get('customers')
  @ApiOperation({
    summary: 'تحليلات العملاء',
    description: 'تحليل شامل للعملاء والسلوك الشرائي والقطاعات',
  })
  @ApiResponse({ status: 200, description: 'تم استرجاع تحليلات العملاء بنجاح' })
  async getCustomerAnalytics(
    @Query() query: CustomerAnalyticsQueryDto,
  ): Promise<{ success: boolean; data: any; query: CustomerAnalyticsQueryDto }> {
    const analytics = await this.reportsService.generateCustomerAnalytics(query);
    return {
      success: true,
      data: analytics,
      query,
    };
  }

  @Get('inventory')
  @ApiOperation({
    summary: 'تقرير المخزون',
    description: 'تقرير شامل عن حالة المخزون والمنتجات',
  })
  @ApiResponse({ status: 200, description: 'تم استرجاع تقرير المخزون بنجاح' })
  async getInventoryReport(
    @Query() query: InventoryReportQueryDto,
  ): Promise<{ success: boolean; data: any; query: InventoryReportQueryDto }> {
    const analytics = await this.reportsService.generateInventoryAnalytics(query);
    return {
      success: true,
      data: analytics,
      query,
    };
  }

  @Get('financial')
  @ApiOperation({
    summary: 'التقرير المالي',
    description: 'تقرير مالي شامل مع الإيرادات والأرباح والتدفقات النقدية',
  })
  @ApiResponse({ status: 200, description: 'تم استرجاع التقرير المالي بنجاح' })
  async getFinancialReport(
    @Query() query: FinancialReportQueryDto,
  ): Promise<{ success: boolean; data: any; query: FinancialReportQueryDto }> {
    const analytics = await this.reportsService.generateFinancialAnalytics(query);
    return {
      success: true,
      data: analytics,
      query,
    };
  }

  @Get('cart-analytics')
  @ApiOperation({
    summary: 'تحليلات السلة',
    description: 'تحليل السلل المهجورة ومعدل التحويل',
  })
  @ApiResponse({ status: 200, description: 'تم استرجاع تحليلات السلة بنجاح' })
  async getCartAnalytics(
    @Query() query: CartAnalyticsQueryDto,
  ): Promise<{ success: boolean; data: any; query: CartAnalyticsQueryDto }> {
    const analytics = await this.reportsService.generateCartAnalytics(query);
    return {
      success: true,
      data: analytics,
      query,
    };
  }

  @Get('marketing')
  @ApiOperation({
    summary: 'تحليلات التسويق',
    description: 'تحليل الحملات التسويقية والكوبونات و ROI',
  })
  @ApiResponse({ status: 200, description: 'تم استرجاع تحليلات التسويق بنجاح' })
  async getMarketingAnalytics(
    @Query() query: MarketingReportQueryDto,
  ): Promise<{ success: boolean; data: any; query: MarketingReportQueryDto }> {
    const analytics = await this.reportsService.generateMarketingAnalytics(query);
    return {
      success: true,
      data: analytics,
      query,
    };
  }

  // ========== Real-Time Metrics ==========

  @Get('realtime')
  @ApiOperation({
    summary: 'المقاييس الفورية',
    description: 'الحصول على مقاييس فورية للأداء الحالي',
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرجاع المقاييس الفورية بنجاح',
    type: RealTimeMetricsDto,
  })
  async getRealTimeMetrics(): Promise<{ success: boolean; data: RealTimeMetricsDto }> {
    const metrics = await this.reportsService.getRealTimeMetrics();
    return {
      success: true,
      data: metrics,
    };
  }

  // ========== Quick Statistics ==========

  @Get('quick-stats')
  @ApiOperation({
    summary: 'إحصائيات سريعة',
    description: 'الحصول على إحصائيات سريعة للوحة التحكم',
  })
  @ApiResponse({ status: 200, description: 'تم استرجاع الإحصائيات السريعة بنجاح' })
  async getQuickStats() {
    const metrics = await this.reportsService.getRealTimeMetrics();
    return {
      success: true,
      data: {
        todaySales: metrics.todaySales,
        monthSales: metrics.monthSales,
        todayOrders: metrics.todayOrders,
        todayNewCustomers: metrics.todayNewCustomers,
        activeOrders: metrics.activeOrders,
        todayAbandonedCarts: metrics.todayAbandonedCarts,
        systemHealth: metrics.systemHealth,
        lastUpdated: metrics.lastUpdated,
      },
    };
  }

  // ========== Comparison & Trends ==========

  @Get('comparison')
  @ApiOperation({
    summary: 'مقارنة الفترات',
    description: 'مقارنة الأداء بين فترتين زمنيتين',
  })
  @ApiQuery({ name: 'currentStart', required: true, description: 'بداية الفترة الحالية' })
  @ApiQuery({ name: 'currentEnd', required: true, description: 'نهاية الفترة الحالية' })
  @ApiQuery({ name: 'previousStart', required: true, description: 'بداية الفترة السابقة' })
  @ApiQuery({ name: 'previousEnd', required: true, description: 'نهاية الفترة السابقة' })
  @ApiResponse({ status: 200, description: 'تم استرجاع المقارنة بنجاح' })
  async comparePeriods(
    @Query('currentStart') currentStart: string,
    @Query('currentEnd') currentEnd: string,
    @Query('previousStart') previousStart: string,
    @Query('previousEnd') previousEnd: string,
  ) {
    const [currentAnalytics, previousAnalytics] = await Promise.all([
      this.reportsService.generateSalesAnalytics({
        startDate: currentStart,
        endDate: currentEnd,
      }),
      this.reportsService.generateSalesAnalytics({
        startDate: previousStart,
        endDate: previousEnd,
      }),
    ]);

    const comparison = {
      revenue: {
        current: currentAnalytics.totalRevenue,
        previous: previousAnalytics.totalRevenue,
        change: currentAnalytics.totalRevenue - previousAnalytics.totalRevenue,
        percentageChange:
          previousAnalytics.totalRevenue > 0
            ? ((currentAnalytics.totalRevenue - previousAnalytics.totalRevenue) /
                previousAnalytics.totalRevenue) *
              100
            : 0,
      },
      orders: {
        current: currentAnalytics.totalOrders,
        previous: previousAnalytics.totalOrders,
        change: currentAnalytics.totalOrders - previousAnalytics.totalOrders,
        percentageChange:
          previousAnalytics.totalOrders > 0
            ? ((currentAnalytics.totalOrders - previousAnalytics.totalOrders) /
                previousAnalytics.totalOrders) *
              100
            : 0,
      },
      averageOrderValue: {
        current: currentAnalytics.averageOrderValue,
        previous: previousAnalytics.averageOrderValue,
        change: currentAnalytics.averageOrderValue - previousAnalytics.averageOrderValue,
        percentageChange:
          previousAnalytics.averageOrderValue > 0
            ? ((currentAnalytics.averageOrderValue - previousAnalytics.averageOrderValue) /
                previousAnalytics.averageOrderValue) *
              100
            : 0,
      },
    };

    return {
      success: true,
      data: comparison,
      periods: {
        current: { start: currentStart, end: currentEnd },
        previous: { start: previousStart, end: previousEnd },
      },
    };
  }

  @Get('trends/:metric')
  @ApiOperation({
    summary: 'اتجاهات المقاييس',
    description: 'الحصول على اتجاهات مقياس محدد عبر الزمن',
  })
  @ApiParam({
    name: 'metric',
    description: 'اسم المقياس',
    enum: ['revenue', 'orders', 'customers', 'products'],
  })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiQuery({ name: 'groupBy', required: false, enum: ['daily', 'weekly', 'monthly'] })
  @ApiResponse({ status: 200, description: 'تم استرجاع الاتجاهات بنجاح' })
  async getMetricTrends(
    @Param('metric') metric: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('groupBy') groupBy = 'daily',
  ) {
    type SalesByDate = { date: string; sales: number; orders: number; revenue: number };
    const analytics = await this.reportsService.generateSalesAnalytics({
      startDate,
      endDate,
      groupBy: groupBy as 'daily' | 'weekly' | 'monthly',
    });

    let trendData: Array<{ date: string; value: number; label: string }> = [];

    switch (metric) {
      case 'revenue':
        trendData = analytics.salesByDate.map((item: SalesByDate) => ({
          date: item.date,
          value: item.revenue,
          label: 'الإيرادات',
        }));
        break;
      case 'orders':
        trendData = analytics.salesByDate.map((item: SalesByDate) => ({
          date: item.date,
          value: item.orders,
          label: 'الطلبات',
        }));
        break;
      default:
        trendData = [];
    }

    return {
      success: true,
      data: {
        metric,
        groupBy,
        trends: trendData,
      },
      query: { startDate, endDate, groupBy },
    };
  }

  // ========== Data Export ==========

  @Get('export/sales')
  @ApiOperation({
    summary: 'تصدير بيانات المبيعات',
    description: 'تصدير بيانات المبيعات بصيغة محددة',
  })
  @ApiQuery({ name: 'format', required: true, enum: ['csv', 'excel', 'json'] })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiResponse({ status: 200, description: 'تم إنشاء ملف التصدير بنجاح' })
  async exportSalesData(
    @Query('format') format: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const analytics = await this.reportsService.generateSalesAnalytics({
      startDate,
      endDate,
    });

    // TODO: Implement actual file generation
    const fileUrl = `https://cdn.example.com/exports/sales_${Date.now()}.${format}`;

    return {
      success: true,
      message: 'تم إنشاء ملف التصدير بنجاح',
      data: {
        format,
        fileUrl,
        generatedAt: new Date(),
        recordCount: analytics.totalOrders,
      },
    };
  }

  @Get('export/products')
  @ApiOperation({
    summary: 'تصدير بيانات المنتجات',
    description: 'تصدير بيانات أداء المنتجات',
  })
  @ApiQuery({ name: 'format', required: true, enum: ['csv', 'excel', 'json'] })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'تم إنشاء ملف التصدير بنجاح' })
  async exportProductsData(
    @Query('format') format: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const analytics = await this.reportsService.generateProductAnalytics({
      startDate,
      endDate,
    });

    // TODO: Implement actual file generation
    const fileUrl = `https://cdn.example.com/exports/products_${Date.now()}.${format}`;

    return {
      success: true,
      message: 'تم إنشاء ملف التصدير بنجاح',
      data: {
        format,
        fileUrl,
        generatedAt: new Date(),
        recordCount: analytics.totalProducts,
      },
    };
  }

  @Get('export/customers')
  @ApiOperation({
    summary: 'تصدير بيانات العملاء',
    description: 'تصدير بيانات العملاء والتحليلات',
  })
  @ApiQuery({ name: 'format', required: true, enum: ['csv', 'excel', 'json'] })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'تم إنشاء ملف التصدير بنجاح' })
  async exportCustomersData(
    @Query('format') format: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const analytics = await this.reportsService.generateCustomerAnalytics({
      startDate,
      endDate,
    });

    // TODO: Implement actual file generation
    const fileUrl = `https://cdn.example.com/exports/customers_${Date.now()}.${format}`;


    
    return {
      success: true,
      message: 'تم إنشاء ملف التصدير بنجاح',
      data: {
        format,
        fileUrl,
        generatedAt: new Date(),
        recordCount: analytics.totalCustomers,
      },
    };
  }
}
