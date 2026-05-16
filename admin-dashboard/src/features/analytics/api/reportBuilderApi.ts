import { apiClient } from '@/core/api/client';
import type { PaginatedResponse } from '@/shared/types/common.types';
import type {
  ReportTemplate,
  CreateReportTemplateDto,
  UpdateReportTemplateDto,
  GenerateCustomReportDto,
  PreviewCustomReportDto,
  AnalyticsAlert,
  UpdateAlertStatusDto,
  AlertStats,
  Insight,
} from '../types/reportBuilder.types';
import { unwrapApiData, unwrapPaginatedResult } from '../utils/analyticsDataGuards';

export const reportBuilderApi = {
  // ==================== Report Templates ====================

  getTemplates: async (category?: string): Promise<ReportTemplate[]> => {
    const response = await apiClient.get<{ success: boolean; data: ReportTemplate[] }>(
      '/analytics/report-templates',
      { params: category ? { category } : {} }
    );
    return unwrapApiData(response);
  },

  getTemplate: async (key: string): Promise<ReportTemplate> => {
    const response = await apiClient.get<{ success: boolean; data: ReportTemplate }>(
      `/analytics/report-templates/${key}`
    );
    return unwrapApiData(response);
  },

  createTemplate: async (data: CreateReportTemplateDto): Promise<ReportTemplate> => {
    const response = await apiClient.post<{ success: boolean; data: ReportTemplate }>(
      '/analytics/report-templates',
      data
    );
    return unwrapApiData(response);
  },

  updateTemplate: async (key: string, data: UpdateReportTemplateDto): Promise<ReportTemplate> => {
    const response = await apiClient.patch<{ success: boolean; data: ReportTemplate }>(
      `/analytics/report-templates/${key}`,
      data
    );
    return unwrapApiData(response);
  },

  deleteTemplate: async (key: string): Promise<void> => {
    await apiClient.delete(`/analytics/report-templates/${key}`);
  },

  seedTemplates: async (): Promise<void> => {
    await apiClient.post('/analytics/report-templates/seed');
  },

  // ==================== Custom Reports ====================

  previewCustomReport: async (data: PreviewCustomReportDto) => {
    const response = await apiClient.post<{ success: boolean; data: any }>(
      '/analytics/advanced/reports/custom/preview',
      data
    );
    return unwrapApiData(response);
  },

  generateCustomReport: async (data: GenerateCustomReportDto) => {
    const response = await apiClient.post<{ success: boolean; data: any }>(
      '/analytics/advanced/reports/custom/generate',
      data
    );
    return unwrapApiData(response);
  },

  // ==================== Insights ====================

  getInsights: async (days = 30): Promise<Insight[]> => {
    const response = await apiClient.get<{ success: boolean; data: Insight[] }>(
      '/analytics/advanced/insights',
      { params: { days } }
    );
    return unwrapApiData(response);
  },

  // ==================== Alerts ====================

  getAlerts: async (params: {
    status?: string;
    severity?: string;
    source?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<AnalyticsAlert>> => {
    const response = await apiClient.get<{
      success: boolean;
      data: AnalyticsAlert[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>('/analytics/alerts', { params });
    return unwrapPaginatedResult(response) as unknown as PaginatedResponse<AnalyticsAlert>;
  },

  getAlert: async (id: string): Promise<AnalyticsAlert> => {
    const response = await apiClient.get<{ success: boolean; data: AnalyticsAlert }>(
      `/analytics/alerts/${id}`
    );
    return unwrapApiData(response);
  },

  updateAlertStatus: async (id: string, data: UpdateAlertStatusDto): Promise<AnalyticsAlert> => {
    const response = await apiClient.patch<{ success: boolean; data: AnalyticsAlert }>(
      `/analytics/alerts/${id}/status`,
      data
    );
    return unwrapApiData(response);
  },

  deleteAlert: async (id: string): Promise<void> => {
    await apiClient.delete(`/analytics/alerts/${id}`);
  },

  getAlertStats: async (): Promise<AlertStats> => {
    const response = await apiClient.get<{ success: boolean; data: AlertStats }>(
      '/analytics/alerts/stats'
    );
    return unwrapApiData(response);
  },

  scanAlerts: async (): Promise<AnalyticsAlert[]> => {
    const response = await apiClient.post<{ success: boolean; data: AnalyticsAlert[] }>(
      '/analytics/alerts/scan'
    );
    return unwrapApiData(response);
  },
};
