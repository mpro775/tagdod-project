import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/shared/types/common.types';
import type {
  Banner,
  CreateBannerDto,
  UpdateBannerDto,
  ListBannersDto,
  ApiErrorResponse,
} from '../types/banner.types';

const API_BASE = '/admin/marketing/banners';

export const bannersApi = {
  // Create a new banner
  createBanner: async (data: CreateBannerDto): Promise<Banner> => {
    const response = await apiClient.post<ApiResponse<Banner>>(API_BASE, data);
    return response.data.data;
  },

  // Get all banners with filters and pagination
  getBanners: async (params: ListBannersDto = {}) => {
    const response = await apiClient.get<ApiResponse<{ data: Banner[]; pagination: any }>>(API_BASE, { params });
    // Handle the nested response structure: { success: true, data: { data: [...], pagination: {...} } }
    const responseData = response.data.data;
    return {
      data: responseData.data || [],
      pagination: responseData.pagination || {},
    };
  },

  // Get a single banner by ID
  getBanner: async (id: string): Promise<Banner> => {
    const response = await apiClient.get<ApiResponse<Banner>>(`${API_BASE}/${id}`);
    return response.data.data;
  },

  // Update a banner
  updateBanner: async (id: string, data: UpdateBannerDto): Promise<Banner> => {
    const response = await apiClient.patch<ApiResponse<Banner>>(`${API_BASE}/${id}`, data);
    return response.data.data;
  },

  // Delete a banner (soft delete)
  deleteBanner: async (id: string): Promise<{ deleted: boolean; deletedAt: Date }> => {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean; deletedAt: Date }>>(
      `${API_BASE}/${id}`
    );
    return response.data.data;
  },

  // Toggle banner active status
  toggleBannerStatus: async (id: string): Promise<Banner> => {
    const response = await apiClient.patch<ApiResponse<Banner>>(`${API_BASE}/${id}/toggle`);
    return response.data.data;
  },

  // Get banner analytics
  getBannerAnalytics: async (
    id: string
  ): Promise<{
    viewCount: number;
    clickCount: number;
    conversionCount: number;
    clickThroughRate: number;
    conversionRate: number;
  }> => {
    const response = await apiClient.get<ApiResponse<{
      viewCount: number;
      clickCount: number;
      conversionCount: number;
      clickThroughRate: number;
      conversionRate: number;
    }>>(`${API_BASE}/${id}/analytics`);
    return response.data.data;
  },

  // Get all banners analytics
  getBannersAnalytics: async (): Promise<{
    totalBanners: number;
    activeBanners: number;
    inactiveBanners: number;
    totalViews: number;
    totalClicks: number;
    totalConversions: number;
    averageClickThroughRate: number;
    averageConversionRate: number;
    topPerformingBanners: Banner[];
  }> => {
    const response = await apiClient.get<any>(`${API_BASE}/analytics`);
    // Handle nested data structure from backend
    const analyticsData = response.data?.data?.data || response.data?.data || response.data;
    return analyticsData;
  },
};

// Error handling utility
export const handleBannerApiError = (error: any): ApiErrorResponse => {
  const message = error.response?.data?.error?.message || error.message || 'حدث خطأ غير متوقع';
  const code = error.response?.data?.code || error.code || 'UNKNOWN_ERROR';

  return {
    success: false,
    error: {
      message,
      code,
      details: error.response?.data?.details || error.details,
    },
  };
};
