  import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery, ApiParam, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { AdvancedAnalyticsService } from './advanced-analytics.service';
import { BaseAnalyticsController, QueryParams } from './base-analytics.controller';

interface ReportData {
  title?: string;
  type?: string;
  format?: string;
}

@ApiTags('analytics/advanced')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('analytics/advanced')
export class AdvancedAnalyticsController extends BaseAnalyticsController {
  constructor(private readonly advancedAnalyticsService: AdvancedAnalyticsService) {
    super();
  }

  // ==================== Sales Analytics ====================
  @Get('sales')
  @ApiOperation({ summary: 'Get sales analytics' })
  @ApiQuery({ name: 'period', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Sales analytics retrieved successfully' })
  async getSalesAnalytics(@Query() params: QueryParams) {
    try {
      const data = await this.advancedAnalyticsService.getSalesAnalytics(this.convertQueryParams(params));
      return this.formatSuccessResponse(data);
    } catch (error) {
      return this.handleError(error as Error, 'getSalesAnalytics');
    }
  }

  // ==================== Product Performance ====================
  @Get('products/performance')
  @ApiOperation({ summary: 'Get product performance analytics' })
  @ApiQuery({ name: 'period', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Product performance retrieved successfully' })
  async getProductPerformance(@Query() params: QueryParams) {
    try {
      const data = await this.advancedAnalyticsService.getProductPerformance(this.convertQueryParams(params));
      return this.formatSuccessResponse(data);
    } catch (error) {
      return this.handleError(error as Error, 'getProductPerformance');
    }
  }

  // ==================== Customer Analytics ====================
  @Get('customers')
  @ApiOperation({ summary: 'Get customer analytics' })
  @ApiQuery({ name: 'period', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Customer analytics retrieved successfully' })
  async getCustomerAnalytics(@Query() params: QueryParams) {
    try {
      const data = await this.advancedAnalyticsService.getCustomerAnalytics(this.convertQueryParams(params));
      return this.formatSuccessResponse(data);
    } catch (error) {
      return this.handleError(error as Error, 'getCustomerAnalytics');
    }
  }

  // ==================== Inventory Report ====================
  @Get('inventory')
  @ApiOperation({ summary: 'Get inventory report' })
  @ApiQuery({ name: 'period', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Inventory report retrieved successfully' })
  async getInventoryReport(@Query() params: QueryParams) {
    try {
      const data = await this.advancedAnalyticsService.getInventoryReport(this.convertQueryParams(params));
      return this.formatSuccessResponse(data);
    } catch (error) {
      return this.handleError(error as Error, 'getInventoryReport');
    }
  }

  // ==================== Financial Report ====================
  @Get('financial')
  @ApiOperation({ summary: 'Get financial report' })
  @ApiQuery({ name: 'period', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Financial report retrieved successfully' })
  async getFinancialReport(@Query() params: QueryParams) {
    try {
      const data = await this.advancedAnalyticsService.getFinancialReport(this.convertQueryParams(params));
      return this.formatSuccessResponse(data);
    } catch (error) {
      return this.handleError(error as Error, 'getFinancialReport');
    }
  }

  // ==================== Cart Analytics ====================
  @Get('cart-analytics')
  @ApiOperation({ summary: 'Get cart analytics' })
  @ApiQuery({ name: 'period', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Cart analytics retrieved successfully' })
  async getCartAnalytics(@Query() params: QueryParams) {
    try {
      const data = await this.advancedAnalyticsService.getCartAnalytics(this.convertQueryParams(params));
      return this.formatSuccessResponse(data);
    } catch (error) {
      return this.handleError(error as Error, 'getCartAnalytics');
    }
  }

  // ==================== Marketing Report ====================
  @Get('marketing')
  @ApiOperation({ summary: 'Get marketing report' })
  @ApiQuery({ name: 'period', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Marketing report retrieved successfully' })
  async getMarketingReport(@Query() params: QueryParams) {
    try {
      const data = await this.advancedAnalyticsService.getMarketingReport(this.convertQueryParams(params));
      return this.formatSuccessResponse(data);
    } catch (error) {
      return this.handleError(error as Error, 'getMarketingReport');
    }
  }

  // ==================== Real-time Metrics ====================
  @Get('realtime')
  @ApiOperation({ summary: 'Get real-time metrics' })
  @ApiResponse({ status: 200, description: 'Real-time metrics retrieved successfully' })
  async getRealTimeMetrics() {
    try {
      const data = await this.advancedAnalyticsService.getRealTimeMetrics();
      return this.formatSuccessResponse(data);
    } catch (error) {
      return this.handleError(error as Error, 'getRealTimeMetrics');
    }
  }

  // ==================== Quick Stats ====================
  @Get('quick-stats')
  @ApiOperation({ summary: 'Get quick stats' })
  @ApiResponse({ status: 200, description: 'Quick stats retrieved successfully' })
  async getQuickStats() {
    try {
      const data = await this.advancedAnalyticsService.getQuickStats();
      return this.formatSuccessResponse(data);
    } catch (error) {
      return this.handleError(error as Error, 'getQuickStats');
    }
  }

  // ==================== Advanced Reports ====================
  @Post('reports/generate')
  @ApiOperation({ summary: 'Generate advanced report' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiResponse({ status: 201, description: 'Report generated successfully' })
  async generateAdvancedReport(@Body() data: ReportData) {
    try {
      const report = await this.advancedAnalyticsService.generateAdvancedReport(data);
      return this.formatSuccessResponse(report);
    } catch (error) {
      return this.handleError(error as Error, 'generateAdvancedReport');
    }
  }

  @Get('reports')
  @ApiOperation({ summary: 'List advanced reports' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiResponse({ status: 200, description: 'Reports retrieved successfully' })
  async listAdvancedReports(@Query() params: QueryParams) {
    try {
      const result = await this.advancedAnalyticsService.listAdvancedReports(this.convertQueryParams(params));
      return this.formatSuccessResponse({
        data: result.data,
        meta: result.meta
      });
    } catch (error) {
      return this.handleError(error as Error, 'listAdvancedReports');
    }
  }

  @Get('reports/:reportId')
  @ApiOperation({ summary: 'Get advanced report by ID' })
  @ApiParam({ name: 'reportId', description: 'Report ID' })
  @ApiResponse({ status: 200, description: 'Report retrieved successfully' })
  async getAdvancedReport(@Param('reportId') reportId: string) {
    try {
      const report = await this.advancedAnalyticsService.getAdvancedReport(reportId);
      return this.formatSuccessResponse(report);
    } catch (error) {
      return this.handleError(error as Error, 'getAdvancedReport');
    }
  }

  @Post('reports/:reportId/archive')
  @ApiOperation({ summary: 'Archive report' })
  @ApiParam({ name: 'reportId', description: 'Report ID' })
  @ApiResponse({ status: 200, description: 'Report archived successfully' })
  async archiveReport(@Param('reportId') reportId: string) {
    try {
      const report = await this.advancedAnalyticsService.archiveReport(reportId);
      return this.formatSuccessResponse(report);
    } catch (error) {
      return this.handleError(error as Error, 'archiveReport');
    }
  }

  @Delete('reports/:reportId')
  @ApiOperation({ summary: 'Delete report' })
  @ApiParam({ name: 'reportId', description: 'Report ID' })
  @ApiResponse({ status: 200, description: 'Report deleted successfully' })
  async deleteReport(@Param('reportId') reportId: string) {
    try {
      await this.advancedAnalyticsService.deleteReport(reportId);
      return this.formatSuccessResponse(null, 'Report deleted successfully');
    } catch (error) {
      return this.handleError(error as Error, 'deleteReport');
    }
  }

  @Post('reports/:reportId/export')
  @ApiOperation({ summary: 'Export report' })
  @ApiParam({ name: 'reportId', description: 'Report ID' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiResponse({ status: 200, description: 'Report exported successfully' })
  async exportReport(@Param('reportId') reportId: string, @Body() data: ReportData) {
    try {
      const exportData = await this.advancedAnalyticsService.exportReport(reportId, data);
      return this.formatSuccessResponse(exportData);
    } catch (error) {
      return this.handleError(error as Error, 'exportReport');
    }
  }

  // ==================== Data Export ====================
  @Get('export/sales')
  @ApiOperation({ summary: 'Export sales data' })
  @ApiQuery({ name: 'format', required: true })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiResponse({ status: 200, description: 'Sales data exported successfully' })
  async exportSalesData(
    @Query('format') format: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    try {
      const data = await this.advancedAnalyticsService.exportSalesData(format, startDate, endDate);
      return this.formatSuccessResponse(data);
    } catch (error) {
      return this.handleError(error as Error, 'exportSalesData');
    }
  }

  @Get('export/products')
  @ApiOperation({ summary: 'Export products data' })
  @ApiQuery({ name: 'format', required: true })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Products data exported successfully' })
  async exportProductsData(
    @Query('format') format: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const data = await this.advancedAnalyticsService.exportProductsData(format, startDate, endDate);
      return this.formatSuccessResponse(data);
    } catch (error) {
      return this.handleError(error as Error, 'exportProductsData');
    }
  }

  @Get('export/customers')
  @ApiOperation({ summary: 'Export customers data' })
  @ApiQuery({ name: 'format', required: true })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Customers data exported successfully' })
  async exportCustomersData(
    @Query('format') format: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const data = await this.advancedAnalyticsService.exportCustomersData(format, startDate, endDate);
      return this.formatSuccessResponse(data);
    } catch (error) {
      return this.handleError(error as Error, 'exportCustomersData');
    }
  }

  // ==================== Comparison & Trends ====================
  @Get('comparison')
  @ApiOperation({ summary: 'Compare periods (advanced)' })
  @ApiQuery({ name: 'currentStart', required: true })
  @ApiQuery({ name: 'currentEnd', required: true })
  @ApiQuery({ name: 'previousStart', required: true })
  @ApiQuery({ name: 'previousEnd', required: true })
  @ApiResponse({ status: 200, description: 'Period comparison retrieved successfully' })
  async comparePeriodsAdvanced(
    @Query('currentStart') currentStart: string,
    @Query('currentEnd') currentEnd: string,
    @Query('previousStart') previousStart: string,
    @Query('previousEnd') previousEnd: string,
  ) {
    try {
      const data = await this.advancedAnalyticsService.comparePeriodsAdvanced(
        currentStart,
        currentEnd,
        previousStart,
        previousEnd,
      );
      return this.formatSuccessResponse(data);
    } catch (error) {
      return this.handleError(error as Error, 'comparePeriodsAdvanced');
    }
  }

  @Get('trends/:metric')
  @ApiOperation({ summary: 'Get metric trends (advanced)' })
  @ApiParam({ name: 'metric', description: 'Metric name' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiQuery({ name: 'groupBy', required: false })
  @ApiResponse({ status: 200, description: 'Metric trends retrieved successfully' })
  async getMetricTrendsAdvanced(
    @Param('metric') metric: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('groupBy') groupBy?: string,
  ) {
    try {
      const data = await this.advancedAnalyticsService.getMetricTrendsAdvanced(
        metric,
        startDate,
        endDate,
        groupBy,
      );
      return this.formatSuccessResponse(data);
    } catch (error) {
      return this.handleError(error as Error, 'getMetricTrendsAdvanced');
    }
  }
}
