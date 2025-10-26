import apiClient from '../../../core/api/client';
import type {
  Address,
  AddressStats,
  CityStats,
  AddressListResponse,
  UsageAnalytics,
  GeographicData,
  AddressFilters,
  UsageStatsFilters,
  NearbySearchParams,
} from '../types/address.types';

const BASE_URL = '/admin/addresses';

export const addressesApi = {
  // Statistics & Analytics
  async getStats(): Promise<AddressStats> {
    const response = await apiClient.get(`${BASE_URL}/stats`);
    return response.data.data;
  },

  async getTopCities(limit = 10): Promise<CityStats[]> {
    const response = await apiClient.get(`${BASE_URL}/top-cities`, {
      params: { limit },
    });
    return response.data.data;
  },

  async getMostUsed(limit = 10): Promise<Address[]> {
    const response = await apiClient.get(`${BASE_URL}/most-used`, {
      params: { limit },
    });
    return response.data.data;
  },

  async getRecentlyUsed(limit = 20): Promise<Address[]> {
    const response = await apiClient.get(`${BASE_URL}/recently-used`, {
      params: { limit },
    });
    return response.data.data;
  },

  async getNeverUsed(limit = 20): Promise<Address[]> {
    const response = await apiClient.get(`${BASE_URL}/never-used`, {
      params: { limit },
    });
    return response.data.data;
  },

  async getUsageAnalytics(filters?: UsageStatsFilters): Promise<UsageAnalytics> {
    const response = await apiClient.get(`${BASE_URL}/usage-analytics`, {
      params: filters,
    });
    return response.data.data;
  },

  async getGeographicAnalytics(): Promise<GeographicData> {
    const response = await apiClient.get(`${BASE_URL}/geographic-analytics`);
    return response.data.data;
  },

  // Search & List
  async list(filters?: AddressFilters): Promise<AddressListResponse> {
    const response = await apiClient.get(`${BASE_URL}/list`, {
      params: filters,
    });
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  },

  async getUserAddresses(userId: string, includeDeleted = false): Promise<Address[]> {
    const response = await apiClient.get(`${BASE_URL}/user/${userId}`, {
      params: { includeDeleted },
    });
    return response.data.data;
  },

  async getUserAddressCount(userId: string): Promise<number> {
    const response = await apiClient.get(`${BASE_URL}/user/${userId}/count`);
    return response.data.data.count;
  },

  async searchNearby(params: NearbySearchParams): Promise<Address[]> {
    const response = await apiClient.get(`${BASE_URL}/nearby`, {
      params,
    });
    return response.data.data;
  },
};

