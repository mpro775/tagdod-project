import { apiClient } from '@/core/api/client';
import { unwrapApiData } from '@/core/api/response';
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
    const payload = unwrapApiData<AuditLogsResponse & { logs?: AuditLog[] }>(response.data, {
      data: [],
      meta: { total: 0, limit: filters.limit || 50, skip: 0, hasMore: false },
    });
    return {
      data: payload.data ?? payload.logs ?? [],
      meta: payload.meta ?? {
        total: 0,
        limit: filters.limit || 50,
        skip: 0,
        hasMore: false,
      },
    };
  },

  // Get audit statistics
  getAuditStats: async (startDate?: string, endDate?: string): Promise<AuditStatsResponse> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await apiClient.get<ApiResponse<AuditStatsResponse>>(`/admin/audit/stats?${params.toString()}`);
    return { data: unwrapApiData<AuditStatsResponse['data']>(response.data) };
  },

  // Get available audit actions
  getAuditActions: async (): Promise<AuditActionsResponse> => {
    const response = await apiClient.get<ApiResponse<AuditActionsResponse>>('/admin/audit/actions');
    return { data: unwrapApiData<AuditActionsResponse['data']>(response.data, []) };
  },

  // Get available audit resources
  getAuditResources: async (): Promise<AuditResourcesResponse> => {
    const response = await apiClient.get<ApiResponse<AuditResourcesResponse>>('/admin/audit/resources');
    return { data: unwrapApiData<AuditResourcesResponse['data']>(response.data, []) };
  },

  // Get audit log by ID (if needed for detailed view)
  getAuditLogById: async (id: string): Promise<AuditLog> => {
    const response = await apiClient.get<ApiResponse<AuditLog>>(`/admin/audit/logs/${id}`);
    return unwrapApiData<AuditLog>(response.data);
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
