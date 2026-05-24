import apiClient from '../../../core/api/client';
import { unwrapApiData, unwrapApiMeta } from '@/core/api/response';
import type {
  SearchStats,
  TopSearchTerm,
  ZeroResultSearch,
  SearchPagination,
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
    return unwrapApiData<SearchStats>(response.data);
  },

  async getTopTerms(filters?: TopSearchTermsFilters): Promise<TopSearchTerm[]> {
    const response = await apiClient.get(`${BASE_URL}/top-terms`, { params: filters });
    const terms = unwrapApiData<Array<TopSearchTerm & { term?: string }>>(response.data, []);
    return terms.map((term) => ({
      query: term.query || term.term || '',
      count: term.count || 0,
      hasResults: term.hasResults ?? (term.count || 0) > 0,
      averageResults: term.averageResults || 0,
    }));
  },

  async getZeroResults(
    limit = 20,
    page = 1,
  ): Promise<{ data: ZeroResultSearch[]; pagination?: SearchPagination }> {
    const response = await apiClient.get(`${BASE_URL}/zero-results`, {
      params: { limit, page },
    });
    return {
      data: unwrapApiData<ZeroResultSearch[]>(response.data, []),
      pagination: unwrapApiMeta<SearchPagination>(response.data),
    };
  },

  async getTrends(filters?: TrendsFilters): Promise<SearchTrend[]> {
    const response = await apiClient.get(`${BASE_URL}/trends`, { params: filters });
    return unwrapApiData<SearchTrend[]>(response.data, []);
  },

  // Content Analytics
  async getMostSearchedProducts(limit = 20): Promise<SearchedProduct[]> {
    const response = await apiClient.get(`${BASE_URL}/most-searched-products`, {
      params: { limit },
    });
    return unwrapApiData<SearchedProduct[]>(response.data, []);
  },

  async getMostSearchedCategories(limit = 10): Promise<SearchedCategory[]> {
    const response = await apiClient.get(`${BASE_URL}/most-searched-categories`, {
      params: { limit },
    });
    return unwrapApiData<SearchedCategory[]>(response.data, []);
  },

  async getMostSearchedBrands(limit = 10): Promise<SearchedBrand[]> {
    const response = await apiClient.get(`${BASE_URL}/most-searched-brands`, {
      params: { limit },
    });
    return unwrapApiData<SearchedBrand[]>(response.data, []);
  },

  // Performance
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const response = await apiClient.get(`${BASE_URL}/performance`);
    return unwrapApiData<PerformanceMetrics>(response.data);
  },

  async clearCache(): Promise<void> {
    await apiClient.post(`${BASE_URL}/clear-cache`);
  },
};

