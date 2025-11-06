import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { bannersApi, handleBannerApiError } from '../api/bannersApi';
import type {
  CreateBannerDto,
  UpdateBannerDto,
  ListBannersDto,
} from '../types/banner.types';

// Query keys
export const BANNER_QUERY_KEYS = {
  all: ['banners'] as const,
  lists: () => [...BANNER_QUERY_KEYS.all, 'list'] as const,
  list: (params: ListBannersDto) => [...BANNER_QUERY_KEYS.lists(), params] as const,
  details: () => [...BANNER_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...BANNER_QUERY_KEYS.details(), id] as const,
  analytics: () => [...BANNER_QUERY_KEYS.all, 'analytics'] as const,
  bannerAnalytics: (id: string) => [...BANNER_QUERY_KEYS.analytics(), id] as const,
};

// Get all banners with filters
export const useBanners = (params: ListBannersDto = {}) => {
  return useQuery({
    queryKey: BANNER_QUERY_KEYS.list(params),
    queryFn: async () => {
      const response = await bannersApi.getBanners(params);
      return {
        banners: response.data || [],
        pagination: response.pagination || {},
      };
    },
  });
};

// Get single banner
export const useBanner = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: BANNER_QUERY_KEYS.detail(id),
    queryFn: () => bannersApi.getBanner(id),
    enabled: options?.enabled !== false && !!id,
  });
};

// Create banner mutation
export const useCreateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBannerDto) => bannersApi.createBanner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANNER_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: BANNER_QUERY_KEYS.analytics() });
      toast.success('تم إنشاء البانر بنجاح');
    },
    onError: (error: any) => {
      const apiError = handleBannerApiError(error);
      toast.error(apiError.error.message);
    },
  });
};

// Update banner mutation
export const useUpdateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBannerDto }) =>
      bannersApi.updateBanner(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: BANNER_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: BANNER_QUERY_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: BANNER_QUERY_KEYS.analytics() });
      toast.success('تم تحديث البانر بنجاح');
    },
    onError: (error: any) => {
      const apiError = handleBannerApiError(error);
      toast.error(apiError.error.message);
    },
  });
};

// Delete banner mutation
export const useDeleteBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bannersApi.deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANNER_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: BANNER_QUERY_KEYS.analytics() });
      toast.success('تم حذف البانر بنجاح');
    },
    onError: (error: any) => {
      const apiError = handleBannerApiError(error);
      toast.error(apiError.error.message);
    },
  });
};

// Toggle banner status mutation
export const useToggleBannerStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bannersApi.toggleBannerStatus(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: BANNER_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: BANNER_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: BANNER_QUERY_KEYS.analytics() });
      
      const isActive = data.isActive;
      toast.success(isActive ? 'تم تفعيل البانر' : 'تم تعطيل البانر');
    },
    onError: (error: any) => {
      const apiError = handleBannerApiError(error);
      toast.error(apiError.error.message);
    },
  });
};

// Get banner analytics
export const useBannerAnalytics = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: BANNER_QUERY_KEYS.bannerAnalytics(id),
    queryFn: () => bannersApi.getBannerAnalytics(id),
    enabled: options?.enabled !== false && !!id,
  });
};

// Get all banners analytics
export const useBannersAnalytics = () => {
  return useQuery({
    queryKey: BANNER_QUERY_KEYS.analytics(),
    queryFn: () => bannersApi.getBannersAnalytics(),
  });
};
