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

function extractData<T>(response: any): T {
  const outer = response?.data;
  if (outer && typeof outer === 'object') {
    if (Array.isArray(outer)) {
      return outer as T;
    }

    if ('data' in outer) {
      return extractData<T>({ data: outer.data });
    }
  }

  return outer as T;
}

export const addressesApi = {
  // Statistics & Analytics
  async getStats(): Promise<AddressStats> {
    const response = await apiClient.get(`${BASE_URL}/stats`);
    return extractData<AddressStats>(response);
  },

  async getTopCities(limit = 10): Promise<CityStats[]> {
    const response = await apiClient.get(`${BASE_URL}/top-cities`, {
      params: { limit },
    });
    return extractData<CityStats[]>(response);
  },

  async getMostUsed(limit = 10): Promise<Address[]> {
    const response = await apiClient.get(`${BASE_URL}/most-used`, {
      params: { limit },
    });
    return extractData<Address[]>(response);
  },

  async getRecentlyUsed(limit = 20): Promise<Address[]> {
    const response = await apiClient.get(`${BASE_URL}/recently-used`, {
      params: { limit },
    });
    return extractData<Address[]>(response);
  },

  async getNeverUsed(limit = 20): Promise<Address[]> {
    const response = await apiClient.get(`${BASE_URL}/never-used`, {
      params: { limit },
    });
    return extractData<Address[]>(response);
  },

  async getUsageAnalytics(filters?: UsageStatsFilters): Promise<UsageAnalytics> {
    const response = await apiClient.get(`${BASE_URL}/usage-analytics`, {
      params: filters,
    });
    return extractData<UsageAnalytics>(response);
  },

  async getGeographicAnalytics(): Promise<GeographicData> {
    const response = await apiClient.get(`${BASE_URL}/geographic-analytics`);
    return extractData<GeographicData>(response);
  },

  // Search & List
  async list(filters?: AddressFilters): Promise<AddressListResponse> {
    const response = await apiClient.get(`${BASE_URL}/list`, {
      params: filters,
    });

    const outer = response.data ?? {};
    const payload = outer.data ?? {};
    const addresses = extractData<Address[]>(response);
    const pagination =
      payload.pagination ??
      outer.pagination ?? {
        total: addresses.length,
        page: filters?.page ?? 1,
        limit: filters?.limit ?? (addresses.length || 20),
        pages: addresses.length && (filters?.limit ?? addresses.length)
          ? Math.max(1, Math.ceil(addresses.length / (filters?.limit ?? addresses.length)))
          : 1,
      };

    return {
      data: addresses,
      pagination,
    };
  },

  async getUserAddresses(userId: string, includeDeleted = false): Promise<Address[]> {
    const response = await apiClient.get(`${BASE_URL}/user/${userId}`, {
      params: { includeDeleted },
    });
    return extractData<Address[]>(response);
  },

  async getUserAddressCount(userId: string): Promise<number> {
    const response = await apiClient.get(`${BASE_URL}/user/${userId}/count`);
    const data = extractData<{ count: number }>(response);
    return data?.count ?? 0;
  },

  async searchNearby(params: NearbySearchParams): Promise<Address[]> {
    const response = await apiClient.get(`${BASE_URL}/nearby`, {
      params,
    });
    return extractData<Address[]>(response);
  },
};

