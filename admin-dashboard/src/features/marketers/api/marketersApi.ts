import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/shared/types/common.types';
import type {
  MarketersListResponse,
  MarketersStatsSummary,
  CreateMarketerDto,
  CreatedMarketerResponse,
  MarketersAnalyticsOverview,
  MarketersRankingResponse,
  MarketerAnalyticsDetails,
} from '../types/marketer.types';

export const marketersApi = {
  list: async (params?: { page?: number; limit?: number; search?: string }) => {
    const { data } = await apiClient.get<ApiResponse<MarketersListResponse>>('/admin/users/marketers/list', {
      params,
    });
    return data.data;
  },

  statsSummary: async () => {
    const { data } = await apiClient.get<ApiResponse<MarketersStatsSummary>>(
      '/admin/users/marketers/stats/summary',
    );
    return data.data;
  },

  analyticsOverview: async (params?: { from?: string; to?: string }) => {
    const { data } = await apiClient.get<ApiResponse<MarketersAnalyticsOverview>>(
      '/admin/users/marketers/analytics/overview',
      { params },
    );
    return data.data;
  },

  analyticsRanking: async (params?: { from?: string; to?: string; limit?: number }) => {
    const { data } = await apiClient.get<ApiResponse<MarketersRankingResponse>>(
      '/admin/users/marketers/analytics/ranking',
      { params },
    );
    return data.data;
  },

  marketerAnalyticsDetails: async (marketerId: string, params?: { from?: string; to?: string }) => {
    const { data } = await apiClient.get<ApiResponse<MarketerAnalyticsDetails>>(
      `/admin/users/marketers/analytics/${marketerId}`,
      { params },
    );
    return data.data;
  },

  create: async (payload: CreateMarketerDto) => {
    const { data } = await apiClient.post<ApiResponse<CreatedMarketerResponse>>(
      '/admin/users/marketers',
      payload,
    );
    return data.data;
  },
};
