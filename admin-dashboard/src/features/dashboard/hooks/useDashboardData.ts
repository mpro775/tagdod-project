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
      return response.data.data || [];
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
        return response.data.data;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('Failed to fetch sales analytics, using fallback data:', error);
        // Return empty object to allow component to handle gracefully
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on error since backend has issues
  });
};
