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
 
} from '../types/analytics.types';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/common.types';

export const analyticsApi = {
  // ==================== Dashboard ====================

  /**
   * Get dashboard data
   */
  getDashboard: async (params: AnalyticsQueryDto = {}): Promise<DashboardData> => {
    const response = await apiClient.get<ApiResponse<DashboardData>>(
      '/analytics/dashboard',
      { params }
    );
    return response.data.data;
  },

  /**
   * Get overview metrics
   */
  getOverview: async (params: AnalyticsQueryDto = {}) => {
    const response = await apiClient.get<ApiResponse<any>>('/analytics/overview', { params });
    return response.data.data;
  },

  /**
   * Get KPIs
   */
  getKPIs: async (params: AnalyticsQueryDto = {}) => {
    const response = await apiClient.get<ApiResponse<any>>('/analytics/kpis', { params });
    return response.data.data;
  },

  // ==================== Charts Data ====================

  /**
   * Get revenue analytics
   */
  getRevenueAnalytics: async (params: AnalyticsQueryDto = {}) => {
    const response = await apiClient.get<ApiResponse<any>>('/analytics/revenue', { params });
    return response.data.data;
  },

  /**
   * Get user analytics
   */
  getUserAnalytics: async (params: AnalyticsQueryDto = {}) => {
    const response = await apiClient.get<ApiResponse<any>>('/analytics/users', { params });
    return response.data.data;
  },

  /**
   * Get product analytics
   */
  getProductAnalytics: async (params: AnalyticsQueryDto = {}) => {
    const response = await apiClient.get<ApiResponse<any>>('/analytics/products', { params });
    return response.data.data;
  },

  /**
   * Get service analytics
   */
  getServiceAnalytics: async (params: AnalyticsQueryDto = {}) => {
    const response = await apiClient.get<ApiResponse<any>>('/analytics/services', { params });
    return response.data.data;
  },

  /**
   * Get support analytics
   */
  getSupportAnalytics: async (params: AnalyticsQueryDto = {}) => {
    const response = await apiClient.get<ApiResponse<any>>('/analytics/support', { params });
    return response.data.data;
  },

  // ==================== Performance ====================

  /**
   * Get performance metrics
   */
  getPerformanceMetrics: async (): Promise<PerformanceMetrics> => {
    const response = await apiClient.get<ApiResponse<PerformanceMetrics>>(
      '/analytics/performance'
    );
    return response.data.data;
  },

  /**
   * Refresh analytics
   */
  refreshAnalytics: async () => {
    const response = await apiClient.post<ApiResponse<any>>('/analytics/refresh');
    return response.data.data;
  },

  // ==================== Reports ====================

  /**
   * Generate report
   */
  generateReport: async (data: ReportGenerationDto) => {
    const response = await apiClient.post<ApiResponse<any>>('/analytics/reports/generate', data);
    return response.data.data;
  },

  /**
   * Get report by ID
   */
  getReport: async (id: string) => {
    const response = await apiClient.get<ApiResponse<any>>(`/analytics/reports/${id}`);
    return response.data.data;
  },

  /**
   * Schedule report
   */
  scheduleReport: async (data: any) => {
    const response = await apiClient.post<ApiResponse<any>>('/analytics/reports/schedule', data);
    return response.data.data;
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
    const response = await apiClient.get<ApiResponse<any>>(`/analytics/trends/${metric}`, {
      params: { period, days },
    });
    return response.data.data;
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
    const response = await apiClient.get<ApiResponse<any>>('/analytics/comparison', {
      params: { currentStart, currentEnd, previousStart, previousEnd },
    });
    return response.data.data;
  },

  // ==================== Export ====================

  /**
   * Export data
   */
  exportData: async (
    format: string,
    type: string,
    period?: PeriodType
  ) => {
    const response = await apiClient.get<ApiResponse<any>>(`/analytics/export/${format}`, {
      params: { type, period },
    });
    return response.data.data;
  },

  // ==================== Advanced Analytics ====================

  /**
   * Get sales analytics
   */
  getSalesAnalytics: async (params: any = {}): Promise<SalesAnalytics> => {
    const response = await apiClient.get<{ success: boolean; data: SalesAnalytics }>(
      '/analytics/advanced/sales',
      { params }
    );
    return response.data.data;
  },

  /**
   * Get product performance
   */
  getProductPerformance: async (params: any = {}): Promise<ProductPerformance> => {
    const response = await apiClient.get<{ success: boolean; data: ProductPerformance }>(
      '/analytics/advanced/products/performance',
      { params }
    );
    return response.data.data;
  },

  /**
   * Get customer analytics
   */
  getCustomerAnalytics: async (params: any = {}): Promise<CustomerAnalytics> => {
    const response = await apiClient.get<{ success: boolean; data: CustomerAnalytics }>(
      '/analytics/advanced/customers',
      { params }
    );
    return response.data.data;
  },

  /**
   * Get inventory report
   */
  getInventoryReport: async (params: any = {}): Promise<InventoryReport> => {
    const response = await apiClient.get<{ success: boolean; data: InventoryReport }>(
      '/analytics/advanced/inventory',
      { params }
    );
    return response.data.data;
  },

  /**
   * Get financial report
   */
  getFinancialReport: async (params: any = {}): Promise<FinancialReport> => {
    const response = await apiClient.get<{ success: boolean; data: FinancialReport }>(
      '/analytics/advanced/financial',
      { params }
    );
    return response.data.data;
  },

  /**
   * Get cart analytics
   */
  getCartAnalytics: async (params: any = {}): Promise<CartAnalytics> => {
    const response = await apiClient.get<{ success: boolean; data: CartAnalytics }>(
      '/analytics/advanced/cart-analytics',
      { params }
    );
    return response.data.data;
  },

  /**
   * Get marketing report
   */
  getMarketingReport: async (params: any = {}): Promise<MarketingReport> => {
    const response = await apiClient.get<{ success: boolean; data: MarketingReport }>(
      '/analytics/advanced/marketing',
      { params }
    );
    return response.data.data;
  },

  /**
   * Get real-time metrics
   */
  getRealTimeMetrics: async (): Promise<RealTimeMetrics> => {
    const response = await apiClient.get<{ success: boolean; data: RealTimeMetrics }>(
      '/analytics/advanced/realtime'
    );
    return response.data.data;
  },

  /**
   * Get quick stats
   */
  getQuickStats: async () => {
    const response = await apiClient.get('/analytics/advanced/quick-stats');
    return response.data;
  },

  // ==================== Advanced Reports ====================

  /**
   * Generate advanced report
   */
  generateAdvancedReport: async (data: any): Promise<AdvancedReport> => {
    const response = await apiClient.post<{ success: boolean; data: AdvancedReport }>(
      '/analytics/advanced/reports/generate',
      data
    );
    return response.data.data;
  },

  /**
   * List advanced reports
   */
  listAdvancedReports: async (
    params: ListReportsParams = {}
  ): Promise<PaginatedResponse<AdvancedReport>> => {
    const response = await apiClient.get<{
      success: boolean;
      data: AdvancedReport[];
      meta: any;
    }>('/analytics/advanced/reports', { params });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  /**
   * Get advanced report by ID
   */
  getAdvancedReport: async (reportId: string): Promise<AdvancedReport> => {
    const response = await apiClient.get<{ success: boolean; data: AdvancedReport }>(
      `/analytics/advanced/reports/${reportId}`
    );
    return response.data.data;
  },

  /**
   * Archive report
   */
  archiveReport: async (reportId: string): Promise<AdvancedReport> => {
    const response = await apiClient.post<{ success: boolean; data: AdvancedReport }>(
      `/analytics/advanced/reports/${reportId}/archive`
    );
    return response.data.data;
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
  exportReport: async (reportId: string, data: ExportReportDto) => {
    const response = await apiClient.post(
      `/analytics/advanced/reports/${reportId}/export`,
      data
    );
    return response.data;
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
  ) => {
    const response = await apiClient.get('/analytics/advanced/comparison', {
      params: { currentStart, currentEnd, previousStart, previousEnd },
    });
    return response.data;
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
    const response = await apiClient.get(`/analytics/advanced/trends/${metric}`, {
      params: { startDate, endDate, groupBy },
    });
    return response.data;
  },

  // ==================== Data Export ====================

  /**
   * Export sales data
   */
  exportSalesData: async (format: string, startDate: string, endDate: string) => {
    const response = await apiClient.get('/analytics/advanced/export/sales', {
      params: { format, startDate, endDate },
    });
    return response.data;
  },

  /**
   * Export products data
   */
  exportProductsData: async (
    format: string,
    startDate?: string,
    endDate?: string
  ) => {
    const response = await apiClient.get('/analytics/advanced/export/products', {
      params: { format, startDate, endDate },
    });
    return response.data;
  },

  /**
   * Export customers data
   */
  exportCustomersData: async (
    format: string,
    startDate?: string,
    endDate?: string
  ) => {
    const response = await apiClient.get('/analytics/advanced/export/customers', {
      params: { format, startDate, endDate },
    });
    return response.data;
  },
};

