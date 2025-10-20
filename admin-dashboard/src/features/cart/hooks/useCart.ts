import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { publicCartApi, AddToCartRequest, UpdateCartItemRequest } from '../api/publicCartApi';
import { cartApi } from '../api/cartApi';
import { toast } from 'react-hot-toast';
import { CartFilters, CartListResponse } from '../types/cart.types';

const CART_KEY = 'cart';
const ADMIN_CART_KEY = 'admin-cart';

export const useCart = () => {
  const queryClient = useQueryClient();

  // Get current cart
  const { data: cart, isLoading, error } = useQuery({
    queryKey: [CART_KEY, 'my'],
    queryFn: () => publicCartApi.getMyCart(),
    retry: 1,
  });

  // Get cart item count
  const { data: itemCount } = useQuery({
    queryKey: [CART_KEY, 'count'],
    queryFn: () => publicCartApi.getCartItemCount(),
    select: (data) => data.count,
    retry: 1,
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: (data: AddToCartRequest) => publicCartApi.addToCart(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [CART_KEY] });
      toast.success(response.message || 'تمت إضافة المنتج للسلة بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في إضافة المنتج للسلة');
    },
  });

  // Update cart item mutation
  const updateCartItemMutation = useMutation({
    mutationFn: (data: UpdateCartItemRequest) => publicCartApi.updateCartItem(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [CART_KEY] });
      toast.success(response.message || 'تم تحديث السلة بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في تحديث السلة');
    },
  });

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: (itemId: string) => publicCartApi.removeFromCart(itemId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [CART_KEY] });
      toast.success(response.message || 'تم حذف المنتج من السلة');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في حذف المنتج من السلة');
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: () => publicCartApi.clearCart(),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [CART_KEY] });
      toast.success(response.message || 'تم مسح السلة بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في مسح السلة');
    },
  });

  return {
    // Data
    cart,
    itemCount: itemCount || 0,
    isLoading,
    error,

    // Mutations
    addToCart: addToCartMutation.mutate,
    updateCartItem: updateCartItemMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    clearCart: clearCartMutation.mutate,

    // Loading states
    isAddingToCart: addToCartMutation.isPending,
    isUpdatingCart: updateCartItemMutation.isPending,
    isRemovingFromCart: removeFromCartMutation.isPending,
    isClearingCart: clearCartMutation.isPending,
  };
};

// === Admin Cart Management Hooks ===

export const useCartList = (filters: CartFilters = {}) => {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [ADMIN_CART_KEY, 'list', filters],
    queryFn: () => cartApi.getAllCarts(1, 20, filters),
    select: (response: CartListResponse) => ({
      carts: response.carts,
      pagination: response.pagination,
    }),
  });

  const fetchCarts = async (page: number, limit: number) => {
    try {
      const response = await cartApi.getAllCarts(page, limit, filters);
      queryClient.setQueryData([ADMIN_CART_KEY, 'list', filters], response);
      return response;
    } catch (error) {
      throw error;
    }
  };

  return {
    carts: data?.carts || [],
    pagination: data?.pagination || { page: 1, limit: 20, total: 0, pages: 0 },
    loading: isLoading,
    error: error?.message || null,
    fetchCarts,
    refetch,
  };
};

export const useCartDetails = (cartId: string) => {
  const { data: cart, isLoading, error } = useQuery({
    queryKey: [ADMIN_CART_KEY, 'details', cartId],
    queryFn: () => cartApi.getCartById(cartId),
    enabled: !!cartId,
  });

  return {
    cart,
    loading: isLoading,
    error: error?.message || null,
  };
};

export const useSendCartReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cartId: string) => cartApi.sendSingleReminder(cartId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_CART_KEY] });
      toast.success('تم إرسال التذكير بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في إرسال التذكير');
    },
  });
};

export const useConvertCartToOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cartId: string) => cartApi.convertToOrder(cartId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_CART_KEY] });
      toast.success('تم تحويل السلة إلى طلب بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في تحويل السلة إلى طلب');
    },
  });
};

// === Abandoned Carts Hooks ===

export const useAbandonedCarts = (hours: number = 24, limit: number = 50) => {
  const { data, isLoading, error } = useQuery({
    queryKey: [ADMIN_CART_KEY, 'abandoned', hours, limit],
    queryFn: () => cartApi.getAbandonedCarts(hours, limit),
  });

  return {
    abandonedCarts: data?.carts || [],
    stats: data?.stats || {
      total: 0,
      totalValue: 0,
      averageValue: 0,
      potentialRevenue: 0,
    },
    loading: isLoading,
    error: error?.message || null,
  };
};

// === Cart Analytics Hooks ===

export const useCartAnalytics = (days: number = 30) => {
  const { data, isLoading, error } = useQuery({
    queryKey: [ADMIN_CART_KEY, 'analytics', days],
    queryFn: () => cartApi.getCartAnalytics(days),
  });

  return {
    analytics: data || {
      totalCarts: 0,
      activeCarts: 0,
      abandonedCarts: 0,
      completedCarts: 0,
      totalValue: 0,
      averageCartValue: 0,
      conversionRate: 0,
      trends: [],
    },
    loading: isLoading,
    error: error?.message || null,
  };
};

export const useCartStatistics = (days: number = 30) => {
  const { data, isLoading, error } = useQuery({
    queryKey: [ADMIN_CART_KEY, 'statistics', days],
    queryFn: () => cartApi.getCartStatistics(days),
  });

  return {
    statistics: data || {
      totalCarts: 0,
      totalItems: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      topProducts: [],
      cartConversionFunnel: [],
    },
    loading: isLoading,
    error: error?.message || null,
  };
};

export const useConversionRates = (days: number = 30) => {
  const { data, isLoading, error } = useQuery({
    queryKey: [ADMIN_CART_KEY, 'conversion-rates', days],
    queryFn: () => cartApi.getConversionRates(days),
  });

  return {
    conversionRates: data || {
      overall: 0,
      bySource: [],
      byDevice: [],
      byTime: [],
      trends: [],
    },
    loading: isLoading,
    error: error?.message || null,
  };
};