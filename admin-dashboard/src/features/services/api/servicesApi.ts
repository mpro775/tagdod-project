import { apiClient } from '@/core/api/client';
import type {
  ServiceRequest,
  EngineerOffer,
  ListServicesParams,
  ListEngineersParams,
  ListOffersParams,
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
  list: async (params: ListServicesParams = {}): Promise<ServiceRequest[]> => {
    const response = await apiClient.get<{ data: ServiceRequest[] }>('/admin/services/requests', {
      params,
    });
    return response.data.data;
  },

  getById: async (id: string): Promise<ServiceRequest> => {
    const response = await apiClient.get<{ data: ServiceRequest }>(
      `/admin/services/requests/${id}`
    );
    return response.data.data;
  },

  getOffers: async (id: string): Promise<EngineerOffer[]> => {
    const response = await apiClient.get<{ data: EngineerOffer[] }>(
      `/admin/services/requests/${id}/offers`
    );
    return response.data.data;
  },

  updateStatus: async (id: string, status: string, note?: string) => {
    const response = await apiClient.patch<{ data: any }>(
      `/admin/services/requests/${id}/status`,
      { status, note }
    );
    return response.data.data;
  },

  cancel: async (id: string, reason?: string) => {
    const response = await apiClient.post<{ data: any }>(
      `/admin/services/requests/${id}/cancel`,
      { reason }
    );
    return response.data.data;
  },

  assignEngineer: async (id: string, engineerId: string, note?: string) => {
    const response = await apiClient.post<{ data: any }>(
      `/admin/services/requests/${id}/assign-engineer`,
      { engineerId, note }
    );
    return response.data.data;
  },

  // === إحصائيات شاملة ===
  getOverviewStatistics: async (): Promise<OverviewStatistics> => {
    const response = await apiClient.get<{ data: OverviewStatistics }>(
      '/admin/services/statistics/overview'
    );
    return response.data.data;
  },

  getRequestsStatistics: async (
    params: RequestsStatisticsParams
  ): Promise<RequestsStatisticsItem[]> => {
    const response = await apiClient.get<{ data: RequestsStatisticsItem[] }>(
      '/admin/services/statistics/requests',
      { params }
    );
    return response.data.data;
  },

  getEngineersStatistics: async (
    params: EngineersStatisticsParams
  ): Promise<EngineerStatistics[]> => {
    const response = await apiClient.get<{ data: EngineerStatistics[] }>(
      '/admin/services/statistics/engineers',
      { params }
    );
    return response.data.data;
  },

  getServiceTypesStatistics: async (
    params: ServiceTypesStatisticsParams
  ): Promise<ServiceTypeStatistics[]> => {
    const response = await apiClient.get<{ data: ServiceTypeStatistics[] }>(
      '/admin/services/statistics/services-types',
      { params }
    );
    return response.data.data;
  },

  getRevenueStatistics: async (
    params: RevenueStatisticsParams
  ): Promise<RevenueStatisticsItem[]> => {
    const response = await apiClient.get<{ data: RevenueStatisticsItem[] }>(
      '/admin/services/statistics/revenue',
      { params }
    );
    return response.data.data;
  },

  // === إدارة المهندسين ===
  getEngineersList: async (params: ListEngineersParams = {}): Promise<EngineerDetails[]> => {
    const response = await apiClient.get<{ data: EngineerDetails[] }>('/admin/services/engineers', {
      params,
    });
    return response.data.data;
  },

  getEngineerStatistics: async (id: string): Promise<EngineerStatisticsDetails> => {
    const response = await apiClient.get<{ data: EngineerStatisticsDetails }>(
      `/admin/services/engineers/${id}/statistics`
    );
    return response.data.data;
  },

  getEngineerOffers: async (
    id: string,
    params: { status?: string; page?: number; limit?: number } = {}
  ): Promise<EngineerOffer[]> => {
    const response = await apiClient.get<{ data: EngineerOffer[] }>(
      `/admin/services/engineers/${id}/offers`,
      { params }
    );
    return response.data.data;
  },

  // === إدارة العروض ===
  getOffersList: async (params: ListOffersParams = {}): Promise<EngineerOffer[]> => {
    const response = await apiClient.get<{ data: EngineerOffer[] }>('/admin/services/offers', {
      params,
    });
    return response.data.data;
  },
};
