import { apiClient } from '@/core/api/client';
import type {
  Coupon,
  ListCouponsParams,
  CreateCouponDto,
  UpdateCouponDto,
  BulkGenerateCouponsDto,
  CouponAnalytics,
} from '../types/coupon.types';
import type { PaginatedResponse } from '@/shared/types/common.types';

export const couponsApi = {
  /**
   * Create coupon
   */
  create: async (data: CreateCouponDto): Promise<Coupon> => {
    const response = await apiClient.post<{ success: boolean; data: Coupon }>(
      '/admin/coupons',
      data
    );
    return response.data.data;
  },

  /**
   * List coupons with pagination
   */
  list: async (params: ListCouponsParams): Promise<PaginatedResponse<Coupon>> => {
    const response = await apiClient.get<{
      success: boolean;
      data: Coupon[];
      pagination: any;
    }>('/admin/coupons', { params });
    return {
      data: response.data.data,
      meta: response.data.pagination,
    };
  },

  /**
   * Get coupon by ID
   */
  getById: async (id: string): Promise<Coupon> => {
    const response = await apiClient.get<{ success: boolean; data: Coupon }>(
      `/admin/coupons/${id}`
    );
    return response.data.data;
  },

  /**
   * Update coupon
   */
  update: async (id: string, data: UpdateCouponDto): Promise<Coupon> => {
    const response = await apiClient.patch<{ success: boolean; data: Coupon }>(
      `/admin/coupons/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete coupon (soft delete)
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/coupons/${id}`);
  },

  /**
   * Toggle coupon status
   */
  toggleStatus: async (id: string): Promise<Coupon> => {
    const response = await apiClient.patch<{ success: boolean; data: Coupon }>(
      `/admin/coupons/${id}/toggle-status`
    );
    return response.data.data;
  },

  /**
   * Bulk generate coupons
   */
  bulkGenerate: async (data: BulkGenerateCouponsDto): Promise<Coupon[]> => {
    const response = await apiClient.post<{ success: boolean; data: Coupon[] }>(
      '/admin/coupons/bulk-generate',
      data
    );
    return response.data.data;
  },

  /**
   * Get coupon analytics
   */
  getAnalytics: async (id: string): Promise<CouponAnalytics> => {
    const response = await apiClient.get<{ success: boolean; data: CouponAnalytics }>(
      `/admin/coupons/${id}/analytics`
    );
    return response.data.data;
  },

  /**
   * Get usage history
   */
  getUsageHistory: async (id: string) => {
    const response = await apiClient.get(`/admin/coupons/${id}/usage-history`);
    return response.data;
  },
};

