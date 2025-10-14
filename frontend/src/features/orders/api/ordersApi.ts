import { apiClient } from '@/core/api/client';
import type {
  Order,
  ListOrdersParams,
  UpdateOrderStatusDto,
  ShipOrderDto,
  RefundOrderDto,
  OrderStats,
} from '../types/order.types';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/common.types';

export const ordersApi = {
  /**
   * List orders with pagination
   */
  list: async (params: ListOrdersParams): Promise<PaginatedResponse<Order>> => {
    const response = await apiClient.get<PaginatedResponse<Order>>('/admin/orders', {
      params,
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
    const response = await apiClient.patch<ApiResponse<Order>>(
      `/admin/orders/${id}/status`,
      data
    );
    return response.data.data;
  },

  /**
   * Ship order
   */
  ship: async (id: string, data: ShipOrderDto): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<Order>>(
      `/admin/orders/${id}/ship`,
      data
    );
    return response.data.data;
  },

  /**
   * Confirm delivery
   */
  confirmDelivery: async (id: string): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<Order>>(
      `/admin/orders/${id}/confirm-delivery`
    );
    return response.data.data;
  },

  /**
   * Refund order
   */
  refund: async (id: string, data: RefundOrderDto): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<Order>>(
      `/admin/orders/${id}/refund`,
      data
    );
    return response.data.data;
  },

  /**
   * Cancel order
   */
  cancel: async (id: string, reason: string): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<Order>>(
      `/admin/orders/${id}/cancel`,
      { reason }
    );
    return response.data.data;
  },

  /**
   * Update admin notes
   */
  updateNotes: async (
    id: string,
    notes: { adminNotes?: string; internalNotes?: string }
  ): Promise<Order> => {
    const response = await apiClient.patch<ApiResponse<Order>>(
      `/admin/orders/${id}/notes`,
      notes
    );
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

