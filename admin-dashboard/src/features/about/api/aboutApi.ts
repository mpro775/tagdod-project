import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/shared/types/common.types';
import type {
  About,
  CreateAboutDto,
  UpdateAboutDto,
  ToggleAboutDto,
} from '../types/about.types';

export const aboutApi = {
  /**
   * Get about page data (Admin)
   */
  get: async (): Promise<About | null> => {
    const response = await apiClient.get<ApiResponse<About | null>>('/admin/about');
    return response.data.data;
  },

  /**
   * Create about page (Admin)
   */
  create: async (data: CreateAboutDto): Promise<About> => {
    const response = await apiClient.post<ApiResponse<About>>('/admin/about', data);
    return response.data.data;
  },

  /**
   * Update about page (Admin)
   */
  update: async (data: UpdateAboutDto): Promise<About> => {
    const response = await apiClient.put<ApiResponse<About>>('/admin/about', data);
    return response.data.data;
  },

  /**
   * Toggle about page active status (Admin)
   */
  toggle: async (data: ToggleAboutDto): Promise<About> => {
    const response = await apiClient.post<ApiResponse<About>>('/admin/about/toggle', data);
    return response.data.data;
  },

  /**
   * Get about page (Public)
   */
  getPublic: async (): Promise<About> => {
    const response = await apiClient.get<ApiResponse<About>>('/about/public');
    return response.data.data;
  },
};

