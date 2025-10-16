import { apiClient } from '../../../core/api/client';
import {
  Cart,
  CartFilters,
  CartAnalytics,
  CartStatistics,
  ConversionRates,
  CartListResponse,
  AbandonedCartResponse,
  SendReminderResponse,
  CartStatus,
} from '../types/cart.types';

export const cartApi = {
  // Get all carts with pagination and filters
  getAllCarts: async (
    page: number = 1,
    limit: number = 20,
    filters?: CartFilters,
  ): Promise<CartListResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.status) params.append('status', filters.status);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);

    const response = await apiClient.get(`/admin/carts/all?${params}`);
    return response.data;
  },

  // Get cart by ID
  getCartById: async (cartId: string): Promise<Cart> => {
    const response = await apiClient.get(`/admin/carts/${cartId}`);
    return response.data.data;
  },

  // Get abandoned carts
  getAbandonedCarts: async (
    hours: number = 24,
    limit: number = 50,
  ): Promise<AbandonedCartResponse> => {
    const response = await apiClient.get(
      `/admin/carts/abandoned?hours=${hours}&limit=${limit}`,
    );
    return response.data;
  },

  // Get cart analytics
  getCartAnalytics: async (period: number = 30): Promise<CartAnalytics> => {
    const response = await apiClient.get(`/admin/carts/analytics?period=${period}`);
    return response.data.data;
  },

  // Get cart statistics
  getCartStatistics: async (): Promise<CartStatistics> => {
    const response = await apiClient.get('/admin/carts/statistics');
    return response.data.data;
  },

  // Get conversion rates
  getConversionRates: async (period: number = 30): Promise<ConversionRates> => {
    const response = await apiClient.get(`/admin/carts/conversion-rates?period=${period}`);
    return response.data.data;
  },

  // Send reminders to all abandoned carts
  sendReminders: async (): Promise<SendReminderResponse> => {
    const response = await apiClient.post('/admin/carts/send-reminders');
    return response.data;
  },

  // Send reminder for specific cart
  sendSingleReminder: async (cartId: string): Promise<SendReminderResponse> => {
    const response = await apiClient.post(`/admin/carts/${cartId}/send-reminder`);
    return response.data;
  },

  // Convert cart to order
  convertToOrder: async (cartId: string): Promise<{ cartId: string; orderId: string; convertedAt: Date }> => {
    const response = await apiClient.post(`/admin/carts/${cartId}/convert-to-order`);
    return response.data.data;
  },
};

// Helper function to format cart status
export const formatCartStatus = (status: CartStatus): { label: string; color: string } => {
  const statusMap = {
    [CartStatus.ACTIVE]: { label: 'نشط', color: 'green' },
    [CartStatus.ABANDONED]: { label: 'متروك', color: 'red' },
    [CartStatus.CONVERTED]: { label: 'محول', color: 'blue' },
    [CartStatus.EXPIRED]: { label: 'منتهي', color: 'gray' },
  };
  
  return statusMap[status] || { label: status, color: 'gray' };
};

// Helper function to format currency
export const formatCurrency = (amount: number, currency: string = 'SAR'): string => {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Helper function to format date
export const formatDate = (date: Date | string): string => {
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};
