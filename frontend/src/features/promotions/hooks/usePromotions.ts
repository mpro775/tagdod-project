import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { promotionsApi } from '../api/promotionsApi';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import toast from 'react-hot-toast';
import type { ListPriceRulesParams, CreatePriceRuleDto, UpdatePriceRuleDto } from '../types/promotion.types';

const PROMOTIONS_KEY = 'promotions';

export const usePromotions = (params: ListPriceRulesParams = {}) => {
  return useQuery({
    queryKey: [PROMOTIONS_KEY, params],
    queryFn: () => promotionsApi.list(params),
  });
};

export const usePromotion = (id: string) => {
  return useQuery({
    queryKey: [PROMOTIONS_KEY, id],
    queryFn: () => promotionsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreatePromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePriceRuleDto) => promotionsApi.create(data),
    onSuccess: () => {
      toast.success('تم إنشاء العرض بنجاح');
      queryClient.invalidateQueries({ queryKey: [PROMOTIONS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useUpdatePromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePriceRuleDto }) => promotionsApi.update(id, data),
    onSuccess: () => {
      toast.success('تم تحديث العرض بنجاح');
      queryClient.invalidateQueries({ queryKey: [PROMOTIONS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useDeletePromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => promotionsApi.delete(id),
    onSuccess: () => {
      toast.success('تم حذف العرض بنجاح');
      queryClient.invalidateQueries({ queryKey: [PROMOTIONS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useTogglePromotionStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => promotionsApi.toggleStatus(id),
    onSuccess: () => {
      toast.success('تم تحديث حالة العرض بنجاح');
      queryClient.invalidateQueries({ queryKey: [PROMOTIONS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

