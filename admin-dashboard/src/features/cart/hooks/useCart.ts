import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CartFilters,
 
  BulkActionRequest,
  ConvertToOrderRequest,
  SendReminderRequest,
} from '../types/cart.types';
import { cartApi } from '../api/cartApi';
import { useSnackbar } from 'notistack';

// Query Keys
export const cartQueryKeys = {
  all: ['carts'] as const,
  lists: () => [...cartQueryKeys.all, 'list'] as const,
  list: (filters: CartFilters) => [...cartQueryKeys.lists(), filters] as const,
  details: () => [...cartQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...cartQueryKeys.details(), id] as const,
  abandoned: (filters: CartFilters) => [...cartQueryKeys.all, 'abandoned', filters] as const,
  analytics: (period: string) => [...cartQueryKeys.all, 'analytics', period] as const,
  statistics: () => [...cartQueryKeys.all, 'statistics'] as const,
  conversionRates: (period: string) => [...cartQueryKeys.all, 'conversion-rates', period] as const,
  recoveryCampaigns: (period: string) =>
    [...cartQueryKeys.all, 'recovery-campaigns', period] as const,
  customerBehavior: (period: string) =>
    [...cartQueryKeys.all, 'customer-behavior', period] as const,
  revenueImpact: (period: string) => [...cartQueryKeys.all, 'revenue-impact', period] as const,
};

// Custom Hooks for Cart Management

// Get all carts with filters
export const useCartList = (filters: CartFilters = {}) => {
  return useQuery({
    queryKey: cartQueryKeys.list(filters),
    queryFn: async () => {
      const response = await cartApi.getAllCarts(filters);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get cart by ID
export const useCartDetails = (cartId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: cartQueryKeys.detail(cartId),
    queryFn: async () => {
      const response = await cartApi.getCartById(cartId);
      return response.data;
    },
    enabled: enabled && !!cartId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get abandoned carts
export const useAbandonedCarts = (filters: CartFilters = {}) => {
  return useQuery({
    queryKey: cartQueryKeys.abandoned(filters),
    queryFn: async () => {
      const response = await cartApi.getAbandonedCarts(filters);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Cart Analytics
export const useCartAnalytics = (period: string = '30') => {
  return useQuery({
    queryKey: cartQueryKeys.analytics(period),
    queryFn: async () => {
      const response = await cartApi.getCartAnalytics(period);
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Cart Statistics
export const useCartStatistics = () => {
  return useQuery({
    queryKey: cartQueryKeys.statistics(),
    queryFn: async () => {
      const response = await cartApi.getCartStatistics();
      return response.data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Conversion Rates
export const useConversionRates = (period: string = '30') => {
  return useQuery({
    queryKey: cartQueryKeys.conversionRates(period),
    queryFn: async () => {
      const response = await cartApi.getConversionRates(period);
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
  });
};

// Recovery Campaign Analytics
export const useRecoveryCampaignAnalytics = (period: string = '30') => {
  return useQuery({
    queryKey: cartQueryKeys.recoveryCampaigns(period),
    queryFn: async () => {
      const response = await cartApi.getRecoveryCampaignAnalytics(period);
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
  });
};

// Customer Behavior Analytics
export const useCustomerBehaviorAnalytics = (period: string = '30') => {
  return useQuery({
    queryKey: cartQueryKeys.customerBehavior(period),
    queryFn: async () => {
      const response = await cartApi.getCustomerBehaviorAnalytics(period);
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
  });
};

// Revenue Impact Analytics
export const useRevenueImpactAnalytics = (period: string = '30') => {
  return useQuery({
    queryKey: cartQueryKeys.revenueImpact(period),
    queryFn: async () => {
      const response = await cartApi.getRevenueImpactAnalytics(period);
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
  });
};

// Mutations

// Convert cart to order
export const useConvertCartToOrder = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async (request: ConvertToOrderRequest) => {
      const response = await cartApi.convertCartToOrder(request);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.detail(variables.cartId) });
      enqueueSnackbar('تم تحويل السلة إلى طلب بنجاح', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'فشل في تحويل السلة إلى طلب', { variant: 'error' });
    },
  });
};

// Send cart reminder
export const useSendCartReminder = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async (request: SendReminderRequest) => {
      const response = await cartApi.sendCartReminder(request);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.detail(variables.cartId) });
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.abandoned({}) });
      enqueueSnackbar('تم إرسال التذكير بنجاح', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'فشل في إرسال التذكير', { variant: 'error' });
    },
  });
};

// Send all reminders
export const useSendAllReminders = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async () => {
      const response = await cartApi.sendAllReminders();
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.all });
      enqueueSnackbar(`تم إرسال ${data?.data?.sent} تذكير بنجاح`, { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'فشل في إرسال التذكيرات', { variant: 'error' });
    },
  });
};

// Bulk actions
export const useBulkActions = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async (request: BulkActionRequest) => {
      const response = await cartApi.performBulkActions(request);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.all });
      enqueueSnackbar(`تم معالجة ${data?.data?.processed} سلة بنجاح`, { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'فشل في تنفيذ الإجراءات الجماعية', { variant: 'error' });
    },
  });
};

// Custom Hook for Cart Filters Management
export const useCartFilters = (initialFilters: CartFilters = {}) => {
  const [filters, setFilters] = useState<CartFilters>(initialFilters);

  const updateFilter = useCallback((key: keyof CartFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const updateFilters = useCallback((newFilters: Partial<CartFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return {
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
    clearFilters,
  };
};

// Custom Hook for Cart Selection Management
export const useCartSelection = () => {
  const [selectedCarts, setSelectedCarts] = useState<string[]>([]);

  const selectCart = useCallback((cartId: string) => {
    setSelectedCarts((prev) => [...prev, cartId]);
  }, []);

  const deselectCart = useCallback((cartId: string) => {
    setSelectedCarts((prev) => prev.filter((id) => id !== cartId));
  }, []);

  const toggleCart = useCallback((cartId: string) => {
    setSelectedCarts((prev) =>
      prev.includes(cartId) ? prev.filter((id) => id !== cartId) : [...prev, cartId]
    );
  }, []);

  const selectAll = useCallback((cartIds: string[]) => {
    setSelectedCarts(cartIds);
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedCarts([]);
  }, []);

  const isSelected = useCallback(
    (cartId: string) => {
      return selectedCarts.includes(cartId);
    },
    [selectedCarts]
  );

  return {
    selectedCarts,
    selectCart,
    deselectCart,
    toggleCart,
    selectAll,
    deselectAll,
    isSelected,
  };
};

// Custom Hook for Cart Dashboard Data
export const useCartDashboard = (period: string = '30') => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    data: analytics,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useCartAnalytics(period);

  const {
    data: statistics,
    isLoading: statisticsLoading,
    error: statisticsError,
  } = useCartStatistics();

  const {
    data: conversionRates,
    isLoading: conversionRatesLoading,
    error: conversionRatesError,
  } = useConversionRates(period);

  useEffect(() => {
    const loading = analyticsLoading || statisticsLoading || conversionRatesLoading;
    const error = analyticsError || statisticsError || conversionRatesError;

    setIsLoading(loading);
    setError(error?.message || null);
  }, [
    analyticsLoading,
    statisticsLoading,
    conversionRatesLoading,
    analyticsError,
    statisticsError,
    conversionRatesError,
  ]);

  return {
    analytics,
    statistics,
    conversionRates,
    isLoading,
    error,
  };
};

// Export all hooks
export default {
  useCartList,
  useCartDetails,
  useAbandonedCarts,
  useCartAnalytics,
  useCartStatistics,
  useConversionRates,
  useRecoveryCampaignAnalytics,
  useCustomerBehaviorAnalytics,
  useRevenueImpactAnalytics,
  useConvertCartToOrder,
  useSendCartReminder,
  useSendAllReminders,
  useBulkActions,
  useCartFilters,
  useCartSelection,
  useCartDashboard,
};
