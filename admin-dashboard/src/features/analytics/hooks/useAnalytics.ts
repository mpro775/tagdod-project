import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsApi } from '../api/analyticsApi';
import { analyticsQueryKeys } from '../utils/analyticsQueryKeys';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import toast from 'react-hot-toast';
import type {
  AnalyticsQueryDto,
  ReportGenerationDto,
  ExportReportDto,
  ListReportsParams,
  PeriodType,
  GenerateAdvancedReportDto,
  CreateReportScheduleDto,
  UpdateReportScheduleDto,
  ListSchedulesParams,
} from '../types/analytics.types';
import type { ExportFilesParams } from '../types/exports';

// ==================== Dashboard ====================

export const useDashboard = (params: AnalyticsQueryDto = {}) => {
  return useQuery({
    queryKey: analyticsQueryKeys.dashboard(params),
    queryFn: () => analyticsApi.getDashboard(params),
  });
};

export const useOverview = (params: AnalyticsQueryDto = {}) => {
  return useQuery({
    queryKey: analyticsQueryKeys.overview(params),
    queryFn: () => analyticsApi.getOverview(params),
  });
};

export const useKPIs = (params: AnalyticsQueryDto = {}) => {
  return useQuery({
    queryKey: analyticsQueryKeys.kpis(params),
    queryFn: () => analyticsApi.getKPIs(params),
  });
};

// ==================== Charts ====================

export const useRevenueAnalytics = (params: AnalyticsQueryDto = {}) => {
  return useQuery({
    queryKey: analyticsQueryKeys.revenue(params),
    queryFn: () => analyticsApi.getRevenueAnalytics(params),
  });
};

export const useUserAnalytics = (params: AnalyticsQueryDto = {}) => {
  return useQuery({
    queryKey: analyticsQueryKeys.users(params),
    queryFn: () => analyticsApi.getUserAnalytics(params),
  });
};

export const useProductAnalytics = (params: AnalyticsQueryDto = {}) => {
  return useQuery({
    queryKey: analyticsQueryKeys.products(params),
    queryFn: () => analyticsApi.getProductAnalytics(params),
  });
};

export const useServiceAnalytics = (params: AnalyticsQueryDto = {}) => {
  return useQuery({
    queryKey: analyticsQueryKeys.services(params),
    queryFn: () => analyticsApi.getServiceAnalytics(params),
  });
};

export const useSupportAnalytics = (params: AnalyticsQueryDto = {}) => {
  return useQuery({
    queryKey: analyticsQueryKeys.support(params),
    queryFn: () => analyticsApi.getSupportAnalytics(params),
  });
};

// ==================== Performance ====================

export const usePerformanceMetrics = () => {
  return useQuery({
    queryKey: analyticsQueryKeys.performance(),
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
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useClearCache = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => analyticsApi.clearCache(),
    onSuccess: () => {
      toast.success('تم مسح ذاكرة التخزين المؤقت بنجاح');
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: ErrorHandler.showError,
  });
};

// ==================== Reports ====================

/**
 * @deprecated Use useGenerateAdvancedReport or createSchedule instead
 */
export const useGenerateReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReportGenerationDto) => analyticsApi.generateReport(data),
    onSuccess: () => {
      toast.success('تم إنشاء التقرير بنجاح');
      queryClient.invalidateQueries({ queryKey: analyticsQueryKeys.reports() });
    },
    onError: ErrorHandler.showError,
  });
};

export const useReport = (id: string) => {
  return useQuery({
    queryKey: analyticsQueryKeys.report(id),
    queryFn: () => analyticsApi.getReport(id),
    enabled: !!id,
  });
};

// ==================== Trends ====================

export const useMetricTrends = (metric: string, period?: string, days?: number) => {
  return useQuery({
    queryKey: ['analytics', 'trends', metric, period, days],
    queryFn: () => analyticsApi.getMetricTrends(metric, period as PeriodType, days),
    enabled: !!metric,
  });
};

export const useMetricTrendsAdvanced = (
  metric: string,
  startDate: string,
  endDate: string,
  groupBy?: string
) => {
  return useQuery({
    queryKey: ['analytics', 'trends', 'advanced', metric, startDate, endDate, groupBy],
    queryFn: () => analyticsApi.getMetricTrendsAdvanced(metric, startDate, endDate, groupBy),
    enabled: !!(metric && startDate && endDate),
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
      'analytics',
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      format,
      type,
      period,
    }: {
      format: string;
      type: string;
      period?: string;
    }) => analyticsApi.exportData(format, type, period as PeriodType),
    onSuccess: (data) => {
      toast.success('تم التصدير بنجاح');
      if (data.fileUrl) {
        window.open(data.fileUrl, '_blank', 'noopener,noreferrer');
      }
      queryClient.invalidateQueries({ queryKey: ['exportedFiles'] });
      queryClient.invalidateQueries({ queryKey: analyticsQueryKeys.reports() });
    },
    onError: ErrorHandler.showError,
  });
};

// ==================== Advanced Analytics ====================

export const useSalesAnalytics = (params: Record<string, unknown> = {}) => {
  return useQuery({
    queryKey: analyticsQueryKeys.advancedSales(params),
    queryFn: () => analyticsApi.getSalesAnalytics(params),
  });
};

export const useProductPerformance = (params: Record<string, unknown> = {}) => {
  return useQuery({
    queryKey: analyticsQueryKeys.advancedProducts(params),
    queryFn: () => analyticsApi.getProductPerformance(params),
  });
};

export const useCustomerAnalytics = (params: Record<string, unknown> = {}) => {
  return useQuery({
    queryKey: analyticsQueryKeys.advancedCustomers(params),
    queryFn: () => analyticsApi.getCustomerAnalytics(params),
  });
};

export const useInventoryReport = (params: Record<string, unknown> = {}) => {
  return useQuery({
    queryKey: analyticsQueryKeys.advancedInventory(params),
    queryFn: () => analyticsApi.getInventoryReport(params),
  });
};

export const useFinancialReport = (params: Record<string, unknown> = {}) => {
  return useQuery({
    queryKey: analyticsQueryKeys.advancedFinancial(params),
    queryFn: () => analyticsApi.getFinancialReport(params),
  });
};

export const useCartAnalytics = (params: Record<string, unknown> = {}) => {
  return useQuery({
    queryKey: analyticsQueryKeys.advancedCart(params),
    queryFn: () => analyticsApi.getCartAnalytics(params),
  });
};

export const useMarketingReport = (params: Record<string, unknown> = {}) => {
  return useQuery({
    queryKey: analyticsQueryKeys.advancedMarketing(params),
    queryFn: () => analyticsApi.getMarketingReport(params),
  });
};

export const useRealTimeMetrics = () => {
  return useQuery({
    queryKey: analyticsQueryKeys.realtime(),
    queryFn: () => analyticsApi.getRealTimeMetrics(),
    refetchInterval: 10000, // Refresh every 10 seconds
  });
};

export const useQuickStats = () => {
  return useQuery({
    queryKey: analyticsQueryKeys.quickStats(),
    queryFn: () => analyticsApi.getQuickStats(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

// ==================== Advanced Reports ====================

export const useGenerateAdvancedReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GenerateAdvancedReportDto) => analyticsApi.generateAdvancedReport(data),
    onSuccess: () => {
      toast.success('تم إنشاء التقرير بنجاح');
      queryClient.invalidateQueries({ queryKey: analyticsQueryKeys.reports() });
    },
    onError: ErrorHandler.showError,
  });
};

/**
 * @deprecated Use useGenerateAdvancedReport or createSchedule instead
 */
export const useScheduleReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReportScheduleDto) => analyticsApi.scheduleReport(data),
    onSuccess: () => {
      toast.success('تم جدولة التقرير بنجاح');
      queryClient.invalidateQueries({ queryKey: analyticsQueryKeys.reports() });
    },
    onError: ErrorHandler.showError,
  });
};

export const useAdvancedReports = (params: ListReportsParams = {}) => {
  return useQuery({
    queryKey: analyticsQueryKeys.reports(params),
    queryFn: () => analyticsApi.listAdvancedReports(params),
  });
};

export const useAdvancedReport = (reportId: string) => {
  return useQuery({
    queryKey: analyticsQueryKeys.report(reportId),
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
      queryClient.invalidateQueries({ queryKey: analyticsQueryKeys.reports() });
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
      queryClient.invalidateQueries({ queryKey: analyticsQueryKeys.reports() });
    },
    onError: ErrorHandler.showError,
  });
};

export const useExportReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reportId, data }: { reportId: string; data: ExportReportDto }) =>
      analyticsApi.exportReport(reportId, data),
    onSuccess: (result, variables) => {
      toast.success('تم تصدير التقرير بنجاح');
      if (result?.fileUrl) {
        window.open(result.fileUrl, '_blank', 'noopener,noreferrer');
      }
      queryClient.invalidateQueries({ queryKey: ['exportedFiles'] });
      queryClient.invalidateQueries({ queryKey: analyticsQueryKeys.report(variables.reportId) });
      queryClient.invalidateQueries({ queryKey: analyticsQueryKeys.reports() });
    },
    onError: ErrorHandler.showError,
  });
};

// ==================== Export Functions ====================

export const useExportSalesData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: analyticsApi.exportSalesData,
    onSuccess: (result) => {
      toast.success('تم تصدير البيانات بنجاح');
      if (result?.fileUrl) {
        window.open(result.fileUrl, '_blank', 'noopener,noreferrer');
      }
      queryClient.invalidateQueries({ queryKey: ['exportedFiles'] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useExportProductsData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: analyticsApi.exportProductsData,
    onSuccess: (result) => {
      toast.success('تم تصدير البيانات بنجاح');
      if (result?.fileUrl) {
        window.open(result.fileUrl, '_blank', 'noopener,noreferrer');
      }
      queryClient.invalidateQueries({ queryKey: ['exportedFiles'] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useExportCustomersData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: analyticsApi.exportCustomersData,
    onSuccess: (result) => {
      toast.success('تم تصدير البيانات بنجاح');
      if (result?.fileUrl) {
        window.open(result.fileUrl, '_blank', 'noopener,noreferrer');
      }
      queryClient.invalidateQueries({ queryKey: ['exportedFiles'] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useExportInventoryData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: analyticsApi.exportInventoryData,
    onSuccess: (result) => {
      toast.success('تم تصدير البيانات بنجاح');
      if (result?.fileUrl) {
        window.open(result.fileUrl, '_blank', 'noopener,noreferrer');
      }
      queryClient.invalidateQueries({ queryKey: ['exportedFiles'] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useExportFinancialData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: analyticsApi.exportFinancialData,
    onSuccess: (result) => {
      toast.success('تم تصدير البيانات بنجاح');
      if (result?.fileUrl) {
        window.open(result.fileUrl, '_blank', 'noopener,noreferrer');
      }
      queryClient.invalidateQueries({ queryKey: ['exportedFiles'] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useExportMarketingData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: analyticsApi.exportMarketingData,
    onSuccess: (result) => {
      toast.success('تم تصدير البيانات بنجاح');
      if (result?.fileUrl) {
        window.open(result.fileUrl, '_blank', 'noopener,noreferrer');
      }
      queryClient.invalidateQueries({ queryKey: ['exportedFiles'] });
    },
    onError: ErrorHandler.showError,
  });
};

// ==================== Export Center ====================

export const useExportedFiles = (params: ExportFilesParams = {}) => {
  return useQuery({
    queryKey: ['exportedFiles', params],
    queryFn: () => analyticsApi.getExportedFiles(params),
  });
};

// ==================== Report Schedules ====================

export const useSchedules = (params: ListSchedulesParams = {}) => {
  return useQuery({
    queryKey: analyticsQueryKeys.schedules(params),
    queryFn: () => analyticsApi.listSchedules(params),
  });
};

export const useSchedule = (id: string) => {
  return useQuery({
    queryKey: analyticsQueryKeys.schedule(id),
    queryFn: () => analyticsApi.getSchedule(id),
    enabled: !!id,
  });
};

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReportScheduleDto) => analyticsApi.createSchedule(data),
    onSuccess: () => {
      toast.success('تم إنشاء الجدولة بنجاح');
      queryClient.invalidateQueries({ queryKey: analyticsQueryKeys.schedules() });
    },
    onError: ErrorHandler.showError,
  });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReportScheduleDto }) =>
      analyticsApi.updateSchedule(id, data),
    onSuccess: () => {
      toast.success('تم تحديث الجدولة بنجاح');
      queryClient.invalidateQueries({ queryKey: analyticsQueryKeys.schedules() });
    },
    onError: ErrorHandler.showError,
  });
};

export const useToggleSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      analyticsApi.toggleSchedule(id, isActive),
    onSuccess: () => {
      toast.success('تم تحديث الحالة');
      queryClient.invalidateQueries({ queryKey: analyticsQueryKeys.schedules() });
    },
    onError: ErrorHandler.showError,
  });
};

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => analyticsApi.deleteSchedule(id),
    onSuccess: () => {
      toast.success('تم حذف الجدولة بنجاح');
      queryClient.invalidateQueries({ queryKey: analyticsQueryKeys.schedules() });
    },
    onError: ErrorHandler.showError,
  });
};

export const useRunScheduleNow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => analyticsApi.runScheduleNow(id),
    onSuccess: () => {
      toast.success('تم تشغيل الجدولة بنجاح');
      queryClient.invalidateQueries({ queryKey: analyticsQueryKeys.schedules() });
    },
    onError: ErrorHandler.showError,
  });
};

export const usePauseSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => analyticsApi.pauseSchedule(id),
    onSuccess: () => {
      toast.success('تم إيقاف الجدولة');
      queryClient.invalidateQueries({ queryKey: analyticsQueryKeys.schedules() });
    },
    onError: ErrorHandler.showError,
  });
};

export const useResumeSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => analyticsApi.resumeSchedule(id),
    onSuccess: () => {
      toast.success('تم استئناف الجدولة');
      queryClient.invalidateQueries({ queryKey: analyticsQueryKeys.schedules() });
    },
    onError: ErrorHandler.showError,
  });
};

export const useScheduleStats = () => {
  return useQuery({
    queryKey: analyticsQueryKeys.scheduleStats(),
    queryFn: () => analyticsApi.getScheduleStats(),
  });
};
