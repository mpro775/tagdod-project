import { useState, useEffect } from 'react';
import { cartApi } from '../api/cartApi';
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

// Hook for managing cart list
export const useCartList = (filters?: CartFilters) => {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const fetchCarts = async (page: number = 1, limit: number = 20) => {
    setLoading(true);
    setError(null);
    try {
      const response = await cartApi.getAllCarts(page, limit, filters);
      setCarts(response.carts);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'فشل في جلب السلال');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarts(pagination.page, pagination.limit);
  }, [filters]);

  const refetch = () => {
    fetchCarts(pagination.page, pagination.limit);
  };

  return {
    carts,
    loading,
    error,
    pagination,
    fetchCarts,
    refetch,
  };
};

// Hook for cart details
export const useCartDetails = (cartId: string) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = async () => {
    if (!cartId) return;
    
    setLoading(true);
    setError(null);
    try {
      const cartData = await cartApi.getCartById(cartId);
      setCart(cartData);
    } catch (err: any) {
      setError(err.message || 'فشل في جلب تفاصيل السلة');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [cartId]);

  return {
    cart,
    loading,
    error,
    refetch: fetchCart,
  };
};

// Hook for abandoned carts
export const useAbandonedCarts = (hours: number = 24, limit: number = 50) => {
  const [abandonedCarts, setAbandonedCarts] = useState<Cart[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    count: 0,
    totalCarts: 0,
    totalValue: 0,
  });

  const fetchAbandonedCarts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await cartApi.getAbandonedCarts(hours, limit);
      setAbandonedCarts(response.data);
      setStats({
        count: response.count,
        totalCarts: response.totalCarts,
        totalValue: response.totalValue,
      });
    } catch (err: any) {
      setError(err.message || 'فشل في جلب السلال المتروكة');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbandonedCarts();
  }, [hours, limit]);

  const sendReminder = async (cartId: string): Promise<boolean> => {
    try {
      await cartApi.sendSingleReminder(cartId);
      await fetchAbandonedCarts(); // Refresh the list
      return true;
    } catch (err: any) {
      setError(err.message || 'فشل في إرسال التذكير');
      return false;
    }
  };

  const sendAllReminders = async (): Promise<boolean> => {
    try {
      const response = await cartApi.sendReminders();
      await fetchAbandonedCarts(); // Refresh the list
      return true;
    } catch (err: any) {
      setError(err.message || 'فشل في إرسال التذكيرات');
      return false;
    }
  };

  return {
    abandonedCarts,
    loading,
    error,
    stats,
    fetchAbandonedCarts,
    sendReminder,
    sendAllReminders,
  };
};

// Hook for cart analytics
export const useCartAnalytics = (period: number = 30) => {
  const [analytics, setAnalytics] = useState<CartAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cartApi.getCartAnalytics(period);
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || 'فشل في جلب التحليلات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
  };
};

// Hook for cart statistics
export const useCartStatistics = () => {
  const [statistics, setStatistics] = useState<CartStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cartApi.getCartStatistics();
      setStatistics(data);
    } catch (err: any) {
      setError(err.message || 'فشل في جلب الإحصائيات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  return {
    statistics,
    loading,
    error,
    refetch: fetchStatistics,
  };
};

// Hook for conversion rates
export const useConversionRates = (period: number = 30) => {
  const [conversionRates, setConversionRates] = useState<ConversionRates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversionRates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cartApi.getConversionRates(period);
      setConversionRates(data);
    } catch (err: any) {
      setError(err.message || 'فشل في جلب معدلات التحويل');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversionRates();
  }, [period]);

  return {
    conversionRates,
    loading,
    error,
    refetch: fetchConversionRates,
  };
};
