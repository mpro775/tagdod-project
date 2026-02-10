import { apiClient } from '@/core/api/client';
import { sanitizePaginationParams } from '@/shared/utils/formatters';
import type {
  Order,
  ListOrdersParams,
  ListRatingsParams,
  OrderRating,
  RatingsStats,
  UpdateOrderStatusDto,
  ShipOrderDto,
  RefundOrderDto,
  CancelOrderDto,
  AddOrderNotesDto,
  BulkOrderUpdateDto,
  OrderAnalyticsParams,
  OrderStats,
  OrderAnalytics,
  OrderTracking,
  RevenueAnalytics,
  PerformanceAnalytics,
  VerifyPaymentDto,
  OrdersFinancialReportResponse,
} from '../types/order.types';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/common.types';

export const ordersApi = {
  /**
   * List orders with pagination and filters
   */
  list: async (params: ListOrdersParams): Promise<PaginatedResponse<Order>> => {
    const response = await apiClient.get<
      ApiResponse<{
        orders: Order[];
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
        pagination?: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>
    >('/admin/orders', {
      params: sanitizePaginationParams(params),
    });

    const payload = response.data.data;
    const orders = Array.isArray(payload.orders) ? payload.orders : [];
    const pagination = payload.pagination ?? {
      page: payload.page ?? params.page ?? 1,
      limit: payload.limit ?? params.limit ?? orders.length ?? 0,
      total: payload.total ?? orders.length ?? 0,
      totalPages: payload.totalPages ?? 1,
    };

    return {
      data: orders,
      meta: {
        page: pagination.page ?? 1,
        limit: pagination.limit ?? orders.length ?? 0,
        total: pagination.total ?? orders.length ?? 0,
        totalPages: pagination.totalPages ?? 1,
      },
    };
  },

  /**
   * Get order by ID
   */
  getById: async (id: string): Promise<Order> => {
    const response = await apiClient.get<ApiResponse<Order | { order: Order }>>(
      `/admin/orders/${id}`
    );
    const payload = response.data.data;

    if (payload && typeof payload === 'object' && 'order' in payload) {
      return (payload as { order: Order }).order;
    }

    return payload as Order;
  },

  /**
   * Update order status
   */
  updateStatus: async (id: string, data: UpdateOrderStatusDto): Promise<Order> => {
    const response = await apiClient.patch<ApiResponse<Order>>(`/admin/orders/${id}/status`, data);
    return response.data.data;
  },

  /**
   * Ship order
   */
  ship: async (id: string, data: ShipOrderDto): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<Order>>(`/admin/orders/${id}/ship`, data);
    return response.data.data;
  },

  /**
   * Refund order
   */
  refund: async (id: string, data: RefundOrderDto): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<Order>>(`/admin/orders/${id}/refund`, data);
    return response.data.data;
  },

  /**
   * Cancel order
   */
  cancel: async (id: string, data: CancelOrderDto): Promise<Order> => {
    // لا يوجد مسار /admin/orders/:id/cancel في الـ Backend للإدارة،
    // لذلك نستخدم تحديث الحالة إلى "cancelled" مع حفظ سبب الإلغاء في notes.
    const payload: UpdateOrderStatusDto = {
      status: 'cancelled' as UpdateOrderStatusDto['status'],
      notes: data.reason,
    };
    const response = await apiClient.patch<ApiResponse<Order>>(
      `/admin/orders/${id}/status`,
      payload
    );
    return response.data.data;
  },

  /**
   * Add order notes
   */
  addNotes: async (id: string, data: AddOrderNotesDto): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<Order>>(`/admin/orders/${id}/notes`, data);
    return response.data.data;
  },

  /**
   * Bulk update orders status
   */
  bulkUpdateStatus: async (data: BulkOrderUpdateDto) => {
    const response = await apiClient.post<
      ApiResponse<{
        results: Array<{ orderId: string; success: boolean; order: Order }>;
        errors: Array<{ orderId: string; error: string }>;
      }>
    >('/admin/orders/bulk/update-status', data);
    return response.data.data;
  },

  /**
   * Get order analytics summary
   */
  getAnalytics: async (params: OrderAnalyticsParams): Promise<OrderAnalytics> => {
    const response = await apiClient.get<
      ApiResponse<{ analytics: OrderAnalytics; message?: string }>
    >('/admin/orders/analytics/summary', {
      params,
    });
    const payload = response.data.data;

    // Handle nested analytics object
    if (payload && typeof payload === 'object' && 'analytics' in payload) {
      const analytics = (payload as { analytics: OrderAnalytics }).analytics;
      // Transform ordersByStatus from MongoDB aggregation format (_id) to expected format (status)
      if (analytics.ordersByStatus) {
        analytics.ordersByStatus = analytics.ordersByStatus.map((item: any) => ({
          status: item._id || item.status,
          count: item.count,
        }));
      }
      return analytics;
    }

    return payload as OrderAnalytics;
  },

  /**
   * Get revenue analytics
   */
  getRevenueAnalytics: async (fromDate?: string, toDate?: string): Promise<RevenueAnalytics> => {
    const response = await apiClient.get<
      ApiResponse<{ analytics: RevenueAnalytics; message?: string }>
    >('/admin/orders/analytics/revenue', {
      params: { fromDate, toDate },
    });
    const payload = response.data.data;

    // Handle nested analytics object
    let analytics: any;
    if (payload && typeof payload === 'object' && 'analytics' in payload) {
      analytics = (payload as { analytics: any }).analytics;
    } else {
      analytics = payload;
    }

    // Transform topProducts to match expected format
    if (analytics && analytics.topProducts && Array.isArray(analytics.topProducts)) {
      analytics.topProducts = analytics.topProducts.map((product: any) => ({
        productId: product.productId,
        productName: product.name || product.productName,
        revenue: product.totalRevenue || product.revenue,
        orders: product.orderCount || product.orders,
      }));
    }

    // Transform revenueByPeriod if it's revenueByDay
    if (analytics && analytics.revenueByDay && !analytics.revenueByPeriod) {
      analytics.revenueByPeriod = analytics.revenueByDay.map((item: any) => ({
        period: item._id || item.period,
        revenue: item.revenue,
        orders: item.orders,
      }));
    }

    return analytics as RevenueAnalytics;
  },

  /**
   * Get performance analytics
   */
  getPerformanceAnalytics: async (): Promise<PerformanceAnalytics> => {
    const response = await apiClient.get<
      ApiResponse<{ analytics: PerformanceAnalytics; message?: string }>
    >('/admin/orders/analytics/performance');
    const payload = response.data.data;

    // Handle nested analytics object
    let analytics: any;
    if (payload && typeof payload === 'object' && 'analytics' in payload) {
      analytics = (payload as { analytics: any }).analytics;
    } else {
      analytics = payload;
    }

    // Transform field names to match expected format
    return {
      averageProcessingTime: analytics.averageProcessingTime ?? 0,
      averageShippingTime: analytics.averageShippingTime ?? 0,
      averageDeliveryTime: analytics.averageDeliveryTime ?? 0,
      cancellationRate: analytics.cancellationRate ?? 0,
      refundRate: analytics.returnRate ?? analytics.refundRate ?? 0,
      customerSatisfactionScore:
        analytics.customerSatisfaction ?? analytics.customerSatisfactionScore ?? 0,
    } as PerformanceAnalytics;
  },

  /**
   * Export order analytics
   */
  exportOrderAnalytics: async (
    format: string = 'csv',
    days?: number,
    fromDate?: string,
    toDate?: string
  ) => {
    const response = await apiClient.post<
      ApiResponse<{
        success?: boolean;
        data?: {
          fileUrl: string;
          format: string;
          exportedAt: string;
          fileName: string;
          recordCount: number;
          summary?: any;
        };
      }>
    >(
      '/admin/orders/analytics/export',
      {},
      {
        params: { format, days, fromDate, toDate },
      }
    );

    const payload = response.data.data;

    // Handle nested data structure (data.data.fileUrl)
    if (payload && typeof payload === 'object') {
      if (
        'data' in payload &&
        payload.data &&
        typeof payload.data === 'object' &&
        'fileUrl' in payload.data
      ) {
        return payload.data as {
          fileUrl: string;
          format: string;
          exportedAt: string;
          fileName: string;
          recordCount: number;
          summary?: any;
        };
      }
      if ('fileUrl' in payload) {
        return payload as {
          fileUrl: string;
          format: string;
          exportedAt: string;
          fileName: string;
          recordCount: number;
          summary?: any;
        };
      }
    }

    return payload as any;
  },

  /**
   * Export orders list
   */
  exportOrders: async (format: string = 'csv', params: ListOrdersParams) => {
    const response = await apiClient.post<ApiResponse<any>>(
      '/admin/orders/export',
      {},
      {
        params: { ...sanitizePaginationParams(params), format },
      }
    );
    return response.data.data;
  },

  /**
   * Generate orders report
   */
  generateOrdersReport: async (
    params: ListOrdersParams,
    format: 'json' | 'pdf' | 'excel' = 'json'
  ) => {
    const response = await apiClient.get<ApiResponse<any>>('/admin/orders/reports/orders', {
      params: { ...sanitizePaginationParams(params), format },
    });
    return response.data.data;
  },

  /**
   * التقرير المالي للطلبات — من GET /admin/orders/reports/financial.
   * أي واجهة تعرض هذا التقرير يجب أن تقرأ البيانات من result.report.
   */
  generateFinancialReport: async (): Promise<OrdersFinancialReportResponse> => {
    const response = await apiClient.get<ApiResponse<OrdersFinancialReportResponse>>(
      '/admin/orders/reports/financial'
    );
    return response.data.data as OrdersFinancialReportResponse;
  },

  /**
   * Get order tracking information
   */
  getTracking: async (id: string): Promise<OrderTracking> => {
    const response = await apiClient.get<ApiResponse<OrderTracking>>(`/admin/orders/${id}/track`);
    return response.data.data;
  },

  /**
   * Get order statistics
   */
  getStats: async (): Promise<OrderStats> => {
    const response =
      await apiClient.get<ApiResponse<OrderStats | { stats: OrderStats }>>('/admin/orders/stats');
    const payload = response.data.data;

    if (payload && typeof payload === 'object' && 'stats' in payload) {
      return (payload as { stats: OrderStats }).stats;
    }

    return payload as OrderStats;
  },

  /**
   * Verify local payment
   */
  verifyPayment: async (id: string, data: VerifyPaymentDto): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<Order>>(
      `/admin/orders/${id}/verify-payment`,
      data
    );
    return response.data.data;
  },

  /**
   * Manually send invoice to sales email
   */
  sendInvoice: async (
    id: string
  ): Promise<{
    success: boolean;
    message: string;
    invoiceNumber?: string;
    emailSent?: boolean;
    error?: string;
  }> => {
    const response = await apiClient.post<
      ApiResponse<{
        success: boolean;
        message: string;
        invoiceNumber?: string;
        emailSent?: boolean;
        error?: string;
      }>
    >(`/admin/orders/${id}/send-invoice`);
    return response.data.data;
  },

  /**
   * Get order ratings
   */
  getRatings: async (params: ListRatingsParams): Promise<PaginatedResponse<OrderRating>> => {
    const response = await apiClient.get<
      ApiResponse<{
        ratings: OrderRating[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>
    >('/admin/orders/ratings', {
      params: sanitizePaginationParams(params),
    });

    const payload = response.data.data;
    const ratings = Array.isArray(payload.ratings) ? payload.ratings : [];
    const pagination = payload.pagination ?? {
      page: params.page ?? 1,
      limit: params.limit ?? ratings.length ?? 0,
      total: ratings.length ?? 0,
      totalPages: 1,
    };

    return {
      data: ratings,
      meta: {
        page: pagination.page ?? 1,
        limit: pagination.limit ?? ratings.length ?? 0,
        total: pagination.total ?? ratings.length ?? 0,
        totalPages: pagination.totalPages ?? 1,
      },
    };
  },

  /**
   * Get ratings statistics
   */
  getRatingsStats: async (): Promise<RatingsStats> => {
    const response = await apiClient.get<ApiResponse<RatingsStats | { stats: RatingsStats }>>(
      '/admin/orders/ratings/stats'
    );
    const payload = response.data.data;

    if (payload && typeof payload === 'object' && 'stats' in payload) {
      return (payload as { stats: RatingsStats }).stats;
    }

    return payload as RatingsStats;
  },

  /**
   * Get out of stock orders
   */
  getOutOfStockOrders: async (params: ListOrdersParams): Promise<PaginatedResponse<Order>> => {
    const response = await apiClient.get<
      ApiResponse<{
        orders: Order[];
        pagination?: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>
    >('/admin/orders/out-of-stock', {
      params: sanitizePaginationParams(params),
    });

    const payload = response.data.data;
    const orders = Array.isArray(payload.orders) ? payload.orders : [];
    const pagination = payload.pagination ?? {
      page: params.page ?? 1,
      limit: params.limit ?? orders.length ?? 0,
      total: orders.length ?? 0,
      totalPages: 1,
    };

    return {
      data: orders,
      meta: {
        page: pagination.page ?? 1,
        limit: pagination.limit ?? orders.length ?? 0,
        total: pagination.total ?? orders.length ?? 0,
        totalPages: pagination.totalPages ?? 1,
      },
    };
  },

  /**
   * Get pending orders count for sidebar badge
   */
  getPendingCount: async (): Promise<{
    pendingCount: number;
    pendingPaymentCount: number;
    confirmedCount: number;
    processingCount: number;
  }> => {
    const response = await apiClient.get<
      ApiResponse<{
        pendingCount: number;
        pendingPaymentCount: number;
        confirmedCount: number;
        processingCount: number;
      }>
    >('/admin/orders/pending-count');
    return response.data.data;
  },
};
