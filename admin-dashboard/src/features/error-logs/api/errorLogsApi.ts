import { apiClient } from '@/core/api/client';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/common.types';

export interface ErrorLog {
  id: string;
  level: 'error' | 'warn' | 'fatal' | 'debug';
  category: string;
  message: string;
  stack?: string;
  metadata?: Record<string, any>;
  userId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  occurrences: number;
  firstOccurrence: Date;
  lastOccurrence: Date;
  resolved: boolean;
  createdAt: Date;
}

export interface ErrorStatistics {
  totalErrors: number;
  last24Hours: number;
  last7Days: number;
  errorRate: number;
  byLevel: {
    error: number;
    warn: number;
    fatal: number;
    debug: number;
  };
  byCategory: Record<string, number>;
  topErrors: Array<{
    message: string;
    count: number;
    level: string;
    category: string;
    lastOccurrence: Date;
  }>;
  byEndpoint: Array<{
    endpoint: string;
    count: number;
    errorRate: number;
  }>;
}

export interface ErrorTrend {
  data: Array<{
    date: string;
    total: number;
    byLevel: {
      error: number;
      warn: number;
      fatal: number;
      debug: number;
    };
  }>;
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercentage: number;
}

export const errorLogsApi = {
  /**
   * Get error logs
   */
  getErrorLogs: async (params: {
    level?: string;
    category?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<ErrorLog>> => {
    const response = await apiClient.get<ApiResponse<{ data: ErrorLog[]; meta: any }>>(
      '/error-logs',
      { params }
    );
    // Response structure: { success: true, data: { data: [...], meta: {...} }, requestId: "..." }
    return {
      data: response.data.data.data,
      meta: response.data.data.meta,
    };
  },

  /**
   * Get error by ID
   */
  getErrorById: async (id: string): Promise<ErrorLog> => {
    const response = await apiClient.get<ApiResponse<ErrorLog>>(
      `/error-logs/${id}`
    );
    return response.data.data;
  },

  /**
   * Get error statistics
   */
  getStatistics: async (): Promise<ErrorStatistics> => {
    const response = await apiClient.get<ApiResponse<ErrorStatistics>>(
      '/error-logs/statistics'
    );
    return response.data.data;
  },

  /**
   * Get error trends
   */
  getTrends: async (days?: number): Promise<ErrorTrend> => {
    const response = await apiClient.get<ApiResponse<ErrorTrend>>(
      '/error-logs/trends',
      { params: { days } }
    );
    return response.data.data;
  },

  /**
   * Resolve error
   */
  resolveError: async (id: string, notes?: string): Promise<void> => {
    await apiClient.post(`/error-logs/${id}/resolve`, { notes });
  },

  /**
   * Delete error
   */
  deleteError: async (id: string): Promise<void> => {
    await apiClient.delete(`/error-logs/${id}`);
  },

  /**
   * Export logs
   */
  exportLogs: async (params: {
    format?: 'json' | 'csv' | 'txt';
    startDate?: string;
    endDate?: string;
    level?: string;
  }) => {
    const response = await apiClient.get<ApiResponse<{ fileUrl: string }>>(
      '/error-logs/export',
      { params }
    );
    return response.data.data;
  },

  /**
   * Get system logs
   */
  getSystemLogs: async (params: {
    level?: string;
    context?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<ApiResponse<{ data: any[]; meta: any }>>(
      '/error-logs/system-logs',
      { params }
    );
    // Response structure: { success: true, data: { data: [...], meta: {...} }, requestId: "..." }
    return {
      data: response.data.data.data,
      meta: response.data.data.meta,
    };
  },

  /**
   * Cleanup old errors
   */
  cleanupOldErrors: async (days: number = 30) => {
    const response = await apiClient.post<ApiResponse<{ deletedCount: number }>>(
      '/error-logs/cleanup',
      { days }
    );
    return response.data.data;
  },
};

