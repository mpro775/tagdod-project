import apiClient from '../../../core/api/client';
import type {
  SearchStats,
  TopSearchTerm,
  ZeroResultSearch,
  SearchTrend,
  SearchedProduct,
  SearchedCategory,
  SearchedBrand,
  PerformanceMetrics,
  SearchAnalyticsFilters,
  TopSearchTermsFilters,
  TrendsFilters,
} from '../types/search.types';

const BASE_URL = '/admin/search';

export const searchApi = {
  // Statistics & Analytics
  async getStats(filters?: SearchAnalyticsFilters): Promise<SearchStats> {
    const response = await apiClient.get(`${BASE_URL}/stats`, { params: filters });
    return response.data.data;
  },

  async getTopTerms(filters?: TopSearchTermsFilters): Promise<TopSearchTerm[]> {
    const response = await apiClient.get(`${BASE_URL}/top-terms`, { params: filters });
    return response.data.data;
  },

  async getZeroResults(limit = 20, page = 1): Promise<{ data: ZeroResultSearch[]; pagination: any }> {
    const response = await apiClient.get(`${BASE_URL}/zero-results`, {
      params: { limit, page },
    });
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  },

  async getTrends(filters?: TrendsFilters): Promise<SearchTrend[]> {
    const response = await apiClient.get(`${BASE_URL}/trends`, { params: filters });
    return response.data.data;
  },

  // Content Analytics
  async getMostSearchedProducts(limit = 20): Promise<SearchedProduct[]> {
    const response = await apiClient.get(`${BASE_URL}/most-searched-products`, {
      params: { limit },
    });
    return response.data.data;
  },

  async getMostSearchedCategories(limit = 10): Promise<SearchedCategory[]> {
    const response = await apiClient.get(`${BASE_URL}/most-searched-categories`, {
      params: { limit },
    });
    return response.data.data;
  },

  async getMostSearchedBrands(limit = 10): Promise<SearchedBrand[]> {
    const response = await apiClient.get(`${BASE_URL}/most-searched-brands`, {
      params: { limit },
    });
    return response.data.data;
  },

  // Performance
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const response = await apiClient.get(`${BASE_URL}/performance`);
    return response.data.data;
  },

  async clearCache(): Promise<void> {
    await apiClient.post(`${BASE_URL}/clear-cache`);
  },
};

