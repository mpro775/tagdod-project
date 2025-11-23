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
  PricingQueryDto,
  CreateEngineerCouponDto,
  EngineerCouponStats,
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

export const useCouponAnalytics = (id?: string, period?: number) => {
  // If id is provided, get individual coupon analytics
  if (id) {
    return useQuery({
      queryKey: [MARKETING_KEY, 'coupons', id, 'analytics'],
      queryFn: () => marketingApi.getCouponAnalytics(id),
      enabled: !!id,
    });
  }

  // If no id, get general coupon analytics
  return useQuery({
    queryKey: [MARKETING_KEY, 'coupons', 'analytics', period || 30],
    queryFn: () => marketingApi.getCouponsAnalytics(period || 30),
  });
};

export const useCouponStatistics = (period?: number) => {
  return useQuery({
    queryKey: [MARKETING_KEY, 'coupons', 'statistics', period || 30],
    queryFn: () => marketingApi.getCouponsStatistics(period || 30),
  });
};

export const useCouponUsageHistory = (id: string) => {
  return useQuery({
    queryKey: [MARKETING_KEY, 'coupons', id, 'usage-history'],
    queryFn: () => marketingApi.getCouponUsageHistory(id),
    enabled: !!id,
  });
};

export const useCouponPerformance = (period?: number) => {
  return useQuery({
    queryKey: [MARKETING_KEY, 'coupons', 'performance', period || 30],
    queryFn: () => marketingApi.getCouponsAnalytics(period || 30),
  });
};

export const useValidateCoupon = () => {
  return useMutation({
    mutationFn: (data: ValidateCouponDto) => marketingApi.validateCoupon(data),
    onError: ErrorHandler.showError,
  });
};

export const useValidateCouponCode = () => {
  return useMutation({
    mutationFn: ({
      code,
      userId,
      orderAmount,
      productIds,
    }: {
      code: string;
      userId?: string;
      orderAmount?: number;
      productIds?: string[];
    }) => marketingApi.validateCouponCode(code, userId, orderAmount, productIds),
    onError: ErrorHandler.showError,
  });
};

export const usePublicCoupons = (params?: { page?: number; limit?: number }) => {
  const { page = 1, limit = 20 } = params || {};

  return useQuery({
    queryKey: [MARKETING_KEY, 'coupons', 'public', page, limit],
    queryFn: () => marketingApi.getPublicCoupons(page, limit),
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

export const useBulkGenerateCoupons = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      prefix: string;
      count: number;
      length: number;
      type: string;
      discountValue: number;
      validUntil: string;
      name?: string;
      description?: string;
      minimumOrderAmount?: number;
      usageLimit?: number;
      usageLimitPerUser?: number;
    }) => marketingApi.bulkGenerateCoupons(data),
    onSuccess: () => {
      toast.success('تم إنشاء الكوبونات بنجاح');
      queryClient.invalidateQueries({ queryKey: [MARKETING_KEY, 'coupons'] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useExportCouponsData = () => {
  return useMutation({
    mutationFn: ({ format, period }: { format?: string; period?: number }) =>
      marketingApi.exportCouponsData(format || 'csv', period || 30),
    onSuccess: (data) => {
      toast.success('تم تصدير البيانات بنجاح');
      if (data?.fileUrl) {
        window.open(data.fileUrl, '_blank');
      }
    },
    onError: ErrorHandler.showError,
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

// ==================== ENGINEER COUPONS HOOKS ====================

export const useEngineerCoupons = (engineerId: string) => {
  return useQuery({
    queryKey: [MARKETING_KEY, 'engineers', engineerId, 'coupons'],
    queryFn: () => marketingApi.getEngineerCoupons(engineerId),
    enabled: !!engineerId,
  });
};

export const useEngineerCouponStats = (engineerId: string) => {
  return useQuery({
    queryKey: [MARKETING_KEY, 'engineers', engineerId, 'coupons', 'stats'],
    queryFn: () => marketingApi.getEngineerCouponStats(engineerId),
    enabled: !!engineerId,
  });
};

export const useCreateEngineerCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEngineerCouponDto) => marketingApi.createEngineerCoupon(data),
    onSuccess: () => {
      toast.success('تم إنشاء كوبون المهندس بنجاح');
      queryClient.invalidateQueries({ queryKey: [MARKETING_KEY, 'coupons'] });
      queryClient.invalidateQueries({ queryKey: [MARKETING_KEY, 'engineers'] });
    },
    onError: ErrorHandler.showError,
  });
};
