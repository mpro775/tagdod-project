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
} from '../types/order.types';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/common.types';

export const ordersApi = {
  /**
   * List orders with pagination and filters
   */
  list: async (params: ListOrdersParams): Promise<PaginatedResponse<Order>> => {
    const response = await apiClient.get<ApiResponse<{
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
    }>>('/admin/orders', {
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
    const response = await apiClient.get<ApiResponse<Order | { order: Order }>>(`/admin/orders/${id}`);
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
    const response = await apiClient.post<ApiResponse<Order>>(`/admin/orders/${id}/cancel`, data);
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
    const response = await apiClient.post<ApiResponse<{
      results: Array<{ orderId: string; success: boolean; order: Order }>;
      errors: Array<{ orderId: string; error: string }>;
    }>>('/admin/orders/bulk/update-status', data);
    return response.data.data;
  },

  /**
   * Get order analytics summary
   */
  getAnalytics: async (params: OrderAnalyticsParams): Promise<OrderAnalytics> => {
    const response = await apiClient.get<ApiResponse<OrderAnalytics>>('/admin/orders/analytics/summary', {
      params,
    });
    return response.data.data;
  },

  /**
   * Get revenue analytics
   */
  getRevenueAnalytics: async (fromDate?: string, toDate?: string): Promise<RevenueAnalytics> => {
    const response = await apiClient.get<ApiResponse<RevenueAnalytics>>('/admin/orders/analytics/revenue', {
      params: { fromDate, toDate },
    });
    return response.data.data;
  },

  /**
   * Get performance analytics
   */
  getPerformanceAnalytics: async (): Promise<PerformanceAnalytics> => {
    const response = await apiClient.get<ApiResponse<PerformanceAnalytics>>('/admin/orders/analytics/performance');
    return response.data.data;
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
    const response = await apiClient.post<ApiResponse<any>>(
      '/admin/orders/analytics/export',
      {},
      {
        params: { format, days, fromDate, toDate },
      }
    );
    return response.data.data;
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
  generateOrdersReport: async (params: ListOrdersParams, format: 'json' | 'pdf' | 'excel' = 'json') => {
    const response = await apiClient.get<ApiResponse<any>>('/admin/orders/reports/orders', {
      params: { ...sanitizePaginationParams(params), format },
    });
    return response.data.data;
  },

  /**
   * Generate financial report
   */
  generateFinancialReport: async () => {
    const response = await apiClient.get<ApiResponse<any>>('/admin/orders/reports/financial');
    return response.data.data;
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
    const response = await apiClient.get<ApiResponse<OrderStats | { stats: OrderStats }>>('/admin/orders/stats');
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
    const response = await apiClient.post<ApiResponse<Order>>(`/admin/orders/${id}/verify-payment`, data);
    return response.data.data;
  },

  /**
   * Get order ratings
   */
  getRatings: async (params: ListRatingsParams): Promise<PaginatedResponse<OrderRating>> => {
    const response = await apiClient.get<ApiResponse<{
      ratings: OrderRating[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>>('/admin/orders/ratings', {
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
};
