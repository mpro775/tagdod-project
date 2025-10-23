import axios from 'axios';
import {
  Cart,
  CartFilters,
  ApiResponse,
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

// API Base Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/admin/carts`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  async getAllCarts(filters: CartFilters = {}): Promise<ApiResponse<{ carts: Cart[]; meta: any }>> {
    try {
      const response = await apiClient.get('/all', { params: filters });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch carts');
    }
  },

  // Get cart by ID
  async getCartById(cartId: string): Promise<ApiResponse<Cart>> {
    try {
      const response = await apiClient.get(`/${cartId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch cart details');
    }
  },

  // Convert cart to order
  async convertCartToOrder(
    request: ConvertToOrderRequest
  ): Promise<ApiResponse<{ orderId: string; cart: Cart }>> {
    try {
      const response = await apiClient.post(`/${request.cartId}/convert-to-order`, request);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to convert cart to order');
    }
  },

  // Get abandoned carts
  async getAbandonedCarts(
    filters: CartFilters = {}
  ): Promise<ApiResponse<{ carts: Cart[]; meta: any }>> {
    try {
      const response = await apiClient.get('/abandoned', { params: filters });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch abandoned carts');
    }
  },

  // Send reminder to specific cart
  async sendCartReminder(
    request: SendReminderRequest
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    try {
      const response = await apiClient.post(`/${request.cartId}/send-reminder`, request);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send cart reminder');
    }
  },

  // Send reminders to all abandoned carts
  async sendAllReminders(): Promise<ApiResponse<{ processed: number; sent: number }>> {
    try {
      const response = await apiClient.post('/send-reminders');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send reminders');
    }
  },

  // Analytics API
  async getCartAnalytics(period: string = '30'): Promise<ApiResponse<CartAnalytics>> {
    try {
      const response = await apiClient.get('/analytics', { params: { period } });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch cart analytics');
    }
  },

  async getCartStatistics(): Promise<ApiResponse<CartStatistics>> {
    try {
      const response = await apiClient.get('/statistics');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch cart statistics');
    }
  },

  async getConversionRates(period: string = '30'): Promise<ApiResponse<ConversionRates>> {
    try {
      const response = await apiClient.get('/conversion-rates', { params: { period } });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch conversion rates');
    }
  },

  async getRecoveryCampaignAnalytics(
    period: string = '30'
  ): Promise<ApiResponse<RecoveryCampaignAnalytics>> {
    try {
      const response = await apiClient.get('/recovery-campaigns', { params: { period } });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch recovery campaign analytics'
      );
    }
  },

  async getCustomerBehaviorAnalytics(
    period: string = '30'
  ): Promise<ApiResponse<CustomerBehaviorAnalytics>> {
    try {
      const response = await apiClient.get('/customer-behavior', { params: { period } });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch customer behavior analytics'
      );
    }
  },

  async getRevenueImpactAnalytics(
    period: string = '30'
  ): Promise<ApiResponse<RevenueImpactAnalytics>> {
    try {
      const response = await apiClient.get('/revenue-impact', { params: { period } });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch revenue impact analytics');
    }
  },

  // Bulk actions
  async performBulkActions(request: BulkActionRequest): Promise<ApiResponse<BulkActionResponse>> {
    try {
      const response = await apiClient.post('/bulk-actions', request);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to perform bulk actions');
    }
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
