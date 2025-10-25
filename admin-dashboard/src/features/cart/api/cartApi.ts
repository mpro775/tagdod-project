import {
  Cart,
  CartFilters,
  CartAnalytics,
  CartStatistics,
  ConversionRates,
  RecoveryCampaignAnalytics,
  CustomerBehaviorAnalytics,
  RevenueImpactAnalytics,
  BulkActionRequest,
  BulkActionResponse,
  ConvertToOrderRequest,
  SendReminderRequest,
} from '../types/cart.types';
import apiClient from '@/core/api/client';
import type { ApiResponse } from '@/shared/types/common.types';

// API Base Configuration


// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Cart Management API
export const cartApi = {
  // Get all carts with filters
  async getAllCarts(filters: CartFilters = {}): Promise<{ carts: Cart[]; pagination: any }> {
    // Convert 0-based page to 1-based page for backend compatibility
    const params = {
      ...filters,
      page: filters.page !== undefined ? filters.page + 1 : undefined,
    };
    const response = await apiClient.get<ApiResponse<{ carts: Cart[]; pagination: any }>>('/admin/carts/all', { params });

    // Convert pagination back to 0-based for frontend
    const result = response.data.data;
    if (result.pagination) {
      result.pagination = {
        ...result.pagination,
        page: result.pagination.page - 1,
      };
    }

    return result;
  },

  // Get cart by ID
  async getCartById(cartId: string): Promise<Cart> {
    const response = await apiClient.get<ApiResponse<Cart>>(`/admin/carts/${cartId}`);
    return response.data.data;
  },

  // Convert cart to order
  async convertCartToOrder(
    request: ConvertToOrderRequest
  ): Promise<{ orderId: string; cartId: string; status: string; message: string }> {
    const response = await apiClient.post<ApiResponse<{ orderId: string; cartId: string; status: string; message: string }>>(`/admin/carts/${request.cartId}/convert-to-order`, request);
    return response.data.data;
  },

  // Get abandoned carts
  async getAbandonedCarts(
    filters: CartFilters = {}
  ): Promise<{ carts: Cart[]; count: number; totalCarts: number; totalValue: number }> {
    const response = await apiClient.get<ApiResponse<{ carts: Cart[]; count: number; totalCarts: number; totalValue: number }>>('/admin/carts/abandoned', { params: filters });
    return response.data.data;
  },

  // Send reminder to specific cart
  async sendCartReminder(
    request: SendReminderRequest
  ) {
    const response = await apiClient.post<ApiResponse<any>>(`/admin/carts/${request.cartId}/send-reminder`, request);
    return response.data.data;
  },

  // Send reminders to all abandoned carts
  async sendAllReminders() {
    const response = await apiClient.post<ApiResponse<any>>('/admin/carts/send-reminders');
    return response.data.data;
  },

  // Analytics API
  async getCartAnalytics(period: string = '30'): Promise<CartAnalytics> {
    const response = await apiClient.get<ApiResponse<CartAnalytics>>('/admin/carts/analytics', { params: { period } });
    return response.data.data;
  },

  async getCartStatistics(): Promise<CartStatistics> {
    const response = await apiClient.get<ApiResponse<CartStatistics>>('/admin/carts/statistics');
    return response.data.data;
  },

  async getConversionRates(period: string = '30'): Promise<ConversionRates> {
    const response = await apiClient.get<ApiResponse<ConversionRates>>('/admin/carts/conversion-rates', { params: { period } });
    return response.data.data;
  },

  async getRecoveryCampaignAnalytics(
    period: string = '30'
  ): Promise<RecoveryCampaignAnalytics> {
    const response = await apiClient.get<ApiResponse<RecoveryCampaignAnalytics>>('/admin/carts/recovery-campaigns', { params: { period } });
    return response.data.data;
  },

  async getCustomerBehaviorAnalytics(
    period: string = '30'
  ): Promise<CustomerBehaviorAnalytics> {
    const response = await apiClient.get<ApiResponse<CustomerBehaviorAnalytics>>('/admin/carts/customer-behavior', { params: { period } });
    return response.data.data;
  },

  async getRevenueImpactAnalytics(
    period: string = '30'
  ): Promise<RevenueImpactAnalytics> {
    const response = await apiClient.get<ApiResponse<RevenueImpactAnalytics>>('/admin/carts/revenue-impact', { params: { period } });
    return response.data.data;
  },

  // Bulk actions
  async performBulkActions(request: BulkActionRequest): Promise<BulkActionResponse> {
    const response = await apiClient.post<ApiResponse<BulkActionResponse>>('/admin/carts/bulk-actions', request);
    return response.data.data;
  },
};

// Utility functions for formatting
export const formatCartStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    active: 'نشطة',
    abandoned: 'متروكة',
    converted: 'محولة',
    expired: 'منتهية الصلاحية',
  };
  return statusMap[status] || status;
};

export const formatCurrency = (amount: number, currency: string = 'YER'): string => {
  const currencySymbols: Record<string, string> = {
    YER: 'ر.ي',
    SAR: 'ر.س',
    USD: '$',
    EUR: '€',
  };

  const symbol = currencySymbols[currency] || currency;

  // Format number with commas
  const formattedAmount = new Intl.NumberFormat('ar-YE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${formattedAmount} ${symbol}`;
};

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('ar-YE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'منذ لحظات';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `منذ ${minutes} دقيقة`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `منذ ${hours} ساعة`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `منذ ${days} يوم`;
  } else {
    return formatDate(dateObj);
  }
};

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    active: '#4caf50',
    abandoned: '#ff9800',
    converted: '#2196f3',
    expired: '#f44336',
  };
  return colorMap[status] || '#757575';
};

export const calculateCartTotal = (cart: Cart): number => {
  return cart.pricingSummary?.total || 0;
};

export const getCartItemsCount = (cart: Cart): number => {
  return cart.items?.length || 0;
};

export const isCartAbandoned = (cart: Cart): boolean => {
  return cart.isAbandoned || cart.status === 'abandoned';
};

export const getCartAge = (cart: Cart): number => {
  const now = new Date();
  const createdAt = new Date(cart.createdAt);
  return Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)); // days
};

export const getLastActivityAge = (cart: Cart): number => {
  if (!cart.lastActivityAt) return 0;
  const now = new Date();
  const lastActivity = new Date(cart.lastActivityAt);
  return Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60)); // hours
};

// Export default
export default cartApi;
