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
import toast from 'react-hot-toast';

const SERVICES_KEY = 'services';

// === إدارة الطلبات ===
export const useServices = (params: ListServicesParams = {}) => {
  return useQuery({
    queryKey: [SERVICES_KEY, 'list', params],
    queryFn: () => servicesApi.list(params),
    select: (data) => {
      const items = data.items || [];
      // Normalize data: map userId (when it's an object) to user field
      const normalizedItems = items.map((item: any) => {
        if (item.userId && typeof item.userId === 'object' && item.userId._id) {
          return {
            ...item,
            user: item.userId,
            userId: item.userId._id,
          };
        }
        return item;
      });
      return {
        data: normalizedItems,
        meta: data.meta,
      };
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useService = (id: string) => {
  return useQuery({
    queryKey: [SERVICES_KEY, 'detail', id],
    queryFn: () => servicesApi.getById(id),
    enabled: !!id,
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
  });
};

export const useServiceOffers = (id: string) => {
  return useQuery({
    queryKey: [SERVICES_KEY, 'offers', id],
    queryFn: () => servicesApi.getOffers(id),
    enabled: !!id,
    retry: 2,
    retryDelay: 1000,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useUpdateServiceStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: string; note?: string }) =>
      servicesApi.updateStatus(id, status, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SERVICES_KEY] });
      toast.success('تم تحديث حالة الخدمة بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.message || 'فشل في تحديث حالة الخدمة');
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
      toast.success('تم إلغاء الخدمة بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.message || 'فشل في إلغاء الخدمة');
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
      toast.success('تم تعيين المهندس بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.message || 'فشل في تعيين المهندس');
    },
  });
};

// === إحصائيات ===
export const useOverviewStatistics = () => {
  return useQuery({
    queryKey: [SERVICES_KEY, 'statistics', 'overview'],
    queryFn: () => servicesApi.getOverviewStatistics(),
    retry: 2,
    retryDelay: 1000,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useRequestsStatistics = (params: RequestsStatisticsParams) => {
  return useQuery({
    queryKey: [SERVICES_KEY, 'statistics', 'requests', params],
    queryFn: () => servicesApi.getRequestsStatistics(params),
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
  });
};

export const useEngineersStatistics = (params: EngineersStatisticsParams) => {
  return useQuery({
    queryKey: [SERVICES_KEY, 'statistics', 'engineers', params],
    queryFn: () => servicesApi.getEngineersStatistics(params),
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
  });
};

export const useServiceTypesStatistics = (params: ServiceTypesStatisticsParams) => {
  return useQuery({
    queryKey: [SERVICES_KEY, 'statistics', 'service-types', params],
    queryFn: () => servicesApi.getServiceTypesStatistics(params),
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
  });
};

export const useRevenueStatistics = (params: RevenueStatisticsParams) => {
  return useQuery({
    queryKey: [SERVICES_KEY, 'statistics', 'revenue', params],
    queryFn: () => servicesApi.getRevenueStatistics(params),
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
  });
};

// === إدارة المهندسين ===
export const useEngineersOverviewStatistics = () => {
  return useQuery({
    queryKey: [SERVICES_KEY, 'engineers-overview-stats'],
    queryFn: () => servicesApi.getEngineersOverviewStatistics(),
    retry: 2,
    retryDelay: 1000,
    staleTime: 10 * 60 * 1000,
  });
};

export const useEngineers = (params: ListEngineersParams = {}) => {
  return useQuery({
    queryKey: [SERVICES_KEY, 'engineers', params],
    queryFn: () => servicesApi.getEngineersList(params),
    select: (data) => ({
      data: data.items || [],
      meta: data.meta,
    }),
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
  });
};

export const useEngineerStatistics = (id: string) => {
  return useQuery({
    queryKey: [SERVICES_KEY, 'engineer', 'statistics', id],
    queryFn: () => servicesApi.getEngineerStatistics(id),
    enabled: !!id,
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
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
    select: (data) => ({
      data: data.data,
      meta: data.meta,
    }),
    retry: 2,
    retryDelay: 1000,
    staleTime: 2 * 60 * 1000,
  });
};

// === إدارة العروض ===
export const useOffersStatistics = (params?: { dateFrom?: string; dateTo?: string }) => {
  return useQuery({
    queryKey: [SERVICES_KEY, 'offers-statistics', params],
    queryFn: () => servicesApi.getOffersStatistics(params),
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
  });
};

export const useOffers = (params: ListOffersParams = {}) => {
  return useQuery({
    queryKey: [SERVICES_KEY, 'offers', params],
    queryFn: () => servicesApi.getOffersList(params),
    select: (data) => {
      const items = data.items || [];
      // Normalize data: map engineerId and requestId to engineer and request
      const normalizedItems = items.map((item: any) => {
        const normalized: any = { ...item };
        // Map engineerId (when populated) to engineer
        if (item.engineerId && typeof item.engineerId === 'object' && item.engineerId._id) {
          normalized.engineer = item.engineerId;
        }
        // Map requestId (when populated) to request
        if (item.requestId && typeof item.requestId === 'object' && item.requestId._id) {
          normalized.request = item.requestId;
        }
        return normalized;
      });
      return {
        data: normalizedItems,
        meta: data.meta,
      };
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
  });
};

// === إدارة قبول/رفض/إلغاء العروض ===
export const useAcceptOffer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ requestId, offerId }: { requestId: string; offerId: string }) =>
      servicesApi.acceptOffer(requestId, offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SERVICES_KEY] });
      toast.success('تم قبول العرض بنجاح');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'فشل في قبول العرض');
    },
  });
};

export const useRejectOffer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ offerId, reason }: { offerId: string; reason?: string }) =>
      servicesApi.rejectOffer(offerId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SERVICES_KEY] });
      toast.success('تم رفض العرض بنجاح');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'فشل في رفض العرض');
    },
  });
};

export const useCancelOffer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ offerId, reason }: { offerId: string; reason?: string }) =>
      servicesApi.cancelOffer(offerId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SERVICES_KEY] });
      toast.success('تم إلغاء العرض بنجاح');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'فشل في إلغاء العرض');
    },
  });
};