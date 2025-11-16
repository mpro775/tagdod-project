import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/core/api/client';

// Hook for dashboard overview data
export const useDashboardOverview = () =>
  useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: async () => (await apiClient.get('/analytics/dashboard')).data, // {success,data,requestId}
    select: (env) => env.data, // ارجع DTO مباشرة
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

// Hook for recent orders
export const useRecentOrders = (limit: number = 5) => {
  return useQuery({
    queryKey: ['recent-orders', limit],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/orders?limit=${limit}&page=1`);
      // الباك إند يرجع { orders: [...], pagination: {...}, message: '...' } داخل data
      // response.data = { success: true, data: { orders: [...], pagination: {...} }, requestId: '...' }
      const responseData = response.data.data;
      // إذا كان responseData مصفوفة مباشرة (legacy format)
      if (Array.isArray(responseData)) {
        return responseData;
      }
      // إذا كان responseData كائن يحتوي على orders
      if (responseData && typeof responseData === 'object' && 'orders' in responseData) {
        return Array.isArray(responseData.orders) ? responseData.orders : [];
      }
      return [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for quick stats
export const useQuickStats = () => {
  return useQuery({
    queryKey: ['quick-stats'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/advanced/quick-stats');
      return response.data.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Hook for real-time metrics
export const useRealTimeMetrics = () => {
  return useQuery({
    queryKey: ['realtime-metrics'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/advanced/realtime');
      return response.data.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Auto refresh every 30 seconds
  });
};

// Hook for products count
export const useProductsCount = () => {
  return useQuery({
    queryKey: ['products-count'],
    queryFn: async () => {
      const response = await apiClient.get('/products/stats/count');
      return response.data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for top products performance
export const useTopProducts = () => {
  return useQuery({
    queryKey: ['top-products'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/advanced/products/performance');
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for sales analytics with category breakdown
export const useSalesAnalytics = () => {
  return useQuery({
    queryKey: ['sales-analytics'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/analytics/advanced/sales');
        // response.data = { success: true, data: {...}, requestId: '...' }
        const data = response.data?.data;
        
        // Debug logging
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log('useSalesAnalytics - response:', response);
          // eslint-disable-next-line no-console
          console.log('useSalesAnalytics - data:', data);
        }
        
        // التأكد من أن البيانات موجودة
        if (data && typeof data === 'object') {
          return data;
        }
        
        // إذا كانت البيانات فارغة أو null، نرجع كائن فارغ بدلاً من null
        return {};
      } catch (error: any) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch sales analytics:', error);
        // eslint-disable-next-line no-console
        console.error('Error details:', error?.response?.data || error?.message);
        // Return empty object to allow component to handle gracefully
        return {};
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Retry once on error
  });
};
