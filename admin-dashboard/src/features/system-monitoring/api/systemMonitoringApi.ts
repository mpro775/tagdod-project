import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/shared/types/common.types';

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  databaseStatus: {
    connected: boolean;
    responseTime: number;
    collections: number;
    totalSize: number;
  };
  redisStatus: {
    connected: boolean;
    responseTime: number;
    memoryUsage: number;
    hitRate: number;
  };
  avgApiResponseTime: number;
  activeRequests: number;
  errorRate: number;
  lastUpdated: Date;
}

export interface ResourceUsage {
  timestamp: Date;
  cpu: {
    usage: number;
    cores: number;
    load: number[];
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usagePercentage: number;
    heapUsed: number;
    heapTotal: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usagePercentage: number;
  };
}

export interface SystemAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  category: string;
  message: string;
  details: string;
  timestamp: Date;
  resolved: boolean;
}

export interface MetricsHistory {
  metricType: string;
  data: Array<{
    timestamp: Date;
    value: number;
    metadata?: Record<string, any>;
  }>;
  statistics: {
    min: number;
    max: number;
    avg: number;
    current: number;
  };
}

export const systemMonitoringApi = {
  /**
   * Get system health overview
   */
  getSystemHealth: async (): Promise<SystemHealth> => {
    const response = await apiClient.get<ApiResponse<SystemHealth>>(
      '/system-monitoring/health'
    );
    return response.data.data;
  },

  /**
   * Get resource usage
   */
  getResourceUsage: async (): Promise<ResourceUsage> => {
    const response = await apiClient.get<ApiResponse<ResourceUsage>>(
      '/system-monitoring/resources'
    );
    return response.data.data;
  },

  /**
   * Get database metrics
   */
  getDatabaseMetrics: async () => {
    const response = await apiClient.get<ApiResponse<any>>(
      '/system-monitoring/database'
    );
    return response.data.data;
  },

  /**
   * Get Redis metrics
   */
  getRedisMetrics: async () => {
    const response = await apiClient.get<ApiResponse<any>>(
      '/system-monitoring/redis'
    );
    return response.data.data;
  },

  /**
   * Get API performance metrics
   */
  getApiPerformance: async () => {
    const response = await apiClient.get<ApiResponse<any>>(
      '/system-monitoring/api-performance'
    );
    return response.data.data;
  },

  /**
   * Get metrics history
   */
  getMetricsHistory: async (params: {
    metricType?: string;
    timeRange?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<MetricsHistory> => {
    const response = await apiClient.get<ApiResponse<MetricsHistory>>(
      '/system-monitoring/metrics/history',
      { params }
    );
    return response.data.data;
  },

  /**
   * Get system alerts
   */
  getSystemAlerts: async () => {
    const response = await apiClient.get<ApiResponse<{
      alerts: SystemAlert[];
      activeAlertsCount: number;
      criticalAlertsCount: number;
    }>>('/system-monitoring/alerts');
    return response.data.data;
  },

  /**
   * Resolve alert
   */
  resolveAlert: async (id: string) => {
    const response = await apiClient.post<ApiResponse<any>>(
      `/system-monitoring/alerts/${id}/resolve`
    );
    return response.data.data;
  },

  /**
   * Get system overview (all metrics in one call)
   */
  getSystemOverview: async () => {
    const response = await apiClient.get<ApiResponse<any>>(
      '/system-monitoring/overview'
    );
    return response.data.data;
  },
};

