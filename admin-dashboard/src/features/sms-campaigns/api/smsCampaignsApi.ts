import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/shared/types/common.types';
import type {
  CreateSmsCampaignDto,
  ListSmsCampaignsParams,
  ListSmsRecipientsParams,
  PreviewSmsCampaignDto,
  SendTestSmsDto,
  SmsCampaign,
  SmsCampaignPreview,
  SmsCampaignRecipient,
} from '../types/smsCampaign.types';

const API_BASE = '/sms-campaigns/admin';

const unwrap = <T>(payload: any): T => payload?.data?.data ?? payload?.data ?? payload;

export const smsCampaignsApi = {
  preview: async (data: PreviewSmsCampaignDto): Promise<SmsCampaignPreview> => {
    const response = await apiClient.post<ApiResponse<SmsCampaignPreview>>(
      `${API_BASE}/preview`,
      data,
    );
    return unwrap<SmsCampaignPreview>(response.data);
  },

  sendTest: async (data: SendTestSmsDto) => {
    const response = await apiClient.post(`${API_BASE}/test`, data);
    return unwrap(response.data);
  },

  create: async (data: CreateSmsCampaignDto): Promise<SmsCampaign> => {
    const response = await apiClient.post<ApiResponse<SmsCampaign>>(API_BASE, data);
    return unwrap<SmsCampaign>(response.data);
  },

  list: async (params: ListSmsCampaignsParams = {}) => {
    const response = await apiClient.get(API_BASE, { params });
    return unwrap<{
      campaigns: SmsCampaign[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
      stats: { total: number; sending: number; completed: number; failedOrStopped: number };
    }>(response.data);
  },

  get: async (id: string): Promise<SmsCampaign> => {
    const response = await apiClient.get(`${API_BASE}/${id}`);
    return unwrap<SmsCampaign>(response.data);
  },

  recipients: async (id: string, params: ListSmsRecipientsParams = {}) => {
    const response = await apiClient.get(`${API_BASE}/${id}/recipients`, { params });
    return unwrap<{
      recipients: SmsCampaignRecipient[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(response.data);
  },

  pause: async (id: string) => unwrap<SmsCampaign>((await apiClient.patch(`${API_BASE}/${id}/pause`)).data),
  resume: async (id: string) => unwrap<SmsCampaign>((await apiClient.patch(`${API_BASE}/${id}/resume`)).data),
  cancel: async (id: string) => unwrap<SmsCampaign>((await apiClient.patch(`${API_BASE}/${id}/cancel`)).data),
  retryFailed: async (id: string) =>
    unwrap<SmsCampaign>((await apiClient.post(`${API_BASE}/${id}/retry-failed`)).data),
  exportUrl: (id: string) => `${API_BASE}/${id}/export.csv`,
};
