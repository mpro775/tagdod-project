import { apiClient } from '@/core/api/client';
import { sanitizePaginationParams } from '@/shared/utils/formatters';
import type { ApiResponse } from '@/shared/types/common.types';
import type {
  ServiceRequest,
  EngineerOffer,
  ListServicesParams,
  ListEngineersParams,
  ListOffersParams,
  OffersStatistics,
  EngineersOverviewStatistics,
  OverviewStatistics,
  RequestsStatisticsParams,
  RequestsStatisticsItem,
  EngineersStatisticsParams,
  EngineerStatistics,
  ServiceTypesStatisticsParams,
  ServiceTypeStatistics,
  RevenueStatisticsParams,
  RevenueStatisticsItem,
  EngineerDetails,
  EngineerStatisticsDetails,
} from '../types/service.types';

export const servicesApi = {
  // === إدارة الطلبات ===
  list: async (params: ListServicesParams = {}): Promise<{ data: ServiceRequest[]; meta: any }> => {
    const response = await apiClient.get<ApiResponse<{ data: ServiceRequest[]; meta: any }>>(
      '/services/admin/requests',
      {
        params: sanitizePaginationParams(params),
      }
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<ServiceRequest> => {
    const response = await apiClient.get<ApiResponse<ServiceRequest>>(
      `/services/admin/requests/${id}`
    );
    return response.data.data;
  },

  getOffers: async (id: string): Promise<EngineerOffer[]> => {
    const response = await apiClient.get<ApiResponse<EngineerOffer[]>>(
      `/services/admin/requests/${id}/offers`
    );
    return response.data.data;
  },

  updateStatus: async (id: string, status: string, note?: string) => {
    const response = await apiClient.patch<ApiResponse<any>>(
      `/services/admin/requests/${id}/status`,
      { status, note }
    );
    return response.data.data;
  },

  cancel: async (id: string, reason?: string) => {
    const response = await apiClient.post<ApiResponse<any>>(
      `/services/admin/requests/${id}/cancel`,
      { reason }
    );
    return response.data.data;
  },

  assignEngineer: async (id: string, engineerId: string, note?: string) => {
    const response = await apiClient.post<ApiResponse<any>>(
      `/services/admin/requests/${id}/assign-engineer`,
      { engineerId, note }
    );
    return response.data.data;
  },

  // === إحصائيات شاملة ===
  getOverviewStatistics: async (): Promise<OverviewStatistics> => {
    const response = await apiClient.get<ApiResponse<OverviewStatistics>>(
      '/services/admin/statistics/overview'
    );
    return response.data.data;
  },

  getRequestsStatistics: async (
    params: RequestsStatisticsParams
  ): Promise<RequestsStatisticsItem[]> => {
    const response = await apiClient.get<ApiResponse<RequestsStatisticsItem[]>>(
      '/services/admin/statistics/requests',
      { params }
    );
    return response.data.data;
  },

  getEngineersStatistics: async (
    params: EngineersStatisticsParams
  ): Promise<EngineerStatistics[]> => {
    const response = await apiClient.get<ApiResponse<EngineerStatistics[]>>(
      '/services/admin/statistics/engineers',
      { params }
    );
    return response.data.data;
  },

  getServiceTypesStatistics: async (
    params: ServiceTypesStatisticsParams
  ): Promise<ServiceTypeStatistics[]> => {
    const response = await apiClient.get<ApiResponse<ServiceTypeStatistics[]>>(
      '/services/admin/statistics/services-types',
      { params }
    );
    return response.data.data;
  },

  getRevenueStatistics: async (
    params: RevenueStatisticsParams
  ): Promise<RevenueStatisticsItem[]> => {
    const response = await apiClient.get<ApiResponse<RevenueStatisticsItem[]>>(
      '/services/admin/statistics/revenue',
      { params }
    );
    return response.data.data;
  },

  // === إدارة المهندسين ===
  getEngineersOverviewStatistics: async (): Promise<EngineersOverviewStatistics> => {
    const response = await apiClient.get<ApiResponse<EngineersOverviewStatistics>>(
      '/services/admin/engineers/statistics/overview'
    );
    return response.data.data;
  },

  getEngineersList: async (
    params: ListEngineersParams = {}
  ): Promise<{ data: EngineerDetails[]; meta: any }> => {
    const response = await apiClient.get<ApiResponse<{ data: EngineerDetails[]; meta: any }>>(
      '/services/admin/engineers',
      {
        params,
      }
    );
    return response.data.data;
  },

  getEngineerStatistics: async (id: string): Promise<EngineerStatisticsDetails> => {
    const response = await apiClient.get<ApiResponse<EngineerStatisticsDetails>>(
      `/services/admin/engineers/${id}/statistics`
    );
    return response.data.data;
  },

  getEngineerOffers: async (
    id: string,
    params: { status?: string; page?: number; limit?: number } = {}
  ): Promise<{ data: EngineerOffer[]; meta: any }> => {
    const response = await apiClient.get<ApiResponse<{ data: EngineerOffer[]; meta: any }>>(
      `/services/admin/engineers/${id}/offers`,
      { params }
    );
    return response.data.data;
  },

  // === إدارة العروض ===
  getOffersStatistics: async (params?: {
    dateFrom?: string;
    dateTo?: string;
  }): Promise<OffersStatistics> => {
    const response = await apiClient.get<ApiResponse<OffersStatistics>>(
      '/services/admin/offers/statistics',
      {
        params,
      }
    );
    return response.data.data;
  },

  getOffersList: async (
    params: ListOffersParams = {}
  ): Promise<{ data: EngineerOffer[]; meta: any }> => {
    const response = await apiClient.get<ApiResponse<{ data: EngineerOffer[]; meta: any }>>(
      '/services/admin/offers',
      {
        params,
      }
    );
    return response.data.data;
  },
};
