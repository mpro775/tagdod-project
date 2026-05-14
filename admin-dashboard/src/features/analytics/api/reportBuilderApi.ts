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

export const reportBuilderApi = {
  // ==================== Report Templates ====================

  getTemplates: async (category?: string): Promise<ReportTemplate[]> => {
    const response = await apiClient.get<{ success: boolean; data: ReportTemplate[] }>(
      '/analytics/report-templates',
      { params: category ? { category } : {} }
    );
    return response.data.data;
  },

  getTemplate: async (key: string): Promise<ReportTemplate> => {
    const response = await apiClient.get<{ success: boolean; data: ReportTemplate }>(
      `/analytics/report-templates/${key}`
    );
    return response.data.data;
  },

  createTemplate: async (data: CreateReportTemplateDto): Promise<ReportTemplate> => {
    const response = await apiClient.post<{ success: boolean; data: ReportTemplate }>(
      '/analytics/report-templates',
      data
    );
    return response.data.data;
  },

  updateTemplate: async (key: string, data: UpdateReportTemplateDto): Promise<ReportTemplate> => {
    const response = await apiClient.patch<{ success: boolean; data: ReportTemplate }>(
      `/analytics/report-templates/${key}`,
      data
    );
    return response.data.data;
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
    return response.data.data;
  },

  generateCustomReport: async (data: GenerateCustomReportDto) => {
    const response = await apiClient.post<{ success: boolean; data: any }>(
      '/analytics/advanced/reports/custom/generate',
      data
    );
    return response.data.data;
  },

  // ==================== Insights ====================

  getInsights: async (days = 30): Promise<Insight[]> => {
    const response = await apiClient.get<{ success: boolean; data: Insight[] }>(
      '/analytics/advanced/insights',
      { params: { days } }
    );
    return response.data.data;
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
    return {
      data: response.data.data,
      meta: {
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
        totalPages: response.data.totalPages,
      },
    };
  },

  getAlert: async (id: string): Promise<AnalyticsAlert> => {
    const response = await apiClient.get<{ success: boolean; data: AnalyticsAlert }>(
      `/analytics/alerts/${id}`
    );
    return response.data.data;
  },

  updateAlertStatus: async (id: string, data: UpdateAlertStatusDto): Promise<AnalyticsAlert> => {
    const response = await apiClient.patch<{ success: boolean; data: AnalyticsAlert }>(
      `/analytics/alerts/${id}/status`,
      data
    );
    return response.data.data;
  },

  deleteAlert: async (id: string): Promise<void> => {
    await apiClient.delete(`/analytics/alerts/${id}`);
  },

  getAlertStats: async (): Promise<AlertStats> => {
    const response = await apiClient.get<{ success: boolean; data: AlertStats }>(
      '/analytics/alerts/stats'
    );
    return response.data.data;
  },

  scanAlerts: async (): Promise<AnalyticsAlert[]> => {
    const response = await apiClient.post<{ success: boolean; data: AnalyticsAlert[] }>(
      '/analytics/alerts/scan'
    );
    return response.data.data;
  },
};
