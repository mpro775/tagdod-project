import { Controller, Get, Post, Query, Body, Param, UseGuards, Delete, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { AdvancedAnalyticsService } from './advanced-analytics.service';
import { BaseAnalyticsController, QueryParams } from './base-analytics.controller';
import { AnalyticsInsightsService, Insight } from './services/analytics-insights.service';

interface ReportData {
  title?: string;
  type?: string;
  format?: string;
}

function normalizeExportFormat(format: string) {
  const value = String(format || 'pdf').toLowerCase();
  return value === 'excel' ? 'xlsx' : value;
}

interface CustomReportBody {
  templateKey?: string;
  title?: string;
  titleEn?: string;
  startDate?: string;
  endDate?: string;
  sections?: string[];
  metrics?: string[];
  charts?: string[];
  filters?: Record<string, unknown>;
  compareWithPrevious?: boolean;
  includeRecommendations?: boolean;
}

interface PreviewReportBody {
  templateKey?: string;
  startDate?: string;
  endDate?: string;
  sections?: string[];
  metrics?: string[];
  filters?: Record<string, unknown>;
}

@ApiTags('التحليلات/متقدمة')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('analytics/advanced')
export class AdvancedAnalyticsController extends BaseAnalyticsController {
  constructor(
    private readonly advancedAnalyticsService: AdvancedAnalyticsService,
    private readonly insightsService: AnalyticsInsightsService,
  ) {
    super();
  }

  // ==================== تحليلات المبيعات ====================
  @Get('sales')
  @ApiOperation({ summary: 'الحصول على تحليلات المبيعات' })
  @ApiQuery({ name: 'period', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'currency', required: false, enum: ['YER', 'USD', 'SAR'] })
  @ApiResponse({ status: 200, description: 'تم استرداد تحليلات المبيعات بنجاح' })
  async getSalesAnalytics(@Query() params: QueryParams) {
    const data = await this.advancedAnalyticsService.getSalesAnalytics(
      this.convertQueryParams(params),
    );
    return { success: true, data, requestId: '' };
  }

  // ==================== أداء المنتجات ====================
  @Get('products/performance')
  @ApiOperation({ summary: 'الحصول على تحليلات أداء المنتجات' })
  @ApiQuery({ name: 'period', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'تم استرداد أداء المنتجات بنجاح' })
  async getProductPerformance(@Query() params: QueryParams) {
    const data = await this.advancedAnalyticsService.getProductPerformance(
      this.convertQueryParams(params),
    );
    return { success: true, data, requestId: '' };
  }

  // ==================== تحليلات العملاء ====================
  @Get('customers')
  @ApiOperation({ summary: 'الحصول على تحليلات العملاء' })
  @ApiQuery({ name: 'period', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'تم استرداد تحليلات العملاء بنجاح' })
  async getCustomerAnalytics(@Query() params: QueryParams) {
    const data = await this.advancedAnalyticsService.getCustomerAnalytics(
      this.convertQueryParams(params),
    );
    return { success: true, data, requestId: '' };
  }

  // ==================== تقرير المخزون ====================
  @Get('inventory')
  @ApiOperation({ summary: 'الحصول على تقرير المخزون' })
  @ApiQuery({ name: 'period', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'currency', required: false, enum: ['YER', 'USD', 'SAR'] })
  @ApiResponse({ status: 200, description: 'تم استرداد تقرير المخزون بنجاح' })
  async getInventoryReport(@Query() params: QueryParams) {
    const data = await this.advancedAnalyticsService.getInventoryReport(
      this.convertQueryParams(params),
    );
    return { success: true, data, requestId: '' };
  }

  // ==================== التقرير المالي ====================
  @Get('financial')
  @ApiOperation({ summary: 'الحصول على التقرير المالي' })
  @ApiQuery({ name: 'period', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'currency', required: false, enum: ['YER', 'USD', 'SAR'] })
  @ApiResponse({ status: 200, description: 'تم استرداد التقرير المالي بنجاح' })
  async getFinancialReport(@Query() params: QueryParams) {
    const data = await this.advancedAnalyticsService.getFinancialReport(
      this.convertQueryParams(params),
    );
    return { success: true, data, requestId: '' };
  }

  // ==================== تحليلات عربة التسوق ====================
  @Get('cart-analytics')
  @ApiOperation({ summary: 'الحصول على تحليلات عربة التسوق' })
  @ApiQuery({ name: 'period', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'تم استرداد تحليلات عربة التسوق بنجاح' })
  async getCartAnalytics(@Query() params: QueryParams) {
    const data = await this.advancedAnalyticsService.getCartAnalytics(
      this.convertQueryParams(params),
    );
    return { success: true, data, requestId: '' };
  }

  // ==================== التقرير التسويقي ====================
  @Get('marketing')
  @ApiOperation({ summary: 'الحصول على التقرير التسويقي' })
  @ApiQuery({ name: 'period', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'تم استرداد التقرير التسويقي بنجاح' })
  async getMarketingReport(@Query() params: QueryParams) {
    const data = await this.advancedAnalyticsService.getMarketingReport(
      this.convertQueryParams(params),
    );
    return { success: true, data, requestId: '' };
  }

  // ==================== مقاييس الوقت الفعلي ====================
  @Get('realtime')
  @ApiOperation({ summary: 'الحصول على مقاييس الوقت الفعلي' })
  @ApiResponse({ status: 200, description: 'تم استرداد مقاييس الوقت الفعلي بنجاح' })
  async getRealTimeMetrics() {
    const data = await this.advancedAnalyticsService.getRealTimeMetrics();
    return { success: true, data, requestId: '' };
  }

  // ==================== الإحصائيات السريعة ====================
  @Get('quick-stats')
  @ApiOperation({ summary: 'الحصول على الإحصائيات السريعة' })
  @ApiResponse({ status: 200, description: 'تم استرداد الإحصائيات السريعة بنجاح' })
  async getQuickStats() {
    const data = await this.advancedAnalyticsService.getQuickStats();
    return { success: true, data, requestId: '' };
  }

  // ==================== مركز التصدير (يجب أن يكون فوق routes الديناميكية) ====================
  @Get('exports')
  @ApiOperation({ summary: 'Get all exported files from reports (new path)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'format', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getExportedFilesNew(@Query() params: QueryParams & { status?: string }) {
    const page = parseInt(params.page || '1', 10);
    const limit = Math.min(parseInt(params.limit || '20', 10), 100);
    const converted = this.convertQueryParams(params);
    converted.page = page;
    converted.limit = limit;
    const result = await this.advancedAnalyticsService.getExportedFiles(converted);
    return { success: true, data: { data: result.data, meta: result.meta }, requestId: '' };
  }

  // @Get('reports/exports') — Legacy route, kept for backward compatibility.
  // NOTE: This must remain above any @Get('reports/:reportId') to avoid being
  // interpreted as reportId = 'exports'.
  @Get('reports/exports')
  @ApiOperation({ summary: 'Get all exported files from reports (legacy)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'format', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getExportedFilesLegacy(@Query() params: QueryParams & { status?: string }) {
    return this.getExportedFilesNew(params);
  }

  // ==================== التقارير المتقدمة ====================
  @Post('reports/generate')
  @ApiOperation({ summary: 'إنشاء تقرير متقدم' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiResponse({ status: 201, description: 'تم إنشاء التقرير بنجاح' })
  async generateAdvancedReport(
    @Body() data: ReportData,
    @Req() req: { user: { sub: string; firstName?: string; lastName?: string } }
  ) {
    return await this.advancedAnalyticsService.generateAdvancedReport({
      ...data,
      createdBy: req.user.sub,
      creatorName: [req.user.firstName, req.user.lastName].filter(Boolean).join(' ') || undefined,
    });
  }

  @Get('reports')
  @ApiOperation({ summary: 'قائمة التقارير المتقدمة' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiResponse({ status: 200, description: 'تم استرداد التقارير بنجاح' })
  async listAdvancedReports(@Query() params: QueryParams) {
    const page = parseInt(params.page || '1', 10);
    const limit = Math.min(parseInt(params.limit || '20', 10), 100);
    const converted = this.convertQueryParams(params);
    converted.page = page;
    converted.limit = limit;
    const result = await this.advancedAnalyticsService.listAdvancedReports(converted);
    return {
      success: true,
      data: {
        data: result.data.map((report: any) => ({
          ...report,
          id: report.reportId ?? report._id?.toString() ?? report.id,
          reportId: report.reportId ?? report._id?.toString() ?? report.id,
        })),
        meta: result.meta,
      },
      requestId: '',
    };
  }

  @Get('reports/:reportId')
  @ApiOperation({ summary: 'الحصول على التقرير المتقدم بالمعرف' })
  @ApiParam({ name: 'reportId', description: 'معرف التقرير' })
  @ApiResponse({ status: 200, description: 'تم استرداد التقرير بنجاح' })
  async getAdvancedReport(@Param('reportId') reportId: string) {
    return await this.advancedAnalyticsService.getAdvancedReport(reportId);
  }

  @Post('reports/:reportId/archive')
  @ApiOperation({ summary: 'أرشفة التقرير' })
  @ApiParam({ name: 'reportId', description: 'معرف التقرير' })
  @ApiResponse({ status: 200, description: 'تم أرشفة التقرير بنجاح' })
  async archiveReport(@Param('reportId') reportId: string) {
    return await this.advancedAnalyticsService.archiveReport(reportId);
  }

  @Delete('reports/:reportId')
  @ApiOperation({ summary: 'حذف التقرير' })
  @ApiParam({ name: 'reportId', description: 'معرف التقرير' })
  @ApiResponse({ status: 200, description: 'تم حذف التقرير بنجاح' })
  async deleteReport(@Param('reportId') reportId: string) {
    await this.advancedAnalyticsService.deleteReport(reportId);
    return { message: 'Report deleted successfully' };
  }

  @Post('reports/:reportId/export')
  @ApiOperation({ summary: 'تصدير التقرير' })
  @ApiParam({ name: 'reportId', description: 'معرف التقرير' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiResponse({ status: 200, description: 'تم تصدير التقرير بنجاح' })
  async exportReport(
    @Param('reportId') reportId: string,
    @Body() data: ReportData & { currency?: string },
    @Req() req: { user: { sub: string } },
  ) {
    const payload = {
      ...data,
      format: normalizeExportFormat(data?.format || 'pdf'),
      currency: (data.currency || 'YER') as 'YER' | 'USD' | 'SAR',
    };
    return await this.advancedAnalyticsService.exportReport(reportId, payload, req.user.sub);
  }

  // ==================== تصدير البيانات ====================
  @Get('export/sales')
  @ApiOperation({ summary: 'تصدير بيانات المبيعات' })
  @ApiQuery({ name: 'format', required: true })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiResponse({ status: 200, description: 'تم تصدير بيانات المبيعات بنجاح' })
  async exportSalesData(
    @Query('format') format: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return await this.advancedAnalyticsService.exportSalesData(
      normalizeExportFormat(format),
      startDate,
      endDate,
    );
  }

  @Get('export/products')
  @ApiOperation({ summary: 'تصدير بيانات المنتجات' })
  @ApiQuery({ name: 'format', required: true })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'تم تصدير بيانات المنتجات بنجاح' })
  async exportProductsData(
    @Query('format') format: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.advancedAnalyticsService.exportProductsData(
      normalizeExportFormat(format),
      startDate,
      endDate,
    );
  }

  @Get('export/customers')
  @ApiOperation({ summary: 'تصدير بيانات العملاء' })
  @ApiQuery({ name: 'format', required: true })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'تم تصدير بيانات العملاء بنجاح' })
  async exportCustomersData(
    @Query('format') format: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.advancedAnalyticsService.exportCustomersData(
      normalizeExportFormat(format),
      startDate,
      endDate,
    );
  }

  @Get('export/inventory')
  @ApiOperation({ summary: 'تصدير بيانات المخزون' })
  @ApiQuery({ name: 'format', required: true })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'تم تصدير بيانات المخزون بنجاح' })
  async exportInventoryData(
    @Query('format') format: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.advancedAnalyticsService.exportInventoryData(
      normalizeExportFormat(format),
      startDate,
      endDate,
    );
  }

  @Get('export/financial')
  @ApiOperation({ summary: 'تصدير البيانات المالية' })
  @ApiQuery({ name: 'format', required: true })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'تم تصدير البيانات المالية بنجاح' })
  async exportFinancialData(
    @Query('format') format: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.advancedAnalyticsService.exportFinancialData(
      normalizeExportFormat(format),
      startDate,
      endDate,
    );
  }

  @Get('export/marketing')
  @ApiOperation({ summary: 'تصدير بيانات التسويق' })
  @ApiQuery({ name: 'format', required: true })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'تم تصدير بيانات التسويق بنجاح' })
  async exportMarketingData(
    @Query('format') format: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.advancedAnalyticsService.exportMarketingData(
      normalizeExportFormat(format),
      startDate,
      endDate,
    );
  }

  // ==================== المقارنة والإتجاهات ====================
  @Get('comparison')
  @ApiOperation({ summary: 'مقارنة الفترات (متقدمة)' })
  @ApiQuery({ name: 'currentStart', required: true })
  @ApiQuery({ name: 'currentEnd', required: true })
  @ApiQuery({ name: 'previousStart', required: true })
  @ApiQuery({ name: 'previousEnd', required: true })
  @ApiResponse({ status: 200, description: 'تم استرداد مقارنة الفترات بنجاح' })
  async comparePeriodsAdvanced(
    @Query('currentStart') currentStart: string,
    @Query('currentEnd') currentEnd: string,
    @Query('previousStart') previousStart: string,
    @Query('previousEnd') previousEnd: string,
  ) {
    return await this.advancedAnalyticsService.comparePeriodsAdvanced(
      currentStart,
      currentEnd,
      previousStart,
      previousEnd,
    );
  }

  @Get('trends/:metric')
  @ApiOperation({ summary: 'الحصول على اتجاهات المقياس (متقدمة)' })
  @ApiParam({ name: 'metric', description: 'اسم المقياس' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiQuery({ name: 'groupBy', required: false })
  @ApiResponse({ status: 200, description: 'تم استرداد اتجاهات المقياس بنجاح' })
  async getMetricTrendsAdvanced(
    @Param('metric') metric: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('groupBy') groupBy?: string,
  ) {
    return await this.advancedAnalyticsService.getMetricTrendsAdvanced(
      metric,
      startDate,
      endDate,
      groupBy,
    );
  }

  // ==================== Report Builder ====================
  @Get('reports/exports')
  @ApiOperation({ summary: 'Get all exported files from reports' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'format', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getExportedFiles(@Query() params: QueryParams & { status?: string }) {
    const page = parseInt(params.page || '1', 10);
    const limit = Math.min(parseInt(params.limit || '20', 10), 100);
    const converted = this.convertQueryParams(params);
    converted.page = page;
    converted.limit = limit;
    const result = await this.advancedAnalyticsService.getExportedFiles(converted);
    return { success: true, data: { data: result.data, meta: result.meta }, requestId: '' };
  }

  @Post('reports/custom/preview')
  @ApiOperation({ summary: 'Preview a custom report without saving' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiResponse({ status: 200, description: 'Custom report preview generated' })
  async previewCustomReport(@Body() data: PreviewReportBody) {
    return await this.advancedAnalyticsService.previewCustomReport(data);
  }

  @Post('reports/custom/generate')
  @ApiOperation({ summary: 'Generate and save a custom report' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiResponse({ status: 201, description: 'Custom report generated and saved' })
  async generateCustomReport(
    @Body() data: CustomReportBody,
    @Req() req: { user: { sub: string; firstName?: string; lastName?: string } }
  ) {
    return await this.advancedAnalyticsService.generateCustomReport({
      ...data,
      createdBy: req.user.sub,
      creatorName: [req.user.firstName, req.user.lastName].filter(Boolean).join(' ') || undefined,
    });
  }

  // ==================== Insights ====================
  @Get('insights')
  @ApiOperation({ summary: 'Get smart analytics insights' })
  @ApiQuery({ name: 'days', required: false })
  @ApiResponse({ status: 200, description: 'Insights generated successfully' })
  async getInsights(@Query('days') days?: string): Promise<{ success: boolean; data: Insight[]; count: number }> {
    const insights = await this.insightsService.generateInsights(days ? parseInt(days, 10) : 30);
    return { success: true, data: insights, count: insights.length };
  }
}
