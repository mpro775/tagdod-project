import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/shared/types/common.types';
import type {
  CreateInstallationGuideDto,
  InstallationGuideDetail,
  InstallationGuidesListResponse,
  ListInstallationGuidesParams,
  ToggleInstallationGuideDto,
  UpdateInstallationGuideDto,
} from '../types/installationGuide.types';

const ADMIN_API_BASE = '/admin/installation-guides';

export const installationGuidesApi = {
  getAll: async (
    params: ListInstallationGuidesParams = {},
  ): Promise<InstallationGuidesListResponse> => {
    const response = await apiClient.get<ApiResponse<InstallationGuidesListResponse>>(
      ADMIN_API_BASE,
      { params },
    );

    const payload = response.data.data;
    return {
      data: payload?.data || [],
      pagination: payload?.pagination || {
        page: params.page || 1,
        limit: params.limit || 20,
        total: 0,
        pages: 0,
      },
    };
  },

  getById: async (id: string): Promise<InstallationGuideDetail> => {
    const response = await apiClient.get<ApiResponse<InstallationGuideDetail>>(
      `${ADMIN_API_BASE}/${id}`,
    );
    return response.data.data;
  },

  create: async (
    data: CreateInstallationGuideDto,
  ): Promise<InstallationGuideDetail> => {
    const response = await apiClient.post<ApiResponse<InstallationGuideDetail>>(
      ADMIN_API_BASE,
      data,
    );
    return response.data.data;
  },

  update: async (
    id: string,
    data: UpdateInstallationGuideDto,
  ): Promise<InstallationGuideDetail> => {
    const response = await apiClient.put<ApiResponse<InstallationGuideDetail>>(
      `${ADMIN_API_BASE}/${id}`,
      data,
    );
    return response.data.data;
  },

  toggle: async (
    id: string,
    data: ToggleInstallationGuideDto,
  ): Promise<InstallationGuideDetail> => {
    const response = await apiClient.post<ApiResponse<InstallationGuideDetail>>(
      `${ADMIN_API_BASE}/${id}/toggle`,
      data,
    );
    return response.data.data;
  },

  delete: async (id: string): Promise<{ deleted: boolean }> => {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(
      `${ADMIN_API_BASE}/${id}`,
    );
    return response.data.data;
  },
};

