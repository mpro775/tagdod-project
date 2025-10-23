import { apiClient } from '@/core/api/client';
import type {
  Banner,
  CreateBannerDto,
  UpdateBannerDto,
  ListBannersDto,
  BannerListApiResponse,
  BannerResponse,
  ApiErrorResponse,
} from '../types/banner.types';

const API_BASE = '/admin/marketing/banners';

export const bannersApi = {
  // Create a new banner
  createBanner: async (data: CreateBannerDto): Promise<BannerResponse> => {
    const response = await apiClient.post<BannerResponse>(API_BASE, data);
    return response.data;
  },

  // Get all banners with filters and pagination
  getBanners: async (params: ListBannersDto = {}): Promise<BannerListApiResponse> => {
    const response = await apiClient.get<BannerListApiResponse>(API_BASE, { params });
    return response.data;
  },

  // Get a single banner by ID
  getBanner: async (id: string): Promise<BannerResponse> => {
    const response = await apiClient.get<BannerResponse>(`${API_BASE}/${id}`);
    return response.data;
  },

  // Update a banner
  updateBanner: async (id: string, data: UpdateBannerDto): Promise<BannerResponse> => {
    const response = await apiClient.patch<BannerResponse>(`${API_BASE}/${id}`, data);
    return response.data;
  },

  // Delete a banner (soft delete)
  deleteBanner: async (id: string): Promise<{ success: boolean; data: boolean }> => {
    const response = await apiClient.delete<{ success: boolean; data: boolean }>(
      `${API_BASE}/${id}`
    );
    return response.data;
  },

  // Toggle banner active status
  toggleBannerStatus: async (id: string): Promise<BannerResponse> => {
    const response = await apiClient.patch<BannerResponse>(`${API_BASE}/${id}/toggle`);
    return response.data;
  },

  // Get banner analytics
  getBannerAnalytics: async (
    id: string
  ): Promise<{
    success: boolean;
    data: {
      data: {
        viewCount: number;
        clickCount: number;
        conversionCount: number;
        clickThroughRate: number;
        conversionRate: number;
      };
    };
  }> => {
    const response = await apiClient.get(`${API_BASE}/${id}/analytics`);
    return response.data;
  },

  // Get all banners analytics
  getBannersAnalytics: async (): Promise<{
    success: boolean;
    data: {
      data: {
        totalBanners: number;
        activeBanners: number;
        inactiveBanners: number;
        totalViews: number;
        totalClicks: number;
        totalConversions: number;
        averageClickThroughRate: number;
        averageConversionRate: number;
        topPerformingBanners: Banner[];
      };
    };
  }> => {
    const response = await apiClient.get(`${API_BASE}/analytics`);
    return response.data;
  },
};

// Error handling utility
export const handleBannerApiError = (error: any): ApiErrorResponse => {
  const message = error.response?.data?.message || error.message || 'حدث خطأ غير متوقع';
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
