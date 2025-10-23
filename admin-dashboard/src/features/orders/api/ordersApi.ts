import { apiClient } from '@/core/api/client';
import { sanitizePaginationParams } from '@/shared/utils/formatters';
import type {
  Order,
  ListOrdersParams,
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
} from '../types/order.types';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/common.types';

export const ordersApi = {
  /**
   * List orders with pagination and filters
   */
  list: async (params: ListOrdersParams): Promise<PaginatedResponse<Order>> => {
    const response = await apiClient.get<PaginatedResponse<Order>>('/admin/orders', {
      params: sanitizePaginationParams(params),
    });
    return response.data;
  },

  /**
   * Get order by ID
   */
  getById: async (id: string): Promise<Order> => {
    const response = await apiClient.get<ApiResponse<Order>>(`/admin/orders/${id}`);
    return response.data.data;
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
  bulkUpdateStatus: async (data: BulkOrderUpdateDto): Promise<ApiResponse<{
    results: Array<{ orderId: string; success: boolean; order: Order }>;
    errors: Array<{ orderId: string; error: string }>;
  }>> => {
    const response = await apiClient.post<ApiResponse<{
      results: Array<{ orderId: string; success: boolean; order: Order }>;
      errors: Array<{ orderId: string; error: string }>;
    }>>('/admin/orders/bulk/update-status', data);
    return response.data;
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
   * Generate orders report
   */
  generateOrdersReport: async (params: ListOrdersParams, format: 'json' | 'pdf' | 'excel' = 'json') => {
    const response = await apiClient.get<ApiResponse<any>>('/admin/orders/reports/orders', {
      params: { ...sanitizePaginationParams(params), format },
    });
    return response.data;
  },

  /**
   * Generate financial report
   */
  generateFinancialReport: async () => {
    const response = await apiClient.get<ApiResponse<any>>('/admin/orders/reports/financial');
    return response.data;
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
    const response = await apiClient.get<ApiResponse<OrderStats>>('/admin/orders/stats');
    return response.data.data;
  },
};
