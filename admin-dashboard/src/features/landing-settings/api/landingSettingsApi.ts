import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/shared/types/common.types';
import type { LandingSettings, UpdateLandingSettingsDto } from '../types/landing-settings.types';

export const landingSettingsApi = {
  get: async (): Promise<LandingSettings | null> => {
    try {
      const response = await apiClient.get<ApiResponse<LandingSettings>>('/admin/landing/settings');
      return response.data.data;
    } catch {
      return null;
    }
  },

  update: async (data: UpdateLandingSettingsDto): Promise<LandingSettings> => {
    const response = await apiClient.patch<ApiResponse<LandingSettings>>('/admin/landing/settings', data);
    return response.data.data;
  },

  create: async (data: UpdateLandingSettingsDto): Promise<LandingSettings> => {
    const response = await apiClient.post<ApiResponse<LandingSettings>>('/admin/landing/settings', data);
    return response.data.data;
  },

  togglePublish: async (): Promise<LandingSettings> => {
    const response = await apiClient.patch<ApiResponse<LandingSettings>>('/admin/landing/settings/toggle-publish');
    return response.data.data;
  },
};
