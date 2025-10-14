import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bannersApi } from '../api/bannersApi';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import toast from 'react-hot-toast';
import type { ListBannersParams, CreateBannerDto, UpdateBannerDto } from '../types/banner.types';

const BANNERS_KEY = 'banners';

export const useBanners = (params: ListBannersParams = {}) => {
  return useQuery({
    queryKey: [BANNERS_KEY, params],
    queryFn: () => bannersApi.list(params),
  });
};

export const useBanner = (id: string) => {
  return useQuery({
    queryKey: [BANNERS_KEY, id],
    queryFn: () => bannersApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBannerDto) => bannersApi.create(data),
    onSuccess: () => {
      toast.success('تم إنشاء البانر بنجاح');
      queryClient.invalidateQueries({ queryKey: [BANNERS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useUpdateBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBannerDto }) => bannersApi.update(id, data),
    onSuccess: () => {
      toast.success('تم تحديث البانر بنجاح');
      queryClient.invalidateQueries({ queryKey: [BANNERS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useDeleteBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bannersApi.delete(id),
    onSuccess: () => {
      toast.success('تم حذف البانر بنجاح');
      queryClient.invalidateQueries({ queryKey: [BANNERS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useToggleBannerStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bannersApi.toggleStatus(id),
    onSuccess: () => {
      toast.success('تم تحديث حالة البانر بنجاح');
      queryClient.invalidateQueries({ queryKey: [BANNERS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

