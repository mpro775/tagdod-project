import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { couponsApi } from '../api/couponsApi';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import toast from 'react-hot-toast';
import type {
  ListCouponsParams,
  CreateCouponDto,
  UpdateCouponDto,
  BulkGenerateCouponsDto,
} from '../types/coupon.types';

const COUPONS_KEY = 'coupons';

// List coupons
export const useCoupons = (params: ListCouponsParams) => {
  return useQuery({
    queryKey: [COUPONS_KEY, params],
    queryFn: () => couponsApi.list(params),
    placeholderData: (previousData) => previousData,
  });
};

// Get single coupon
export const useCoupon = (id: string) => {
  return useQuery({
    queryKey: [COUPONS_KEY, id],
    queryFn: () => couponsApi.getById(id),
    enabled: !!id,
  });
};

// Create coupon
export const useCreateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCouponDto) => couponsApi.create(data),
    onSuccess: () => {
      toast.success('تم إنشاء الكوبون بنجاح');
      queryClient.invalidateQueries({ queryKey: [COUPONS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Update coupon
export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCouponDto }) =>
      couponsApi.update(id, data),
    onSuccess: () => {
      toast.success('تم تحديث الكوبون بنجاح');
      queryClient.invalidateQueries({ queryKey: [COUPONS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Delete coupon
export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => couponsApi.delete(id),
    onSuccess: () => {
      toast.success('تم حذف الكوبون بنجاح');
      queryClient.invalidateQueries({ queryKey: [COUPONS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Toggle status
export const useToggleCouponStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => couponsApi.toggleStatus(id),
    onSuccess: () => {
      toast.success('تم تحديث حالة الكوبون بنجاح');
      queryClient.invalidateQueries({ queryKey: [COUPONS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Bulk generate
export const useBulkGenerateCoupons = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkGenerateCouponsDto) => couponsApi.bulkGenerate(data),
    onSuccess: (coupons) => {
      toast.success(`تم إنشاء ${coupons.length} كوبون بنجاح`);
      queryClient.invalidateQueries({ queryKey: [COUPONS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Get analytics
export const useCouponAnalytics = (id: string) => {
  return useQuery({
    queryKey: [COUPONS_KEY, id, 'analytics'],
    queryFn: () => couponsApi.getAnalytics(id),
    enabled: !!id,
  });
};

// Get usage history
export const useCouponUsageHistory = (id: string) => {
  return useQuery({
    queryKey: [COUPONS_KEY, id, 'usage-history'],
    queryFn: () => couponsApi.getUsageHistory(id),
    enabled: !!id,
  });
};

