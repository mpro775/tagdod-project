import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/shared/types/common.types';
import type {
  CreateEngineerLeadPayload,
  CreateMerchantLeadPayload,
  MarketerLeadCreationResponse,
  MarketerPortalStats,
  MarketerPortalUsersResponse,
} from '../types/marketer-portal.types';

const MARKETER_PORTAL_UPLOAD_TIMEOUT =
  Number(import.meta.env.VITE_MARKETER_PORTAL_UPLOAD_TIMEOUT) ||
  Number(import.meta.env.VITE_API_TIMEOUT) ||
  120000;

const toFormData = <T extends object>(payload: T) => {
  const formData = new FormData();

  Object.entries(payload as Record<string, unknown>).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (value instanceof File) {
      formData.append(key, value);
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
};

export const marketerPortalApi = {
  createEngineer: async (payload: CreateEngineerLeadPayload) => {
    const { data } = await apiClient.post<ApiResponse<MarketerLeadCreationResponse>>(
      '/admin/users/marketer-portal/engineers',
      toFormData(payload),
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: MARKETER_PORTAL_UPLOAD_TIMEOUT,
      },
    );

    return data.data;
  },

  createMerchant: async (payload: CreateMerchantLeadPayload) => {
    const { data } = await apiClient.post<ApiResponse<MarketerLeadCreationResponse>>(
      '/admin/users/marketer-portal/merchants',
      toFormData(payload),
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: MARKETER_PORTAL_UPLOAD_TIMEOUT,
      },
    );

    return data.data;
  },

  myUsers: async (params: { page?: number; limit?: number; search?: string; type?: string }) => {
    const { data } = await apiClient.get<ApiResponse<MarketerPortalUsersResponse>>(
      '/admin/users/marketer-portal/my-users',
      { params },
    );

    return data.data;
  },

  myUsersStats: async () => {
    const { data } = await apiClient.get<ApiResponse<MarketerPortalStats>>(
      '/admin/users/marketer-portal/my-users/stats',
    );

    return data.data;
  },
};
