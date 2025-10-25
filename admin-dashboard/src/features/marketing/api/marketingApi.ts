import { apiClient } from '@/core/api/client';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/common.types';

// Types
export interface PriceRule {
  _id: string;
  active: boolean;
  priority: number;
  startAt: Date;
  endAt: Date;
  conditions: {
    categoryId?: string;
    productId?: string;
    variantId?: string;
    brandId?: string;
    currency?: string;
    minQty?: number;
    accountType?: string;
  };
  effects: {
    percentOff?: number;
    amountOff?: number;
    specialPrice?: number;
    badge?: string;
    giftSku?: string;
  };
  usageLimits?: {
    maxUses?: number;
    maxUsesPerUser?: number;
    currentUses: number;
  };
  metadata?: {
    title?: string;
    description?: string;
    termsAndConditions?: string;
  };
  stats: {
    views: number;
    appliedCount: number;
    revenue: number;
    savings: number;
  };
  couponCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePriceRuleDto {
  active?: boolean;
  priority: number;
  startAt: string;
  endAt: string;
  conditions?: PriceRule['conditions'];
  effects: PriceRule['effects'];
  usageLimits?: PriceRule['usageLimits'];
  metadata?: PriceRule['metadata'];
  couponCode?: string;
}

export interface UpdatePriceRuleDto {
  active?: boolean;
  priority?: number;
  startAt?: string;
  endAt?: string;
  conditions?: PriceRule['conditions'];
  effects?: PriceRule['effects'];
  usageLimits?: PriceRule['usageLimits'];
  metadata?: PriceRule['metadata'];
  couponCode?: string;
}

export interface ListPriceRulesParams {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
}

export interface Coupon {
  _id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';
  status: 'active' | 'inactive' | 'expired' | 'exhausted';
  visibility: 'public' | 'private' | 'hidden';
  discountValue?: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  appliesTo: 'all_products' | 'specific_products' | 'specific_categories' | 'specific_brands' | 'minimum_order_amount';
  applicableProductIds: string[];
  applicableCategoryIds: string[];
  applicableBrandIds: string[];
  applicableUserIds: string[];
  excludedUserIds: string[];
  buyXQuantity?: number;
  getYQuantity?: number;
  getYProductId?: string;
  totalRedemptions: number;
  totalDiscountGiven: number;
  totalRevenue: number;
  deletedAt?: Date;
  deletedBy?: string;
  createdBy?: string;
  lastModifiedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCouponDto {
  code: string;
  name: string;
  description?: string;
  type?: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';
  status?: 'active' | 'inactive' | 'expired' | 'exhausted';
  visibility?: 'public' | 'private' | 'hidden';
  discountValue?: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  validFrom: string;
  validUntil: string;
  appliesTo?: 'all_products' | 'specific_products' | 'specific_categories' | 'specific_brands' | 'minimum_order_amount';
  applicableProductIds?: string[];
  applicableCategoryIds?: string[];
  applicableBrandIds?: string[];
  applicableUserIds?: string[];
  excludedUserIds?: string[];
  buyXQuantity?: number;
  getYQuantity?: number;
  getYProductId?: string;
}

export interface UpdateCouponDto {
  name?: string;
  description?: string;
  type?: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';
  status?: 'active' | 'inactive' | 'expired' | 'exhausted';
  visibility?: 'public' | 'private' | 'hidden';
  discountValue?: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  validFrom?: string;
  validUntil?: string;
  appliesTo?: 'all_products' | 'specific_products' | 'specific_categories' | 'specific_brands' | 'minimum_order_amount';
  applicableProductIds?: string[];
  applicableCategoryIds?: string[];
  applicableBrandIds?: string[];
  applicableUserIds?: string[];
  excludedUserIds?: string[];
  buyXQuantity?: number;
  getYQuantity?: number;
  getYProductId?: string;
}

export interface ListCouponsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  visibility?: string;
}

export interface ValidateCouponDto {
  code: string;
  userId?: string;
  orderAmount?: number;
  productIds?: string[];
}

export interface CouponAnalytics {
  totalRedemptions: number;
  totalDiscountGiven: number;
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    redemptions: number;
  }>;
  dailyRedemptions: Array<{
    date: string;
    redemptions: number;
    discountGiven: number;
  }>;
}

export interface Banner {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  altText?: string;
  location: 'home_top' | 'home_middle' | 'home_bottom' | 'category_top' | 'product_page' | 'cart_page' | 'checkout_page' | 'sidebar' | 'footer';
  promotionType?: 'discount' | 'free_shipping' | 'new_arrival' | 'sale' | 'seasonal' | 'brand_promotion';
  isActive: boolean;
  sortOrder: number;
  startDate?: Date;
  endDate?: Date;
  displayDuration?: number;
  targetAudiences: string[];
  targetCategories: string[];
  targetProducts: string[];
  viewCount: number;
  clickCount: number;
  conversionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBannerDto {
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  altText?: string;
  location: 'home_top' | 'home_middle' | 'home_bottom' | 'category_top' | 'product_page' | 'cart_page' | 'checkout_page' | 'sidebar' | 'footer';
  promotionType?: 'discount' | 'free_shipping' | 'new_arrival' | 'sale' | 'seasonal' | 'brand_promotion';
  isActive?: boolean;
  sortOrder?: number;
  startDate?: string;
  endDate?: string;
  displayDuration?: number;
  targetAudiences?: string[];
  targetCategories?: string[];
  targetProducts?: string[];
}

export interface UpdateBannerDto {
  title?: string;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  altText?: string;
  location?: 'home_top' | 'home_middle' | 'home_bottom' | 'category_top' | 'product_page' | 'cart_page' | 'checkout_page' | 'sidebar' | 'footer';
  promotionType?: 'discount' | 'free_shipping' | 'new_arrival' | 'sale' | 'seasonal' | 'brand_promotion';
  isActive?: boolean;
  sortOrder?: number;
  startDate?: string;
  endDate?: string;
  displayDuration?: number;
  targetAudiences?: string[];
  targetCategories?: string[];
  targetProducts?: string[];
}

export interface ListBannersParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  location?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface EffectivePriceResult {
  originalPrice: number;
  effectivePrice: number;
  appliedRule?: PriceRule;
  savings?: number;
  badge?: string;
  giftSku?: string;
}

export interface PreviewPriceRuleDto {
  ruleId: string;
  variantId: string;
  currency?: string;
  qty?: number;
  accountType?: string;
}

export interface PricingQueryDto {
  variantId: string;
  currency?: string;
  qty?: number;
  accountType?: string;
}

export interface EffectivePriceResult {
  originalPrice: number;
  effectivePrice: number;
  appliedRule?: PriceRule;
  savings?: number;
  badge?: string;
  giftSku?: string;
}

// API Functions
export const marketingApi = {
  // ==================== PRICE RULES ====================
  
  createPriceRule: async (data: CreatePriceRuleDto): Promise<PriceRule> => {
    const response = await apiClient.post<ApiResponse<PriceRule>>(
      '/admin/marketing/price-rules',
      data
    );
    return response.data.data;
  },

  listPriceRules: async (params?: ListPriceRulesParams): Promise<PriceRule[]> => {
    const response = await apiClient.get<ApiResponse<PriceRule[]>>(
      '/admin/marketing/price-rules',
      { params }
    );
    return response.data.data;
  },

  getPriceRule: async (id: string): Promise<PriceRule> => {
    const response = await apiClient.get<ApiResponse<PriceRule>>(
      `/admin/marketing/price-rules/${id}`
    );
    return response.data.data;
  },

  updatePriceRule: async (id: string, data: UpdatePriceRuleDto): Promise<PriceRule> => {
    const response = await apiClient.patch<ApiResponse<PriceRule>>(
      `/admin/marketing/price-rules/${id}`,
      data
    );
    return response.data.data;
  },

  deletePriceRule: async (id: string): Promise<boolean> => {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean; deletedAt: Date }>>(
      `/admin/marketing/price-rules/${id}`
    );
    return response.data.data.deleted;
  },

  togglePriceRule: async (id: string): Promise<PriceRule> => {
    const response = await apiClient.post<ApiResponse<PriceRule>>(
      `/admin/marketing/price-rules/${id}/toggle`
    );
    return response.data.data;
  },

  previewPriceRule: async (data: PreviewPriceRuleDto): Promise<EffectivePriceResult | null> => {
    const response = await apiClient.post<ApiResponse<EffectivePriceResult | null>>(
      '/admin/marketing/price-rules/preview',
      data
    );
    return response.data.data;
  },

  // ==================== COUPONS ====================

  createCoupon: async (data: CreateCouponDto): Promise<Coupon> => {
    const response = await apiClient.post<ApiResponse<Coupon>>(
      '/admin/marketing/coupons',
      data
    );
    return response.data.data;
  },

  listCoupons: async (params?: ListCouponsParams): Promise<PaginatedResponse<Coupon>> => {
    const response = await apiClient.get<ApiResponse<{ data: Coupon[]; meta: any }>>(
      '/admin/marketing/coupons',
      { params }
    );
    return {
      data: response.data.data.data,
      meta: response.data.data.meta,
    };
  },

  getCoupon: async (id: string): Promise<Coupon> => {
    const response = await apiClient.get<ApiResponse<Coupon>>(
      `/admin/marketing/coupons/${id}`
    );
    return response.data.data;
  },

  updateCoupon: async (id: string, data: UpdateCouponDto): Promise<Coupon> => {
    const response = await apiClient.patch<ApiResponse<Coupon>>(
      `/admin/marketing/coupons/${id}`,
      data
    );
    return response.data.data;
  },

  deleteCoupon: async (id: string): Promise<boolean> => {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean; deletedAt: Date }>>(
      `/admin/marketing/coupons/${id}`
    );
    return response.data.data.deleted;
  },

  toggleCouponStatus: async (id: string): Promise<Coupon> => {
    const response = await apiClient.patch<ApiResponse<Coupon>>(
      `/admin/marketing/coupons/${id}`,
      { status: 'toggle' }
    );
    return response.data.data;
  },

  getCouponAnalytics: async (id: string): Promise<CouponAnalytics> => {
    const response = await apiClient.get<ApiResponse<CouponAnalytics>>(
      `/admin/marketing/coupons/${id}/analytics`
    );
    return response.data.data;
  },

  getCouponUsageHistory: async (id: string) => {
    const response = await apiClient.get<ApiResponse<any>>(`/admin/marketing/coupons/${id}/usage-history`);
    return response.data.data;
  },

  getCouponsAnalytics: async (period: number = 30) => {
    const response = await apiClient.get<ApiResponse<any>>(`/admin/marketing/coupons/analytics?period=${period}`);
    return response.data.data;
  },

  getCouponsStatistics: async (period: number = 30) => {
    const response = await apiClient.get<ApiResponse<any>>(`/admin/marketing/coupons/statistics?period=${period}`);
    return response.data.data;
  },

  validateCoupon: async (data: ValidateCouponDto): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(
      '/admin/marketing/coupons/validate',
      data
    );
    return response.data.data;
  },

  getPublicCoupons: async (page: number = 1, limit: number = 20) => {
    const response = await apiClient.get<ApiResponse<any[]>>(
      `/marketing/coupons/public?page=${page}&limit=${limit}`
    );
    return response.data.data;
  },

  getAutoApplyCoupons: async (userId?: string, accountType?: string) => {
    const response = await apiClient.get<ApiResponse<any[]>>(
      '/marketing/coupons/auto-apply',
      { params: { userId, accountType } }
    );
    return response.data.data;
  },

  getCouponByCode: async (code: string) => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/marketing/coupons/code/${code}`
    );
    return response.data.data;
  },

  bulkGenerateCoupons: async (data: {
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
  }) => {
    const response = await apiClient.post<ApiResponse<{ success: boolean; generated: number; coupons: Coupon[] }>>(
      '/admin/marketing/coupons/bulk-generate',
      data
    );
    return response.data.data;
  },


  validateCouponCode: async (code: string, userId?: string, orderAmount?: number, productIds?: string[]) => {
    const response = await apiClient.get<ApiResponse<any>>(
      '/marketing/coupons/validate',
      {
        params: { code, userId, orderAmount, productIds }
      }
    );
    return response.data.data;
  },

 

  // ==================== BANNERS ====================

  createBanner: async (data: CreateBannerDto): Promise<Banner> => {
    const response = await apiClient.post<ApiResponse<Banner>>(
      '/admin/marketing/banners',
      data
    );
    return response.data.data;
  },

  listBanners: async (params?: ListBannersParams): Promise<PaginatedResponse<Banner>> => {
    const response = await apiClient.get<ApiResponse<{ data: Banner[]; meta: any }>>(
      '/admin/marketing/banners',
      { params }
    );
    return {
      data: response.data.data.data,
      meta: response.data.data.meta,
    };
  },

  getBanner: async (id: string): Promise<Banner> => {
    const response = await apiClient.get<ApiResponse<Banner>>(
      `/admin/marketing/banners/${id}`
    );
    return response.data.data;
  },

  updateBanner: async (id: string, data: UpdateBannerDto): Promise<Banner> => {
    const response = await apiClient.patch<ApiResponse<Banner>>(
      `/admin/marketing/banners/${id}`,
      data
    );
    return response.data.data;
  },

  deleteBanner: async (id: string): Promise<boolean> => {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean; deletedAt: Date }>>(
      `/admin/marketing/banners/${id}`
    );
    return response.data.data.deleted;
  },

  toggleBannerStatus: async (id: string): Promise<Banner> => {
    const response = await apiClient.patch<ApiResponse<Banner>>(
      `/admin/marketing/banners/${id}/toggle-status`
    );
    return response.data.data;
  },

  // ==================== PUBLIC ENDPOINTS ====================

  getEffectivePrice: async (params: PricingQueryDto): Promise<EffectivePriceResult> => {
    const response = await apiClient.get<ApiResponse<EffectivePriceResult>>(
      '/marketing/pricing/variant',
      { params }
    );
    return response.data.data;
  },

  getActiveBanners: async (location?: string): Promise<Banner[]> => {
    const response = await apiClient.get<ApiResponse<Banner[]>>(
      '/marketing/banners',
      { params: location ? { location } : {} }
    );
    return response.data.data;
  },

  trackBannerView: async (id: string): Promise<void> => {
    await apiClient.get(`/marketing/banners/${id}/view`);
  },

  trackBannerClick: async (id: string): Promise<void> => {
    await apiClient.get(`/marketing/banners/${id}/click`);
  },
};
