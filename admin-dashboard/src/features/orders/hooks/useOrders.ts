import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/ordersApi';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import toast from 'react-hot-toast';
import type {
  ListOrdersParams,
  UpdateOrderStatusDto,
  ShipOrderDto,
  RefundOrderDto,
  CancelOrderDto,
  AddOrderNotesDto,
  BulkOrderUpdateDto,
  OrderAnalyticsParams,
  VerifyPaymentDto,
} from '../types/order.types';

const ORDERS_KEY = 'orders';

// List orders
export const useOrders = (params: ListOrdersParams) => {
  return useQuery({
    queryKey: [ORDERS_KEY, params],
    queryFn: () => ordersApi.list(params),
    placeholderData: (previousData) => previousData,
  });
};

// Get single order
export const useOrder = (id: string) => {
  return useQuery({
    queryKey: [ORDERS_KEY, id],
    queryFn: () => ordersApi.getById(id),
    enabled: !!id,
  });
};

// Update order status
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderStatusDto }) =>
      ordersApi.updateStatus(id, data),
    onSuccess: () => {
      toast.success('تم تحديث حالة الطلب بنجاح');
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Ship order
export const useShipOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ShipOrderDto }) => ordersApi.ship(id, data),
    onSuccess: () => {
      toast.success('تم شحن الطلب بنجاح');
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Refund order
export const useRefundOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RefundOrderDto }) => ordersApi.refund(id, data),
    onSuccess: () => {
      toast.success('تم استرداد المبلغ بنجاح');
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Cancel order
export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CancelOrderDto }) => ordersApi.cancel(id, data),
    onSuccess: () => {
      toast.success('تم إلغاء الطلب بنجاح');
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Add order notes
export const useAddOrderNotes = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddOrderNotesDto }) => ordersApi.addNotes(id, data),
    onSuccess: () => {
      toast.success('تم إضافة الملاحظات بنجاح');
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Bulk update orders status
export const useBulkUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkOrderUpdateDto) => ordersApi.bulkUpdateStatus(data),
    onSuccess: (data) => {
      const successCount = data.results.length;
      const errorCount = data.errors.length;
      toast.success(`تم تحديث ${successCount} طلب بنجاح${errorCount > 0 ? `، فشل ${errorCount} طلب` : ''}`);
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Get order analytics
export const useOrderAnalytics = (params: OrderAnalyticsParams) => {
  return useQuery({
    queryKey: [ORDERS_KEY, 'analytics', params],
    queryFn: () => ordersApi.getAnalytics(params),
  });
};

// Get revenue analytics
export const useRevenueAnalytics = (fromDate?: string, toDate?: string) => {
  return useQuery({
    queryKey: [ORDERS_KEY, 'revenue-analytics', fromDate, toDate],
    queryFn: () => ordersApi.getRevenueAnalytics(fromDate, toDate),
  });
};

// Get performance analytics
export const usePerformanceAnalytics = () => {
  return useQuery({
    queryKey: [ORDERS_KEY, 'performance-analytics'],
    queryFn: () => ordersApi.getPerformanceAnalytics(),
  });
};

// Get order tracking
export const useOrderTracking = (id: string) => {
  return useQuery({
    queryKey: [ORDERS_KEY, 'tracking', id],
    queryFn: () => ordersApi.getTracking(id),
    enabled: !!id,
  });
};

// Generate orders report
export const useGenerateOrdersReport = () => {
  return useMutation({
    mutationFn: ({ params, format }: { params: ListOrdersParams; format?: 'json' | 'pdf' | 'excel' }) =>
      ordersApi.generateOrdersReport(params, format),
    onSuccess: () => {
      toast.success('تم إنشاء التقرير بنجاح');
    },
    onError: ErrorHandler.showError,
  });
};

// Generate financial report
export const useGenerateFinancialReport = () => {
  return useMutation({
    mutationFn: () => ordersApi.generateFinancialReport(),
    onSuccess: () => {
      toast.success('تم إنشاء التقرير المالي بنجاح');
    },
    onError: ErrorHandler.showError,
  });
};

// Export order analytics
export const useExportOrderAnalytics = () => {
  return useMutation({
    mutationFn: ({
      format,
      days,
      fromDate,
      toDate,
    }: {
      format?: string;
      days?: number;
      fromDate?: string;
      toDate?: string;
    }) => ordersApi.exportOrderAnalytics(format || 'csv', days, fromDate, toDate),
    onSuccess: (data) => {
      toast.success('تم تصدير البيانات بنجاح');
      if (data?.fileUrl) {
        window.open(data.fileUrl, '_blank');
      }
    },
    onError: ErrorHandler.showError,
  });
};

// Export orders list
export const useExportOrders = () => {
  return useMutation({
    mutationFn: ({ format, params }: { format?: string; params: ListOrdersParams }) =>
      ordersApi.exportOrders(format || 'csv', params),
    onSuccess: (data) => {
      toast.success('تم تصدير قائمة الطلبات بنجاح');
      if (data?.fileUrl) {
        window.open(data.fileUrl, '_blank');
      }
    },
    onError: ErrorHandler.showError,
  });
};

// Get stats
export const useOrderStats = () => {
  return useQuery({
    queryKey: [ORDERS_KEY, 'stats'],
    queryFn: () => ordersApi.getStats(),
  });
};

// Verify payment
export const useVerifyPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VerifyPaymentDto }) =>
      ordersApi.verifyPayment(id, data),
    onSuccess: (data) => {
      const message = data.paymentStatus === 'paid' 
        ? 'تم قبول الدفع بنجاح' 
        : 'تم رفض الدفع - المبلغ غير كافٍ';
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};