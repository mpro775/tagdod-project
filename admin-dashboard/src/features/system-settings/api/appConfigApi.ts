import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/shared/types/common.types';

export interface AppVersionPolicy {
  minVersion: string;
  latestVersion: string;
  blockedVersions: string[];
  forceUpdate: boolean;
  maintenanceMode: boolean;
  updateUrl: string;
}

export interface UpdateAppVersionPolicyDto {
  minVersion?: string;
  latestVersion?: string;
  blockedVersions?: string[];
  forceUpdate?: boolean;
  maintenanceMode?: boolean;
  updateUrl?: string;
}

export const appConfigApi = {
  getAppConfig: async (): Promise<AppVersionPolicy> => {
    const response = await apiClient.get<ApiResponse<AppVersionPolicy>>(
      '/admin/app-config'
    );
    return response.data.data;
  },

  updateAppConfig: async (
    payload: UpdateAppVersionPolicyDto
  ): Promise<AppVersionPolicy> => {
    const response = await apiClient.put<ApiResponse<AppVersionPolicy>>(
      '/admin/app-config',
      payload
    );
    return response.data.data;
  },
};
