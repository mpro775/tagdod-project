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

interface ReportData {
  title?: string;
  type?: string;
  format?: string;
}

@ApiTags('التحليلات/متقدمة')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('analytics/advanced')
export class AdvancedAnalyticsController extends BaseAnalyticsController {
  constructor(private readonly advancedAnalyticsService: AdvancedAnalyticsService) {
    super();
  }

  // ==================== تحليلات المبيعات ====================
  @Get('sales')
  @ApiOperation({ summary: 'الحصول على تحليلات المبيعات' })
  @ApiQuery({ name: 'period', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'تم استرداد تحليلات المبيعات بنجاح' })
  async getSalesAnalytics(@Query() params: QueryParams) {
    return await this.advancedAnalyticsService.getSalesAnalytics(
      this.convertQueryParams(params),
    );
  }

  // ==================== أداء المنتجات ====================
  @Get('products/performance')
  @ApiOperation({ summary: 'الحصول على تحليلات أداء المنتجات' })
  @ApiQuery({ name: 'period', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'تم استرداد أداء المنتجات بنجاح' })
  async getProductPerformance(@Query() params: QueryParams) {
    return await this.advancedAnalyticsService.getProductPerformance(
      this.convertQueryParams(params),
    );
  }

  // ==================== تحليلات العملاء ====================
  @Get('customers')
  @ApiOperation({ summary: 'الحصول على تحليلات العملاء' })
  @ApiQuery({ name: 'period', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'تم استرداد تحليلات العملاء بنجاح' })
  async getCustomerAnalytics(@Query() params: QueryParams) {
    return await this.advancedAnalyticsService.getCustomerAnalytics(
      this.convertQueryParams(params),
    );
  }

  // ==================== تقرير المخزون ====================
  @Get('inventory')
  @ApiOperation({ summary: 'الحصول على تقرير المخزون' })
  @ApiQuery({ name: 'period', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'تم استرداد تقرير المخزون بنجاح' })
  async getInventoryReport(@Query() params: QueryParams) {
    return await this.advancedAnalyticsService.getInventoryReport(
      this.convertQueryParams(params),
    );
  }

  // ==================== التقرير المالي ====================
  @Get('financial')
  @ApiOperation({ summary: 'الحصول على التقرير المالي' })
  @ApiQuery({ name: 'period', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'تم استرداد التقرير المالي بنجاح' })
  async getFinancialReport(@Query() params: QueryParams) {
    return await this.advancedAnalyticsService.getFinancialReport(
      this.convertQueryParams(params),
    );
  }

  // ==================== تحليلات عربة التسوق ====================
  @Get('cart-analytics')
  @ApiOperation({ summary: 'الحصول على تحليلات عربة التسوق' })
  @ApiQuery({ name: 'period', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'تم استرداد تحليلات عربة التسوق بنجاح' })
  async getCartAnalytics(@Query() params: QueryParams) {
    return await this.advancedAnalyticsService.getCartAnalytics(
      this.convertQueryParams(params),
    );
  }

  // ==================== التقرير التسويقي ====================
  @Get('marketing')
  @ApiOperation({ summary: 'الحصول على التقرير التسويقي' })
  @ApiQuery({ name: 'period', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'تم استرداد التقرير التسويقي بنجاح' })
  async getMarketingReport(@Query() params: QueryParams) {
    return await this.advancedAnalyticsService.getMarketingReport(
      this.convertQueryParams(params),
    );
  }

  // ==================== مقاييس الوقت الفعلي ====================
  @Get('realtime')
  @ApiOperation({ summary: 'الحصول على مقاييس الوقت الفعلي' })
  @ApiResponse({ status: 200, description: 'تم استرداد مقاييس الوقت الفعلي بنجاح' })
  async getRealTimeMetrics() {
    return await this.advancedAnalyticsService.getRealTimeMetrics();
  }

  // ==================== الإحصائيات السريعة ====================
  @Get('quick-stats')
  @ApiOperation({ summary: 'الحصول على الإحصائيات السريعة' })
  @ApiResponse({ status: 200, description: 'تم استرداد الإحصائيات السريعة بنجاح' })
  async getQuickStats() {
    return await this.advancedAnalyticsService.getQuickStats();
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
    const result = await this.advancedAnalyticsService.listAdvancedReports(
      this.convertQueryParams(params),
    );
    return {
      data: result.data,
      meta: result.meta,
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
  async exportReport(@Param('reportId') reportId: string, @Body() data: ReportData) {
    return await this.advancedAnalyticsService.exportReport(reportId, data);
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
    return await this.advancedAnalyticsService.exportSalesData(format, startDate, endDate);
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
      format,
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
      format,
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
}
