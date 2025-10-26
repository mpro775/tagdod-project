import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/shared/types/common.types';

export interface SystemSetting {
  id: string;
  key: string;
  value: any;
  category: string;
  type: string;
  description?: string;
  isPublic: boolean;
  updatedAt: Date;
  updatedBy?: string;
}

export const systemSettingsApi = {
  /**
   * Get all settings
   */
  getAllSettings: async (category?: string): Promise<SystemSetting[]> => {
    const response = await apiClient.get<ApiResponse<SystemSetting[]>>(
      '/system-settings',
      { params: { category } }
    );
    return response.data.data;
  },

  /**
   * Get settings by category (as key-value pairs)
   */
  getSettingsByCategory: async (category: string): Promise<Record<string, any>> => {
    const response = await apiClient.get<ApiResponse<Record<string, any>>>(
      `/system-settings/category/${category}`
    );
    return response.data.data;
  },

  /**
   * Get single setting
   */
  getSetting: async (key: string): Promise<SystemSetting> => {
    const response = await apiClient.get<ApiResponse<SystemSetting>>(
      `/system-settings/${key}`
    );
    return response.data.data;
  },

  /**
   * Create setting
   */
  createSetting: async (data: {
    key: string;
    value: any;
    category: string;
    type?: string;
    description?: string;
    isPublic?: boolean;
  }): Promise<SystemSetting> => {
    const response = await apiClient.post<ApiResponse<SystemSetting>>(
      '/system-settings',
      data
    );
    return response.data.data;
  },

  /**
   * Update setting
   */
  updateSetting: async (key: string, data: {
    value: any;
    description?: string;
  }): Promise<SystemSetting> => {
    const response = await apiClient.put<ApiResponse<SystemSetting>>(
      `/system-settings/${key}`,
      data
    );
    return response.data.data;
  },

  /**
   * Bulk update settings
   */
  bulkUpdate: async (settings: Record<string, any>) => {
    const response = await apiClient.put<ApiResponse<{ updated: number }>>(
      '/system-settings/bulk',
      { settings }
    );
    return response.data.data;
  },

  /**
   * Delete setting
   */
  deleteSetting: async (key: string): Promise<void> => {
    await apiClient.delete(`/system-settings/${key}`);
  },

  /**
   * Get public settings (no auth required)
   */
  getPublicSettings: async (category?: string): Promise<Record<string, any>> => {
    const response = await apiClient.get<Record<string, any>>(
      '/system-settings/public',
      { params: { category } }
    );
    return response.data;
  },
};

