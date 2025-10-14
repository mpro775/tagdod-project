import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsApi } from '../api/analyticsApi';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import toast from 'react-hot-toast';
import type {
  AnalyticsQueryDto,
  ReportGenerationDto,
  ExportReportDto,
  ListReportsParams,
} from '../types/analytics.types';

const ANALYTICS_KEY = 'analytics';

// ==================== Dashboard ====================

export const useDashboard = (params: AnalyticsQueryDto = {}) => {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'dashboard', params],
    queryFn: () => analyticsApi.getDashboard(params),
  });
};

export const useOverview = (params: AnalyticsQueryDto = {}) => {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'overview', params],
    queryFn: () => analyticsApi.getOverview(params),
  });
};

export const useKPIs = (params: AnalyticsQueryDto = {}) => {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'kpis', params],
    queryFn: () => analyticsApi.getKPIs(params),
  });
};

// ==================== Charts ====================

export const useRevenueAnalytics = (params: AnalyticsQueryDto = {}) => {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'revenue', params],
    queryFn: () => analyticsApi.getRevenueAnalytics(params),
  });
};

export const useUserAnalytics = (params: AnalyticsQueryDto = {}) => {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'users', params],
    queryFn: () => analyticsApi.getUserAnalytics(params),
  });
};

export const useProductAnalytics = (params: AnalyticsQueryDto = {}) => {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'products', params],
    queryFn: () => analyticsApi.getProductAnalytics(params),
  });
};

export const useServiceAnalytics = (params: AnalyticsQueryDto = {}) => {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'services', params],
    queryFn: () => analyticsApi.getServiceAnalytics(params),
  });
};

export const useSupportAnalytics = (params: AnalyticsQueryDto = {}) => {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'support', params],
    queryFn: () => analyticsApi.getSupportAnalytics(params),
  });
};

// ==================== Performance ====================

export const usePerformanceMetrics = () => {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'performance'],
    queryFn: () => analyticsApi.getPerformanceMetrics(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useRefreshAnalytics = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => analyticsApi.refreshAnalytics(),
    onSuccess: () => {
      toast.success('تم تحديث البيانات بنجاح');
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// ==================== Reports ====================

export const useGenerateReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReportGenerationDto) => analyticsApi.generateReport(data),
    onSuccess: () => {
      toast.success('تم إنشاء التقرير بنجاح');
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_KEY, 'reports'] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useReport = (id: string) => {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'reports', id],
    queryFn: () => analyticsApi.getReport(id),
    enabled: !!id,
  });
};

// ==================== Trends ====================

export const useMetricTrends = (metric: string, period?: string, days?: number) => {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'trends', metric, period, days],
    queryFn: () => analyticsApi.getMetricTrends(metric, period as any, days),
    enabled: !!metric,
  });
};

// ==================== Comparison ====================

export const useComparePeriods = (
  currentStart: string,
  currentEnd: string,
  previousStart: string,
  previousEnd: string
) => {
  return useQuery({
    queryKey: [
      ANALYTICS_KEY,
      'comparison',
      currentStart,
      currentEnd,
      previousStart,
      previousEnd,
    ],
    queryFn: () =>
      analyticsApi.comparePeriods(
        currentStart,
        currentEnd,
        previousStart,
        previousEnd
      ),
    enabled: !!(currentStart && currentEnd && previousStart && previousEnd),
  });
};

// ==================== Export ====================

export const useExportData = () => {
  return useMutation({
    mutationFn: ({
      format,
      type,
      period,
    }: {
      format: string;
      type: string;
      period?: string;
    }) => analyticsApi.exportData(format, type, period as any),
    onSuccess: (data) => {
      toast.success('تم التصدير بنجاح');
      if (data.fileUrl) {
        window.open(data.fileUrl, '_blank');
      }
    },
    onError: ErrorHandler.showError,
  });
};

// ==================== Advanced Analytics ====================

export const useSalesAnalytics = (params: any = {}) => {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'advanced', 'sales', params],
    queryFn: () => analyticsApi.getSalesAnalytics(params),
  });
};

export const useProductPerformance = (params: any = {}) => {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'advanced', 'products', params],
    queryFn: () => analyticsApi.getProductPerformance(params),
  });
};

export const useCustomerAnalytics = (params: any = {}) => {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'advanced', 'customers', params],
    queryFn: () => analyticsApi.getCustomerAnalytics(params),
  });
};

export const useInventoryReport = (params: any = {}) => {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'advanced', 'inventory', params],
    queryFn: () => analyticsApi.getInventoryReport(params),
  });
};

export const useFinancialReport = (params: any = {}) => {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'advanced', 'financial', params],
    queryFn: () => analyticsApi.getFinancialReport(params),
  });
};

export const useCartAnalytics = (params: any = {}) => {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'advanced', 'cart', params],
    queryFn: () => analyticsApi.getCartAnalytics(params),
  });
};

export const useMarketingReport = (params: any = {}) => {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'advanced', 'marketing', params],
    queryFn: () => analyticsApi.getMarketingReport(params),
  });
};

export const useRealTimeMetrics = () => {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'realtime'],
    queryFn: () => analyticsApi.getRealTimeMetrics(),
    refetchInterval: 10000, // Refresh every 10 seconds
  });
};

export const useQuickStats = () => {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'quick-stats'],
    queryFn: () => analyticsApi.getQuickStats(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

// ==================== Advanced Reports ====================

export const useGenerateAdvancedReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => analyticsApi.generateAdvancedReport(data),
    onSuccess: () => {
      toast.success('تم إنشاء التقرير بنجاح');
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_KEY, 'advanced', 'reports'] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useAdvancedReports = (params: ListReportsParams = {}) => {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'advanced', 'reports', params],
    queryFn: () => analyticsApi.listAdvancedReports(params),
  });
};

export const useAdvancedReport = (reportId: string) => {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'advanced', 'reports', reportId],
    queryFn: () => analyticsApi.getAdvancedReport(reportId),
    enabled: !!reportId,
  });
};

export const useArchiveReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reportId: string) => analyticsApi.archiveReport(reportId),
    onSuccess: () => {
      toast.success('تم أرشفة التقرير بنجاح');
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_KEY, 'advanced', 'reports'] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useDeleteReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reportId: string) => analyticsApi.deleteReport(reportId),
    onSuccess: () => {
      toast.success('تم حذف التقرير بنجاح');
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_KEY, 'advanced', 'reports'] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useExportReport = () => {
  return useMutation({
    mutationFn: ({ reportId, data }: { reportId: string; data: ExportReportDto }) =>
      analyticsApi.exportReport(reportId, data),
    onSuccess: (response) => {
      toast.success('تم تصدير التقرير بنجاح');
      if (response.data?.fileUrl) {
        window.open(response.data.fileUrl, '_blank');
      }
    },
    onError: ErrorHandler.showError,
  });
};

// ==================== Export Functions ====================

export const useExportSalesData = () => {
  return useMutation({
    mutationFn: ({
      format,
      startDate,
      endDate,
    }: {
      format: string;
      startDate: string;
      endDate: string;
    }) => analyticsApi.exportSalesData(format, startDate, endDate),
    onSuccess: (response) => {
      toast.success('تم تصدير البيانات بنجاح');
      if (response.data?.fileUrl) {
        window.open(response.data.fileUrl, '_blank');
      }
    },
    onError: ErrorHandler.showError,
  });
};

export const useExportProductsData = () => {
  return useMutation({
    mutationFn: ({
      format,
      startDate,
      endDate,
    }: {
      format: string;
      startDate?: string;
      endDate?: string;
    }) => analyticsApi.exportProductsData(format, startDate, endDate),
    onSuccess: (response) => {
      toast.success('تم تصدير البيانات بنجاح');
      if (response.data?.fileUrl) {
        window.open(response.data.fileUrl, '_blank');
      }
    },
    onError: ErrorHandler.showError,
  });
};

export const useExportCustomersData = () => {
  return useMutation({
    mutationFn: ({
      format,
      startDate,
      endDate,
    }: {
      format: string;
      startDate?: string;
      endDate?: string;
    }) => analyticsApi.exportCustomersData(format, startDate, endDate),
    onSuccess: (response) => {
      toast.success('تم تصدير البيانات بنجاح');
      if (response.data?.fileUrl) {
        window.open(response.data.fileUrl, '_blank');
      }
    },
    onError: ErrorHandler.showError,
  });
};

