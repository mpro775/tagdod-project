import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/shared/types/common.types';
import {
  AuditLog,
  AuditLogsResponse,
  AuditStatsResponse,
  AuditActionsResponse,
  AuditResourcesResponse,
  AuditLogFilters,
} from '../types/audit.types';

export const auditApi = {
  // Get audit logs with filtering
  getAuditLogs: async (filters: AuditLogFilters = {}): Promise<AuditLogsResponse> => {
    const params = new URLSearchParams();

    if (filters.userId) params.append('userId', filters.userId);
    if (filters.performedBy) params.append('performedBy', filters.performedBy);
    if (filters.action) params.append('action', filters.action);
    if (filters.resource) params.append('resource', filters.resource);
    if (filters.resourceId) params.append('resourceId', filters.resourceId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.isSensitive !== undefined)
      params.append('isSensitive', filters.isSensitive.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.page) params.append('page', filters.page.toString());

    const response = await apiClient.get<ApiResponse<AuditLogsResponse>>(`/admin/audit/logs?${params.toString()}`);
    return response.data.data;
  },

  // Get audit statistics
  getAuditStats: async (startDate?: string, endDate?: string): Promise<AuditStatsResponse> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await apiClient.get<ApiResponse<AuditStatsResponse>>(`/admin/audit/stats?${params.toString()}`);
    return response.data.data;
  },

  // Get available audit actions
  getAuditActions: async (): Promise<AuditActionsResponse> => {
    const response = await apiClient.get<ApiResponse<AuditActionsResponse>>('/admin/audit/actions');
    return response.data.data;
  },

  // Get available audit resources
  getAuditResources: async (): Promise<AuditResourcesResponse> => {
    const response = await apiClient.get<ApiResponse<AuditResourcesResponse>>('/admin/audit/resources');
    return response.data.data;
  },

  // Get audit log by ID (if needed for detailed view)
  getAuditLogById: async (id: string): Promise<AuditLog> => {
    const response = await apiClient.get<ApiResponse<AuditLog>>(`/admin/audit/logs/${id}`);
    return response.data.data;
  },

  // Export audit logs
  exportAuditLogs: async (filters: AuditLogFilters = {}): Promise<Blob> => {
    const params = new URLSearchParams();

    if (filters.userId) params.append('userId', filters.userId);
    if (filters.performedBy) params.append('performedBy', filters.performedBy);
    if (filters.action) params.append('action', filters.action);
    if (filters.resource) params.append('resource', filters.resource);
    if (filters.resourceId) params.append('resourceId', filters.resourceId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.isSensitive !== undefined)
      params.append('isSensitive', filters.isSensitive.toString());

    const response = await apiClient.get(`/admin/audit/export?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
