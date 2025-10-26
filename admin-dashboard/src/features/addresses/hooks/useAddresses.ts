import { useQuery } from '@tanstack/react-query';
import { addressesApi } from '../api/addressesApi';
import type { AddressFilters, UsageStatsFilters, NearbySearchParams } from '../types/address.types';

// Query keys
export const addressesKeys = {
  all: ['addresses'] as const,
  stats: () => [...addressesKeys.all, 'stats'] as const,
  topCities: (limit?: number) => [...addressesKeys.all, 'top-cities', limit] as const,
  mostUsed: (limit?: number) => [...addressesKeys.all, 'most-used', limit] as const,
  recentlyUsed: (limit?: number) => [...addressesKeys.all, 'recently-used', limit] as const,
  neverUsed: (limit?: number) => [...addressesKeys.all, 'never-used', limit] as const,
  usageAnalytics: (filters?: UsageStatsFilters) => [...addressesKeys.all, 'usage-analytics', filters] as const,
  geographicAnalytics: () => [...addressesKeys.all, 'geographic-analytics'] as const,
  list: (filters?: AddressFilters) => [...addressesKeys.all, 'list', filters] as const,
  userAddresses: (userId: string, includeDeleted?: boolean) =>
    [...addressesKeys.all, 'user', userId, includeDeleted] as const,
  userCount: (userId: string) => [...addressesKeys.all, 'user', userId, 'count'] as const,
  nearby: (params: NearbySearchParams) => [...addressesKeys.all, 'nearby', params] as const,
};

// Statistics hooks
export function useAddressStats() {
  return useQuery({
    queryKey: addressesKeys.stats(),
    queryFn: () => addressesApi.getStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTopCities(limit = 10) {
  return useQuery({
    queryKey: addressesKeys.topCities(limit),
    queryFn: () => addressesApi.getTopCities(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useMostUsedAddresses(limit = 10) {
  return useQuery({
    queryKey: addressesKeys.mostUsed(limit),
    queryFn: () => addressesApi.getMostUsed(limit),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRecentlyUsedAddresses(limit = 20) {
  return useQuery({
    queryKey: addressesKeys.recentlyUsed(limit),
    queryFn: () => addressesApi.getRecentlyUsed(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useNeverUsedAddresses(limit = 20) {
  return useQuery({
    queryKey: addressesKeys.neverUsed(limit),
    queryFn: () => addressesApi.getNeverUsed(limit),
    staleTime: 10 * 60 * 1000,
  });
}

export function useUsageAnalytics(filters?: UsageStatsFilters) {
  return useQuery({
    queryKey: addressesKeys.usageAnalytics(filters),
    queryFn: () => addressesApi.getUsageAnalytics(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useGeographicAnalytics() {
  return useQuery({
    queryKey: addressesKeys.geographicAnalytics(),
    queryFn: () => addressesApi.getGeographicAnalytics(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

// List & Search hooks
export function useAddressList(filters?: AddressFilters) {
  return useQuery({
    queryKey: addressesKeys.list(filters),
    queryFn: () => addressesApi.list(filters),
    staleTime: 2 * 60 * 1000,
  });
}

export function useUserAddresses(userId: string, includeDeleted = false) {
  return useQuery({
    queryKey: addressesKeys.userAddresses(userId, includeDeleted),
    queryFn: () => addressesApi.getUserAddresses(userId, includeDeleted),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserAddressCount(userId: string) {
  return useQuery({
    queryKey: addressesKeys.userCount(userId),
    queryFn: () => addressesApi.getUserAddressCount(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useNearbyAddresses(params: NearbySearchParams, enabled = true) {
  return useQuery({
    queryKey: addressesKeys.nearby(params),
    queryFn: () => addressesApi.searchNearby(params),
    enabled,
    staleTime: 10 * 60 * 1000,
  });
}

