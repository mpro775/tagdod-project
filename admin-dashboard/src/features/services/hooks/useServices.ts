import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesApi } from '../api/servicesApi';
import type {
  ListServicesParams,
  ListEngineersParams,
  ListOffersParams,
  RequestsStatisticsParams,
  EngineersStatisticsParams,
  ServiceTypesStatisticsParams,
  RevenueStatisticsParams,
} from '../types/service.types';

const SERVICES_KEY = 'services';

// === إدارة الطلبات ===
export const useServices = (params: ListServicesParams = {}) => {
  return useQuery({
    queryKey: [SERVICES_KEY, 'list', params],
    queryFn: () => servicesApi.list(params),
  });
};

export const useService = (id: string) => {
  return useQuery({
    queryKey: [SERVICES_KEY, 'detail', id],
    queryFn: () => servicesApi.getById(id),
    enabled: !!id,
  });
};

export const useServiceOffers = (id: string) => {
  return useQuery({
    queryKey: [SERVICES_KEY, 'offers', id],
    queryFn: () => servicesApi.getOffers(id),
    enabled: !!id,
  });
};

export const useUpdateServiceStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: string; note?: string }) =>
      servicesApi.updateStatus(id, status, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SERVICES_KEY] });
    },
  });
};

export const useCancelService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      servicesApi.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SERVICES_KEY] });
    },
  });
};

export const useAssignEngineer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, engineerId, note }: { id: string; engineerId: string; note?: string }) =>
      servicesApi.assignEngineer(id, engineerId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SERVICES_KEY] });
    },
  });
};

// === إحصائيات ===
export const useOverviewStatistics = () => {
  return useQuery({
    queryKey: [SERVICES_KEY, 'statistics', 'overview'],
    queryFn: () => servicesApi.getOverviewStatistics(),
  });
};

export const useRequestsStatistics = (params: RequestsStatisticsParams) => {
  return useQuery({
    queryKey: [SERVICES_KEY, 'statistics', 'requests', params],
    queryFn: () => servicesApi.getRequestsStatistics(params),
  });
};

export const useEngineersStatistics = (params: EngineersStatisticsParams) => {
  return useQuery({
    queryKey: [SERVICES_KEY, 'statistics', 'engineers', params],
    queryFn: () => servicesApi.getEngineersStatistics(params),
  });
};

export const useServiceTypesStatistics = (params: ServiceTypesStatisticsParams) => {
  return useQuery({
    queryKey: [SERVICES_KEY, 'statistics', 'service-types', params],
    queryFn: () => servicesApi.getServiceTypesStatistics(params),
  });
};

export const useRevenueStatistics = (params: RevenueStatisticsParams) => {
  return useQuery({
    queryKey: [SERVICES_KEY, 'statistics', 'revenue', params],
    queryFn: () => servicesApi.getRevenueStatistics(params),
  });
};

// === إدارة المهندسين ===
export const useEngineers = (params: ListEngineersParams = {}) => {
  return useQuery({
    queryKey: [SERVICES_KEY, 'engineers', params],
    queryFn: () => servicesApi.getEngineersList(params),
  });
};

export const useEngineerStatistics = (id: string) => {
  return useQuery({
    queryKey: [SERVICES_KEY, 'engineer', 'statistics', id],
    queryFn: () => servicesApi.getEngineerStatistics(id),
    enabled: !!id,
  });
};

export const useEngineerOffers = (
  id: string,
  params: { status?: string; page?: number; limit?: number } = {}
) => {
  return useQuery({
    queryKey: [SERVICES_KEY, 'engineer', 'offers', id, params],
    queryFn: () => servicesApi.getEngineerOffers(id, params),
    enabled: !!id,
  });
};

// === إدارة العروض ===
export const useOffers = (params: ListOffersParams = {}) => {
  return useQuery({
    queryKey: [SERVICES_KEY, 'offers', params],
    queryFn: () => servicesApi.getOffersList(params),
  });
};
