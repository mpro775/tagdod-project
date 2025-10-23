import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { auditApi } from '../api/auditApi';
import {
  AuditLog,
  AuditLogsResponse,
  AuditStatsResponse,
  AuditLogFilters,
  AuditAction,
  AuditResource,
} from '../types/audit.types';

// Query keys
export const AUDIT_QUERY_KEYS = {
  logs: (filters: AuditLogFilters) => ['audit', 'logs', filters] as const,
  stats: (startDate?: string, endDate?: string) => ['audit', 'stats', startDate, endDate] as const,
  actions: ['audit', 'actions'] as const,
  resources: ['audit', 'resources'] as const,
};

// Hook for audit logs
export const useAuditLogs = (filters: AuditLogFilters = {}) => {
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
  });

  const queryFilters = {
    ...filters,
    skip: (pagination.page - 1) * pagination.limit,
    limit: pagination.limit,
  };

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: AUDIT_QUERY_KEYS.logs(queryFilters),
    queryFn: () => auditApi.getAuditLogs(queryFilters),
    staleTime: 30000, // 30 seconds
    retry: 2,
  });

  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const handleLimitChange = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  return {
    logs: response?.data || [],
    meta: response?.meta,
    isLoading,
    error,
    refetch,
    pagination,
    handlePageChange,
    handleLimitChange,
  };
};

// Hook for audit statistics
export const useAuditStats = (startDate?: string, endDate?: string) => {
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: AUDIT_QUERY_KEYS.stats(startDate, endDate),
    queryFn: () => auditApi.getAuditStats(startDate, endDate),
    staleTime: 60000, // 1 minute
    retry: 2,
  });

  return {
    stats: response?.data,
    isLoading,
    error,
    refetch,
  };
};

// Hook for audit actions
export const useAuditActions = () => {
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: AUDIT_QUERY_KEYS.actions,
    queryFn: () => auditApi.getAuditActions(),
    staleTime: 300000, // 5 minutes
    retry: 2,
  });

  return {
    actions: response?.data || [],
    isLoading,
    error,
  };
};

// Hook for audit resources
export const useAuditResources = () => {
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: AUDIT_QUERY_KEYS.resources,
    queryFn: () => auditApi.getAuditResources(),
    staleTime: 300000, // 5 minutes
    retry: 2,
  });

  return {
    resources: response?.data || [],
    isLoading,
    error,
  };
};

// Hook for audit log details
export const useAuditLogDetails = (id: string) => {
  const {
    data: log,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['audit', 'log', id],
    queryFn: () => auditApi.getAuditLogById(id),
    enabled: !!id,
    staleTime: 300000, // 5 minutes
    retry: 2,
  });

  return {
    log,
    isLoading,
    error,
  };
};

// Hook for audit log export
export const useAuditExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportLogs = useCallback(async (filters: AuditLogFilters = {}) => {
    try {
      setIsExporting(true);
      const blob = await auditApi.exportAuditLogs(filters);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('تم تصدير سجلات التدقيق بنجاح');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('فشل في تصدير سجلات التدقيق');
    } finally {
      setIsExporting(false);
    }
  }, []);

  return {
    exportLogs,
    isExporting,
  };
};

// Hook for audit filters management
export const useAuditFilters = () => {
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [dateRange, setDateRange] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});

  const updateFilters = useCallback((newFilters: Partial<AuditLogFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const updateDateRange = useCallback((startDate?: string, endDate?: string) => {
    setDateRange({ startDate, endDate });
    setFilters(prev => ({ ...prev, startDate, endDate }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setDateRange({});
  }, []);

  const hasActiveFilters = Object.keys(filters).length > 0;

  return {
    filters,
    dateRange,
    updateFilters,
    updateDateRange,
    clearFilters,
    hasActiveFilters,
  };
};

// Hook for audit log refresh
export const useAuditRefresh = () => {
  const queryClient = useQueryClient();

  const refreshLogs = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['audit', 'logs'] });
  }, [queryClient]);

  const refreshStats = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['audit', 'stats'] });
  }, [queryClient]);

  const refreshAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['audit'] });
  }, [queryClient]);

  return {
    refreshLogs,
    refreshStats,
    refreshAll,
  };
};
