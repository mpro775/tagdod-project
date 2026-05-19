import { apiClient } from '@/core/api/client';
import type {
  DashboardData,
  AnalyticsQueryDto,
  SalesAnalytics,
  ProductPerformance,
  CustomerAnalytics,
  InventoryReport,
  FinancialReport,
  CartAnalytics,
  MarketingReport,
  RealTimeMetrics,
  PerformanceMetrics,
  AdvancedReport,
  ReportGenerationDto,
  ExportReportDto,
  ListReportsParams,
  PeriodType,
  GenerateAdvancedReportDto,
  CreateReportScheduleDto,
  ReportSchedule,
  UpdateReportScheduleDto,
  ScheduleStats,
  ListSchedulesParams,
} from '../types/analytics.types';
import type { MappedDashboardData } from '../utils/analyticsDashboardMappers';
import type { ExportFile, ExportFilesParams, ExportDataParams } from '../types/exports';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/common.types';

import {
  unwrapApiData,
  normalizePaginatedResponse,
} from '../utils/analyticsDataGuards';

import { mapAnalyticsDashboard } from '../utils/analyticsDashboardMappers';

import {
  mapSalesAnalytics,
  mapCustomerAnalytics,
  mapInventoryReport,
  mapFinancialReport,
  mapMarketingReport,
  mapRealTimeMetrics,
  mapProductPerformance,
} from '../utils/advancedAnalyticsMappers';

import {
  mapAdvancedReport,
  mapSchedule,
} from '../utils/reportMappers';
import { normalizeFileResult, normalizeExportFormat } from '../utils/exportMappers';

export const analyticsApi = {
  // ==================== Dashboard ====================

  /**
   * Get dashboard data
   */
  getDashboard: async (params: AnalyticsQueryDto = {}): Promise<MappedDashboardData> => {
    const response = await apiClient.get<ApiResponse<DashboardData>>(
      '/analytics/dashboard',
      { params }
    );
    return mapAnalyticsDashboard(unwrapApiData(response)) as MappedDashboardData;
  },

  /**
   * Get overview metrics
   */
  getOverview: async (params: AnalyticsQueryDto = {}): Promise<DashboardData['overview']> => {
    const response = await apiClient.get<ApiResponse<DashboardData['overview']>>('/analytics/overview', { params });
    return unwrapApiData(response);
  },

  /**
   * Get KPIs
   */
  getKPIs: async (params: AnalyticsQueryDto = {}): Promise<DashboardData['kpis']> => {
    const response = await apiClient.get<ApiResponse<DashboardData['kpis']>>('/analytics/kpis', { params });
    return unwrapApiData(response);
  },

  // ==================== Charts Data ====================

  /**
   * Get revenue analytics
   */
  getRevenueAnalytics: async (params: AnalyticsQueryDto = {}): Promise<DashboardData['revenueCharts']> => {
    const response = await apiClient.get<ApiResponse<DashboardData['revenueCharts']>>('/analytics/revenue', { params });
    return unwrapApiData(response);
  },

  /**
   * Get user analytics
   */
  getUserAnalytics: async (params: AnalyticsQueryDto = {}): Promise<DashboardData['userCharts']> => {
    const response = await apiClient.get<ApiResponse<DashboardData['userCharts']>>('/analytics/users', { params });
    return unwrapApiData(response);
  },

  /**
   * Get product analytics
   */
  getProductAnalytics: async (params: AnalyticsQueryDto = {}): Promise<DashboardData['productCharts']> => {
    const response = await apiClient.get<ApiResponse<DashboardData['productCharts']>>('/analytics/products', { params });
    return unwrapApiData(response);
  },

  /**
   * Get service analytics
   */
  getServiceAnalytics: async (params: AnalyticsQueryDto = {}): Promise<DashboardData['serviceCharts']> => {
    const response = await apiClient.get<ApiResponse<DashboardData['serviceCharts']>>('/analytics/services', { params });
    return unwrapApiData(response);
  },

  /**
   * Get support analytics
   */
  getSupportAnalytics: async (params: AnalyticsQueryDto = {}): Promise<DashboardData['supportCharts']> => {
    const response = await apiClient.get<ApiResponse<DashboardData['supportCharts']>>('/analytics/support', { params });
    return unwrapApiData(response);
  },

  // ==================== Performance ====================

  /**
   * Get performance metrics
   */
  getPerformanceMetrics: async (): Promise<PerformanceMetrics> => {
    const response = await apiClient.get<ApiResponse<PerformanceMetrics>>(
      '/analytics/performance'
    );
    return unwrapApiData(response);
  },

  /**
   * Refresh analytics
   */
  refreshAnalytics: async (): Promise<unknown> => {
    const response = await apiClient.post<ApiResponse<unknown>>('/analytics/refresh');
    return unwrapApiData(response);
  },

  /**
   * Clear analytics cache
   */
  clearCache: async (): Promise<unknown> => {
    const response = await apiClient.delete<ApiResponse<unknown>>('/analytics/cache');
    return unwrapApiData(response);
  },

  // ==================== Reports ====================

  /**
   * Generate report
   */
  generateReport: async (data: ReportGenerationDto): Promise<unknown> => {
    const response = await apiClient.post<ApiResponse<unknown>>('/analytics/reports/generate', data);
    return unwrapApiData(response);
  },

  /**
   * Get report by ID
   */
  getReport: async (id: string): Promise<unknown> => {
    const response = await apiClient.get<ApiResponse<unknown>>(`/analytics/reports/${id}`);
    return unwrapApiData(response);
  },

  /**
   * Schedule report
   */
  scheduleReport: async (data: CreateReportScheduleDto): Promise<unknown> => {
    const response = await apiClient.post<ApiResponse<unknown>>('/analytics/reports/schedule', data);
    return unwrapApiData(response);
  },

  // ==================== Trends ====================

  /**
   * Get metric trends
   */
  getMetricTrends: async (
    metric: string,
    period?: PeriodType,
    days?: number
  ) => {
    const response = await apiClient.get<ApiResponse<unknown>>(`/analytics/trends/${metric}`, {
      params: { period, days },
    });
    return unwrapApiData(response);
  },

  // ==================== Comparison ====================

  /**
   * Compare periods
   */
  comparePeriods: async (
    currentStart: string,
    currentEnd: string,
    previousStart: string,
    previousEnd: string
  ) => {
    const response = await apiClient.get<ApiResponse<unknown>>('/analytics/comparison', {
      params: { currentStart, currentEnd, previousStart, previousEnd },
    });
    return unwrapApiData(response);
  },

  // ==================== Export ====================

  /**
   * Export data (legacy/generic)
   */
  exportData: async (
    format: string,
    type: string,
    period?: PeriodType
  ): Promise<ExportFile> => {
    const response = await apiClient.get<ApiResponse<ExportFile>>(`/analytics/export/${normalizeExportFormat(format)}`, {
      params: { type, period },
    });
    return normalizeFileResult(unwrapApiData(response));
  },

  // ==================== Advanced Analytics ====================

  /**
   * Get sales analytics
   */
  getSalesAnalytics: async (params: Record<string, unknown> = {}): Promise<SalesAnalytics> => {
    const response = await apiClient.get<{ success: boolean; data: SalesAnalytics }>(
      '/analytics/advanced/sales',
      { params }
    );
    return mapSalesAnalytics(unwrapApiData(response));
  },

  /**
   * Get product performance
   */
  getProductPerformance: async (params: Record<string, unknown> = {}): Promise<ProductPerformance> => {
    const response = await apiClient.get<{ success: boolean; data: ProductPerformance }>(
      '/analytics/advanced/products/performance',
      { params }
    );
    return mapProductPerformance(unwrapApiData(response));
  },

  /**
   * Get customer analytics
   */
  getCustomerAnalytics: async (params: Record<string, unknown> = {}): Promise<CustomerAnalytics> => {
    const response = await apiClient.get<{ success: boolean; data: CustomerAnalytics }>(
      '/analytics/advanced/customers',
      { params }
    );
    return mapCustomerAnalytics(unwrapApiData(response));
  },

  /**
   * Get inventory report
   */
  getInventoryReport: async (params: Record<string, unknown> = {}): Promise<InventoryReport> => {
    const response = await apiClient.get<{ success: boolean; data: InventoryReport }>(
      '/analytics/advanced/inventory',
      { params }
    );
    return mapInventoryReport(unwrapApiData(response));
  },

  /**
   * Get financial report
   */
  getFinancialReport: async (params: Record<string, unknown> = {}): Promise<FinancialReport> => {
    const response = await apiClient.get<{ success: boolean; data: FinancialReport }>(
      '/analytics/advanced/financial',
      { params }
    );
    return mapFinancialReport(unwrapApiData(response));
  },

  /**
   * Get cart analytics
   */
  getCartAnalytics: async (params: Record<string, unknown> = {}): Promise<CartAnalytics> => {
    const response = await apiClient.get<{ success: boolean; data: CartAnalytics }>(
      '/analytics/advanced/cart-analytics',
      { params }
    );
    return unwrapApiData(response);
  },

  /**
   * Get marketing report
   */
  getMarketingReport: async (params: Record<string, unknown> = {}): Promise<MarketingReport> => {
    const response = await apiClient.get<{ success: boolean; data: MarketingReport }>(
      '/analytics/advanced/marketing',
      { params }
    );
    return mapMarketingReport(unwrapApiData(response));
  },

  /**
   * Get real-time metrics
   */
  getRealTimeMetrics: async (): Promise<RealTimeMetrics> => {
    const response = await apiClient.get<{ success: boolean; data: RealTimeMetrics }>(
      '/analytics/advanced/realtime'
    );
    return mapRealTimeMetrics(unwrapApiData(response)) as unknown as RealTimeMetrics;
  },

  /**
   * Get quick stats
   */
  getQuickStats: async (): Promise<unknown> => {
    const response = await apiClient.get<ApiResponse<unknown>>('/analytics/advanced/quick-stats');
    return unwrapApiData(response);
  },

  // ==================== Advanced Reports ====================

  /**
   * Generate advanced report
   */
  generateAdvancedReport: async (data: GenerateAdvancedReportDto): Promise<AdvancedReport> => {
    const response = await apiClient.post<{ success: boolean; data: AdvancedReport }>(
      '/analytics/advanced/reports/generate',
      data
    );
    return mapAdvancedReport(unwrapApiData(response));
  },

  /**
   * List advanced reports
   */
  listAdvancedReports: async (
    params: ListReportsParams = {}
  ): Promise<PaginatedResponse<AdvancedReport>> => {
    const response = await apiClient.get('/analytics/advanced/reports', { params });
    return normalizePaginatedResponse(
      response,
      mapAdvancedReport,
      {
        page: params.page ?? 1,
        limit: params.limit ?? 50,
      }
    );
  },

  /**
   * Get advanced report by ID
   */
  getAdvancedReport: async (reportId: string): Promise<AdvancedReport> => {
    const response = await apiClient.get<{ success: boolean; data: AdvancedReport }>(
      `/analytics/advanced/reports/${reportId}`
    );
    return mapAdvancedReport(unwrapApiData(response));
  },

  /**
   * Archive report
   */
  archiveReport: async (reportId: string): Promise<AdvancedReport> => {
    const response = await apiClient.post<{ success: boolean; data: AdvancedReport }>(
      `/analytics/advanced/reports/${reportId}/archive`
    );
    return mapAdvancedReport(unwrapApiData(response));
  },

  /**
   * Delete report
   */
  deleteReport: async (reportId: string): Promise<void> => {
    await apiClient.delete(`/analytics/advanced/reports/${reportId}`);
  },

  /**
   * Export report
   */
  exportReport: async (reportId: string, data: ExportReportDto): Promise<ExportFile> => {
    const payload = {
      ...data,
      format: normalizeExportFormat(data?.format),
      currency: data.currency || 'YER',
    };

    const response = await apiClient.post(
      `/analytics/advanced/reports/${reportId}/export`,
      payload
    );
    return normalizeFileResult(unwrapApiData(response));
  },

  // ==================== Comparison & Trends ====================

  /**
   * Compare periods (advanced)
   */
  comparePeriodsAdvanced: async (
    currentStart: string,
    currentEnd: string,
    previousStart: string,
    previousEnd: string
  ): Promise<unknown> => {
    const response = await apiClient.get<ApiResponse<unknown>>('/analytics/advanced/comparison', {
      params: { currentStart, currentEnd, previousStart, previousEnd },
    });
    return unwrapApiData(response);
  },

  /**
   * Get metric trends (advanced)
   */
  getMetricTrendsAdvanced: async (
    metric: string,
    startDate: string,
    endDate: string,
    groupBy?: string
  ) => {
    const response = await apiClient.get<ApiResponse<unknown>>(`/analytics/advanced/trends/${metric}`, {
      params: { startDate, endDate, groupBy },
    });
    return unwrapApiData(response);
  },

  // ==================== Data Export ====================

  /**
   * Export sales data
   */
  exportSalesData: async (params: ExportDataParams): Promise<ExportFile> => {
    const response = await apiClient.get('/analytics/advanced/export/sales', {
      params: {
        format: normalizeExportFormat(params.format),
        startDate: params.startDate,
        endDate: params.endDate,
      },
    });
    return normalizeFileResult(unwrapApiData(response));
  },

  /**
   * Export products data
   */
  exportProductsData: async (params: ExportDataParams): Promise<ExportFile> => {
    const response = await apiClient.get('/analytics/advanced/export/products', {
      params: {
        format: normalizeExportFormat(params.format),
        startDate: params.startDate,
        endDate: params.endDate,
      },
    });
    return normalizeFileResult(unwrapApiData(response));
  },

  /**
   * Export customers data
   */
  exportCustomersData: async (params: ExportDataParams): Promise<ExportFile> => {
    const response = await apiClient.get('/analytics/advanced/export/customers', {
      params: {
        format: normalizeExportFormat(params.format),
        startDate: params.startDate,
        endDate: params.endDate,
      },
    });
    return normalizeFileResult(unwrapApiData(response));
  },

  /**
   * Export inventory data
   */
  exportInventoryData: async (params: ExportDataParams): Promise<ExportFile> => {
    const response = await apiClient.get('/analytics/advanced/export/inventory', {
      params: {
        format: normalizeExportFormat(params.format),
        startDate: params.startDate,
        endDate: params.endDate,
      },
    });
    return normalizeFileResult(unwrapApiData(response));
  },

  /**
   * Export financial data
   */
  exportFinancialData: async (params: ExportDataParams): Promise<ExportFile> => {
    const response = await apiClient.get('/analytics/advanced/export/financial', {
      params: {
        format: normalizeExportFormat(params.format),
        startDate: params.startDate,
        endDate: params.endDate,
      },
    });
    return normalizeFileResult(unwrapApiData(response));
  },

  /**
   * Export marketing data
   */
  exportMarketingData: async (params: ExportDataParams): Promise<ExportFile> => {
    const response = await apiClient.get('/analytics/advanced/export/marketing', {
      params: {
        format: normalizeExportFormat(params.format),
        startDate: params.startDate,
        endDate: params.endDate,
      },
    });
    return normalizeFileResult(unwrapApiData(response));
  },

  // ==================== Report Schedules ====================

  /**
   * Create a report schedule
   */
  createSchedule: async (data: CreateReportScheduleDto): Promise<ReportSchedule> => {
    const response = await apiClient.post<{ success: boolean; data: ReportSchedule }>(
      '/analytics/report-schedules',
      data
    );
    return mapSchedule(unwrapApiData(response));
  },

  /**
   * List all report schedules
   */
  listSchedules: async (
    params: ListSchedulesParams = {}
  ): Promise<PaginatedResponse<ReportSchedule>> => {
    const response = await apiClient.get('/analytics/report-schedules', { params });
    return normalizePaginatedResponse(
      response,
      mapSchedule,
      {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      }
    );
  },

  /**
   * Get a single schedule by ID
   */
  getSchedule: async (id: string): Promise<ReportSchedule> => {
    const response = await apiClient.get<{ success: boolean; data: ReportSchedule }>(
      `/analytics/report-schedules/${id}`
    );
    return mapSchedule(unwrapApiData(response));
  },

  /**
   * Update a schedule
   */
  updateSchedule: async (
    id: string,
    data: UpdateReportScheduleDto
  ): Promise<ReportSchedule> => {
    const response = await apiClient.patch<{ success: boolean; data: ReportSchedule }>(
      `/analytics/report-schedules/${id}`,
      data
    );
    return mapSchedule(unwrapApiData(response));
  },

  /**
   * Toggle schedule active/inactive
   */
  toggleSchedule: async (id: string, isActive: boolean): Promise<ReportSchedule> => {
    const response = await apiClient.patch<{ success: boolean; data: ReportSchedule }>(
      `/analytics/report-schedules/${id}/toggle`,
      { isActive }
    );
    return mapSchedule(unwrapApiData(response));
  },

  /**
   * Delete a schedule
   */
  deleteSchedule: async (id: string): Promise<void> => {
    await apiClient.delete(`/analytics/report-schedules/${id}`);
  },

  /**
   * Run a schedule immediately
   */
  runScheduleNow: async (
    id: string,
    data?: { formats?: string[]; recipients?: string[] }
  ): Promise<unknown> => {
    const response = await apiClient.post<ApiResponse<unknown>>(
      `/analytics/report-schedules/${id}/run-now`,
      data || {}
    );
    return unwrapApiData(response);
  },

  /**
   * Pause a schedule (maps to toggle with isActive=false)
   */
  pauseSchedule: async (id: string): Promise<ReportSchedule> => {
    const response = await apiClient.patch<{ success: boolean; data: ReportSchedule }>(
      `/analytics/report-schedules/${id}/toggle`,
      { isActive: false }
    );
    return mapSchedule(unwrapApiData(response));
  },

  /**
   * Resume a schedule (maps to toggle with isActive=true)
   */
  resumeSchedule: async (id: string): Promise<ReportSchedule> => {
    const response = await apiClient.patch<{ success: boolean; data: ReportSchedule }>(
      `/analytics/report-schedules/${id}/toggle`,
      { isActive: true }
    );
    return mapSchedule(unwrapApiData(response));
  },

  /**
   * Get schedule statistics
   */
  getScheduleStats: async (): Promise<ScheduleStats> => {
    const response = await apiClient.get<{ success: boolean; data: ScheduleStats }>(
      '/analytics/report-schedules/stats'
    );
    return unwrapApiData(response);
  },

  // ==================== Export Center ====================

  /**
   * Get all exported files from reports
   */
  getExportedFiles: async (
    params: ExportFilesParams = {}
  ): Promise<PaginatedResponse<ExportFile>> => {
    const response = await apiClient.get('/analytics/advanced/exports', { params });
    return normalizePaginatedResponse(
      response,
      normalizeFileResult,
      {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      }
    );
  },
};
