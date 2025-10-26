import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { searchApi } from '../api/searchApi';
import type {
  SearchAnalyticsFilters,
  TopSearchTermsFilters,
  TrendsFilters,
} from '../types/search.types';

// Query keys
export const searchKeys = {
  all: ['search-analytics'] as const,
  stats: (filters?: SearchAnalyticsFilters) => [...searchKeys.all, 'stats', filters] as const,
  topTerms: (filters?: TopSearchTermsFilters) => [...searchKeys.all, 'top-terms', filters] as const,
  zeroResults: (limit?: number, page?: number) =>
    [...searchKeys.all, 'zero-results', limit, page] as const,
  trends: (filters?: TrendsFilters) => [...searchKeys.all, 'trends', filters] as const,
  mostSearchedProducts: (limit?: number) =>
    [...searchKeys.all, 'most-searched-products', limit] as const,
  mostSearchedCategories: (limit?: number) =>
    [...searchKeys.all, 'most-searched-categories', limit] as const,
  mostSearchedBrands: (limit?: number) =>
    [...searchKeys.all, 'most-searched-brands', limit] as const,
  performance: () => [...searchKeys.all, 'performance'] as const,
};

// Statistics hooks
export function useSearchStats(filters?: SearchAnalyticsFilters) {
  return useQuery({
    queryKey: searchKeys.stats(filters),
    queryFn: () => searchApi.getStats(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTopSearchTerms(filters?: TopSearchTermsFilters) {
  return useQuery({
    queryKey: searchKeys.topTerms(filters),
    queryFn: () => searchApi.getTopTerms(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useZeroResultSearches(limit = 20, page = 1) {
  return useQuery({
    queryKey: searchKeys.zeroResults(limit, page),
    queryFn: () => searchApi.getZeroResults(limit, page),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSearchTrends(filters?: TrendsFilters) {
  return useQuery({
    queryKey: searchKeys.trends(filters),
    queryFn: () => searchApi.getTrends(filters),
    staleTime: 10 * 60 * 1000,
  });
}

// Content analytics hooks
export function useMostSearchedProducts(limit = 20) {
  return useQuery({
    queryKey: searchKeys.mostSearchedProducts(limit),
    queryFn: () => searchApi.getMostSearchedProducts(limit),
    staleTime: 10 * 60 * 1000,
  });
}

export function useMostSearchedCategories(limit = 10) {
  return useQuery({
    queryKey: searchKeys.mostSearchedCategories(limit),
    queryFn: () => searchApi.getMostSearchedCategories(limit),
    staleTime: 10 * 60 * 1000,
  });
}

export function useMostSearchedBrands(limit = 10) {
  return useQuery({
    queryKey: searchKeys.mostSearchedBrands(limit),
    queryFn: () => searchApi.getMostSearchedBrands(limit),
    staleTime: 10 * 60 * 1000,
  });
}

// Performance hooks
export function usePerformanceMetrics() {
  return useQuery({
    queryKey: searchKeys.performance(),
    queryFn: () => searchApi.getPerformanceMetrics(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useClearCache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => searchApi.clearCache(),
    onSuccess: () => {
      // Invalidate all search queries
      queryClient.invalidateQueries({ queryKey: searchKeys.all });
    },
  });
}

