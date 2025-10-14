import { apiClient } from '@/core/api/client';
import type { Banner, ListBannersParams, CreateBannerDto, UpdateBannerDto } from '../types/banner.types';

export const bannersApi = {
  create: async (data: CreateBannerDto): Promise<Banner> => {
    const response = await apiClient.post<{ success: boolean; data: Banner }>('/admin/banners', data);
    return response.data.data;
  },

  list: async (params: ListBannersParams = {}): Promise<Banner[]> => {
    const response = await apiClient.get<{ success: boolean; data: Banner[] }>('/admin/banners', { params });
    return response.data.data;
  },

  getById: async (id: string): Promise<Banner> => {
    const response = await apiClient.get<{ success: boolean; data: Banner }>(`/admin/banners/${id}`);
    return response.data.data;
  },

  update: async (id: string, data: UpdateBannerDto): Promise<Banner> => {
    const response = await apiClient.patch<{ success: boolean; data: Banner }>(`/admin/banners/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/banners/${id}`);
  },

  toggleStatus: async (id: string): Promise<Banner> => {
    const response = await apiClient.patch<{ success: boolean; data: Banner }>(`/admin/banners/${id}/toggle-status`);
    return response.data.data;
  },
};

