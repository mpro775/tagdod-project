import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { brandsApi } from '../api/brandsApi';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import toast from 'react-hot-toast';
import type {
  ListBrandsParams,
  CreateBrandDto,
  UpdateBrandDto,
} from '../types/brand.types';

const BRANDS_KEY = 'brands';

export const useBrands = (params: ListBrandsParams = {}) => {
  return useQuery({
    queryKey: [BRANDS_KEY, params],
    queryFn: () => brandsApi.list(params),
  });
};

export const useBrand = (id: string) => {
  return useQuery({
    queryKey: [BRANDS_KEY, id],
    queryFn: () => brandsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBrandDto) => brandsApi.create(data),
    onSuccess: () => {
      toast.success('تم إنشاء العلامة بنجاح');
      queryClient.invalidateQueries({ queryKey: [BRANDS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBrandDto }) =>
      brandsApi.update(id, data),
    onSuccess: () => {
      toast.success('تم تحديث العلامة بنجاح');
      queryClient.invalidateQueries({ queryKey: [BRANDS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => brandsApi.delete(id),
    onSuccess: () => {
      toast.success('تم حذف العلامة بنجاح');
      queryClient.invalidateQueries({ queryKey: [BRANDS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useToggleBrandStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => brandsApi.toggleStatus(id),
    onSuccess: () => {
      toast.success('تم تحديث حالة العلامة بنجاح');
      queryClient.invalidateQueries({ queryKey: [BRANDS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

