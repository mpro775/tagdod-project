import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marketingApi } from '../api/marketingApi';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import toast from 'react-hot-toast';
import type { 
  CreatePriceRuleDto,
  UpdatePriceRuleDto,
  CreateCouponDto,
  UpdateCouponDto,
  CreateBannerDto,
  UpdateBannerDto,
  ListPriceRulesParams,
  ListCouponsParams,
  ListBannersParams,
  ValidateCouponDto,
  PricingQueryDto
} from '../api/marketingApi';

const MARKETING_KEY = 'marketing';

// ==================== PRICE RULES HOOKS ====================

export const usePriceRules = (params?: ListPriceRulesParams) => {
  return useQuery({
    queryKey: [MARKETING_KEY, 'price-rules', params],
    queryFn: () => marketingApi.listPriceRules(params),
  });
};

export const usePriceRule = (id: string) => {
  return useQuery({
    queryKey: [MARKETING_KEY, 'price-rules', id],
    queryFn: () => marketingApi.getPriceRule(id),
    enabled: !!id,
  });
};

export const useCreatePriceRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePriceRuleDto) => marketingApi.createPriceRule(data),
    onSuccess: () => {
      toast.success('تم إنشاء قاعدة السعر بنجاح');
      queryClient.invalidateQueries({ queryKey: [MARKETING_KEY, 'price-rules'] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useUpdatePriceRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePriceRuleDto }) => 
      marketingApi.updatePriceRule(id, data),
    onSuccess: () => {
      toast.success('تم تحديث قاعدة السعر بنجاح');
      queryClient.invalidateQueries({ queryKey: [MARKETING_KEY, 'price-rules'] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useDeletePriceRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => marketingApi.deletePriceRule(id),
    onSuccess: () => {
      toast.success('تم حذف قاعدة السعر بنجاح');
      queryClient.invalidateQueries({ queryKey: [MARKETING_KEY, 'price-rules'] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useTogglePriceRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => marketingApi.togglePriceRule(id),
    onSuccess: () => {
      toast.success('تم تحديث حالة قاعدة السعر بنجاح');
      queryClient.invalidateQueries({ queryKey: [MARKETING_KEY, 'price-rules'] });
    },
    onError: ErrorHandler.showError,
  });
};

export const usePreviewPriceRule = () => {
  return useMutation({
    mutationFn: (data: {
      ruleId: string;
      variantId: string;
      currency?: string;
      qty?: number;
      accountType?: string;
    }) => marketingApi.previewPriceRule(data),
    onError: ErrorHandler.showError,
  });
};

// ==================== COUPONS HOOKS ====================

export const useCoupons = (params?: ListCouponsParams) => {
  return useQuery({
    queryKey: [MARKETING_KEY, 'coupons', params],
    queryFn: () => marketingApi.listCoupons(params),
  });
};

export const useCoupon = (id: string) => {
  return useQuery({
    queryKey: [MARKETING_KEY, 'coupons', id],
    queryFn: () => marketingApi.getCoupon(id),
    enabled: !!id,
  });
};

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCouponDto) => marketingApi.createCoupon(data),
    onSuccess: () => {
      toast.success('تم إنشاء الكوبون بنجاح');
      queryClient.invalidateQueries({ queryKey: [MARKETING_KEY, 'coupons'] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCouponDto }) => 
      marketingApi.updateCoupon(id, data),
    onSuccess: () => {
      toast.success('تم تحديث الكوبون بنجاح');
      queryClient.invalidateQueries({ queryKey: [MARKETING_KEY, 'coupons'] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => marketingApi.deleteCoupon(id),
    onSuccess: () => {
      toast.success('تم حذف الكوبون بنجاح');
      queryClient.invalidateQueries({ queryKey: [MARKETING_KEY, 'coupons'] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useToggleCouponStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => marketingApi.toggleCouponStatus(id),
    onSuccess: () => {
      toast.success('تم تحديث حالة الكوبون بنجاح');
      queryClient.invalidateQueries({ queryKey: [MARKETING_KEY, 'coupons'] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useCouponAnalytics = (id: string) => {
  return useQuery({
    queryKey: [MARKETING_KEY, 'coupons', id, 'analytics'],
    queryFn: () => marketingApi.getCouponAnalytics(id),
    enabled: !!id,
  });
};

export const useCouponUsageHistory = (id: string) => {
  return useQuery({
    queryKey: [MARKETING_KEY, 'coupons', id, 'usage-history'],
    queryFn: () => marketingApi.getCouponUsageHistory(id),
    enabled: !!id,
  });
};

export const useValidateCoupon = () => {
  return useMutation({
    mutationFn: (data: ValidateCouponDto) => 
      marketingApi.validateCoupon(data),
    onError: ErrorHandler.showError,
  });
};

export const usePublicCoupons = () => {
  return useQuery({
    queryKey: [MARKETING_KEY, 'coupons', 'public'],
    queryFn: () => marketingApi.getPublicCoupons(),
  });
};

export const useAutoApplyCoupons = (userId?: string, accountType?: string) => {
  return useQuery({
    queryKey: [MARKETING_KEY, 'coupons', 'auto-apply', userId, accountType],
    queryFn: () => marketingApi.getAutoApplyCoupons(userId, accountType),
  });
};

export const useCouponByCode = (code: string) => {
  return useQuery({
    queryKey: [MARKETING_KEY, 'coupons', 'code', code],
    queryFn: () => marketingApi.getCouponByCode(code),
    enabled: !!code,
  });
};

// ==================== BANNERS HOOKS ====================

export const useBanners = (params?: ListBannersParams) => {
  return useQuery({
    queryKey: [MARKETING_KEY, 'banners', params],
    queryFn: () => marketingApi.listBanners(params),
  });
};

export const useBanner = (id: string) => {
  return useQuery({
    queryKey: [MARKETING_KEY, 'banners', id],
    queryFn: () => marketingApi.getBanner(id),
    enabled: !!id,
  });
};

export const useCreateBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBannerDto) => marketingApi.createBanner(data),
    onSuccess: () => {
      toast.success('تم إنشاء البانر بنجاح');
      queryClient.invalidateQueries({ queryKey: [MARKETING_KEY, 'banners'] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useUpdateBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBannerDto }) => 
      marketingApi.updateBanner(id, data),
    onSuccess: () => {
      toast.success('تم تحديث البانر بنجاح');
      queryClient.invalidateQueries({ queryKey: [MARKETING_KEY, 'banners'] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useDeleteBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => marketingApi.deleteBanner(id),
    onSuccess: () => {
      toast.success('تم حذف البانر بنجاح');
      queryClient.invalidateQueries({ queryKey: [MARKETING_KEY, 'banners'] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useToggleBannerStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => marketingApi.toggleBannerStatus(id),
    onSuccess: () => {
      toast.success('تم تحديث حالة البانر بنجاح');
      queryClient.invalidateQueries({ queryKey: [MARKETING_KEY, 'banners'] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useActiveBanners = (location?: string) => {
  return useQuery({
    queryKey: [MARKETING_KEY, 'banners', 'active', location],
    queryFn: () => marketingApi.getActiveBanners(location),
  });
};

export const useTrackBannerView = () => {
  return useMutation({
    mutationFn: (id: string) => marketingApi.trackBannerView(id),
    onError: ErrorHandler.showError,
  });
};

export const useTrackBannerClick = () => {
  return useMutation({
    mutationFn: (id: string) => marketingApi.trackBannerClick(id),
    onError: ErrorHandler.showError,
  });
};

// ==================== PRICING HOOKS ====================

export const useEffectivePrice = (params: PricingQueryDto) => {
  return useQuery({
    queryKey: [MARKETING_KEY, 'pricing', params],
    queryFn: () => marketingApi.getEffectivePrice(params),
    enabled: !!params.variantId,
  });
};
