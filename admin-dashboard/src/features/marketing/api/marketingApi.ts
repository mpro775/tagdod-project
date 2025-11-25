import { apiClient } from '@/core/api/client';
import type { ApiResponse, PaginatedResponse, PaginationMeta } from '@/shared/types/common.types';

function extractResponseData<T>(response: { data?: any }): T {
  const outer = response?.data;

  if (outer === undefined || outer === null) {
    return outer as T;
  }

  if (Array.isArray(outer)) {
    return outer as T;
  }

  if (typeof outer === 'object') {
    const keys = Object.keys(outer);

    const isApiEnvelope =
      'success' in outer &&
      'data' in outer &&
      keys.every((key) => ['success', 'data', 'requestId'].includes(key));

    const isDataOnlyWrapper = keys.length === 1 && 'data' in outer;

    if (isApiEnvelope || isDataOnlyWrapper) {
      // Recursively extract nested data
      const innerData = (outer as { data?: unknown }).data;
      return extractResponseData<T>({ data: innerData });
    }

    // Check if the object itself has nested data structure (double nesting)
    if ('data' in outer && typeof outer.data === 'object' && !Array.isArray(outer.data)) {
      const innerData = outer.data;
      // Check if inner data is also an envelope
      if (innerData && typeof innerData === 'object' && !Array.isArray(innerData)) {
        const innerKeys = Object.keys(innerData);
        const isInnerEnvelope =
          'success' in innerData &&
          'data' in innerData &&
          innerKeys.every((key) => ['success', 'data', 'requestId'].includes(key));
        if (isInnerEnvelope) {
          return extractResponseData<T>({ data: (innerData as { data?: unknown }).data });
        }
      }
    }
  }

  return outer as T;
}

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
  appliesTo:
    | 'all_products'
    | 'specific_products'
    | 'specific_categories'
    | 'specific_brands'
    | 'minimum_order_amount';
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
  // Engineer Coupon Fields
  engineerId?: string;
  commissionRate?: number;
  usageHistory?: Array<{
    orderId: string;
    userId: string;
    discountAmount: number;
    commissionAmount: number;
    usedAt: Date;
  }>;
  totalCommissionEarned?: number;
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
  appliesTo?:
    | 'all_products'
    | 'specific_products'
    | 'specific_categories'
    | 'specific_brands'
    | 'minimum_order_amount';
  applicableProductIds?: string[];
  applicableCategoryIds?: string[];
  applicableBrandIds?: string[];
  applicableUserIds?: string[];
  excludedUserIds?: string[];
  buyXQuantity?: number;
  getYQuantity?: number;
  getYProductId?: string;
  // Engineer Coupon Fields
  engineerId?: string;
  commissionRate?: number;
}

export interface CreateEngineerCouponDto {
  engineerId: string;
  code: string;
  name: string;
  description?: string;
  commissionRate: number;
  type?: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';
  discountValue?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  validFrom: string;
  validUntil?: string; // Optional for unlimited engineer coupons
  minimumOrderAmount?: number;
}

export interface EngineerCouponStats {
  totalCoupons: number;
  activeCoupons: number;
  totalUses: number;
  totalCommissionEarned: number;
  totalDiscountGiven: number;
  coupons: Array<{
    code: string;
    name: string;
    usedCount: number;
    commissionEarned: number;
    discountGiven: number;
  }>;
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
  appliesTo?:
    | 'all_products'
    | 'specific_products'
    | 'specific_categories'
    | 'specific_brands'
    | 'minimum_order_amount';
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
  location:
    | 'home_top'
    | 'home_middle'
    | 'home_bottom'
    | 'category_top'
    | 'product_page'
    | 'cart_page'
    | 'checkout_page'
    | 'sidebar'
    | 'footer';
  promotionType?:
    | 'discount'
    | 'free_shipping'
    | 'new_arrival'
    | 'sale'
    | 'seasonal'
    | 'brand_promotion';
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
  location:
    | 'home_top'
    | 'home_middle'
    | 'home_bottom'
    | 'category_top'
    | 'product_page'
    | 'cart_page'
    | 'checkout_page'
    | 'sidebar'
    | 'footer';
  promotionType?:
    | 'discount'
    | 'free_shipping'
    | 'new_arrival'
    | 'sale'
    | 'seasonal'
    | 'brand_promotion';
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
  location?:
    | 'home_top'
    | 'home_middle'
    | 'home_bottom'
    | 'category_top'
    | 'product_page'
    | 'cart_page'
    | 'checkout_page'
    | 'sidebar'
    | 'footer';
  promotionType?:
    | 'discount'
    | 'free_shipping'
    | 'new_arrival'
    | 'sale'
    | 'seasonal'
    | 'brand_promotion';
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
    return extractResponseData<PriceRule>(response);
  },

  listPriceRules: async (params?: ListPriceRulesParams): Promise<PriceRule[]> => {
    const response = await apiClient.get<ApiResponse<PriceRule[]>>('/admin/marketing/price-rules', {
      params,
    });
    return extractResponseData<PriceRule[]>(response);
  },

  getPriceRule: async (id: string): Promise<PriceRule> => {
    const response = await apiClient.get<ApiResponse<PriceRule>>(
      `/admin/marketing/price-rules/${id}`
    );
    return extractResponseData<PriceRule>(response);
  },

  updatePriceRule: async (id: string, data: UpdatePriceRuleDto): Promise<PriceRule> => {
    const response = await apiClient.patch<ApiResponse<PriceRule>>(
      `/admin/marketing/price-rules/${id}`,
      data
    );
    return extractResponseData<PriceRule>(response);
  },

  deletePriceRule: async (id: string): Promise<boolean> => {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean; deletedAt: Date }>>(
      `/admin/marketing/price-rules/${id}`
    );
    const result = extractResponseData<{ deleted: boolean; deletedAt: Date }>(response);
    return result.deleted;
  },

  togglePriceRule: async (id: string): Promise<PriceRule> => {
    const response = await apiClient.post<ApiResponse<PriceRule>>(
      `/admin/marketing/price-rules/${id}/toggle`
    );
    return extractResponseData<PriceRule>(response);
  },

  previewPriceRule: async (data: PreviewPriceRuleDto): Promise<EffectivePriceResult | null> => {
    const response = await apiClient.post<ApiResponse<EffectivePriceResult | null>>(
      '/admin/marketing/price-rules/preview',
      data
    );
    return extractResponseData<EffectivePriceResult | null>(response);
  },

  // ==================== COUPONS ====================

  createCoupon: async (data: CreateCouponDto): Promise<Coupon> => {
    const response = await apiClient.post<ApiResponse<Coupon>>('/admin/marketing/coupons', data);
    return extractResponseData<Coupon>(response);
  },

  listCoupons: async (params?: ListCouponsParams): Promise<PaginatedResponse<Coupon>> => {
    const response = await apiClient.get<
      ApiResponse<{ data: Coupon[]; meta?: PaginationMeta; pagination?: any }>
    >('/admin/marketing/coupons', { params });
    const result = extractResponseData<{
      data?: Coupon[];
      meta?: PaginationMeta;
      pagination?: any;
    }>(response);

    const pagination = result.meta ?? result.pagination;

    const meta: PaginationMeta = {
      page: pagination?.page ?? pagination?.currentPage ?? params?.page ?? 1,
      limit:
        pagination?.limit ??
        pagination?.pageSize ??
        params?.limit ??
        (Array.isArray(result.data) ? result.data.length : 0),
      total:
        pagination?.total ??
        pagination?.totalItems ??
        (Array.isArray(result.data) ? result.data.length : 0),
      totalPages:
        pagination?.totalPages ??
        pagination?.pages ??
        Math.max(
          1,
          Math.ceil(
            (pagination?.total ??
              pagination?.totalItems ??
              (Array.isArray(result.data) ? result.data.length : 0)) /
              (pagination?.limit ??
                pagination?.pageSize ??
                params?.limit ??
                (Array.isArray(result.data) && result.data.length > 0 ? result.data.length : 1))
          )
        ),
    };

    return {
      data: Array.isArray(result.data) ? result.data : [],
      meta,
    };
  },

  getCoupon: async (id: string): Promise<Coupon> => {
    const response = await apiClient.get<ApiResponse<Coupon>>(`/admin/marketing/coupons/${id}`);
    return extractResponseData<Coupon>(response);
  },

  updateCoupon: async (id: string, data: UpdateCouponDto): Promise<Coupon> => {
    const response = await apiClient.patch<ApiResponse<Coupon>>(
      `/admin/marketing/coupons/${id}`,
      data
    );
    return extractResponseData<Coupon>(response);
  },

  deleteCoupon: async (id: string): Promise<boolean> => {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean; deletedAt: Date }>>(
      `/admin/marketing/coupons/${id}`
    );
    const result = extractResponseData<{ deleted: boolean; deletedAt: Date }>(response);
    return result.deleted;
  },

  toggleCouponStatus: async (id: string): Promise<Coupon> => {
    const response = await apiClient.patch<ApiResponse<Coupon>>(`/admin/marketing/coupons/${id}`, {
      status: 'toggle',
    });
    return extractResponseData<Coupon>(response);
  },

  getCouponAnalytics: async (id: string): Promise<CouponAnalytics> => {
    const response = await apiClient.get<ApiResponse<CouponAnalytics>>(
      `/admin/marketing/coupons/${id}/analytics`
    );
    return extractResponseData<CouponAnalytics>(response);
  },

  getCouponUsageHistory: async (id: string) => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/admin/marketing/coupons/${id}/usage-history`
    );
    return extractResponseData<any>(response);
  },

  getCouponsAnalytics: async (period: number = 30) => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/admin/marketing/coupons/analytics?period=${period}`
    );
    return extractResponseData<any>(response);
  },

  getCouponsStatistics: async (period: number = 30) => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/admin/marketing/coupons/statistics?period=${period}`
    );
    return extractResponseData<any>(response);
  },

  exportCouponsData: async (format: string = 'csv', period: number = 30) => {
    const response = await apiClient.post<ApiResponse<any>>(
      `/admin/marketing/coupons/export?format=${format}&period=${period}`
    );
    return extractResponseData<any>(response);
  },

  validateCoupon: async (data: ValidateCouponDto): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(
      '/admin/marketing/coupons/validate',
      data
    );
    return extractResponseData<any>(response);
  },

  getPublicCoupons: async (page: number = 1, limit: number = 20) => {
    const response = await apiClient.get<ApiResponse<any[]>>(
      `/marketing/coupons/public?page=${page}&limit=${limit}`
    );
    return extractResponseData<any[]>(response);
  },

  getAutoApplyCoupons: async (userId?: string, accountType?: string) => {
    const response = await apiClient.get<ApiResponse<any[]>>('/marketing/coupons/auto-apply', {
      params: { userId, accountType },
    });
    return extractResponseData<any[]>(response);
  },

  getCouponByCode: async (code: string) => {
    const response = await apiClient.get<ApiResponse<any>>(`/marketing/coupons/code/${code}`);
    return extractResponseData<any>(response);
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
    const response = await apiClient.post<
      ApiResponse<{ success: boolean; generated: number; coupons: Coupon[] }>
    >('/admin/marketing/coupons/bulk-generate', data);
    return extractResponseData<{ success: boolean; generated: number; coupons: Coupon[] }>(
      response
    );
  },

  validateCouponCode: async (
    code: string,
    userId?: string,
    orderAmount?: number,
    productIds?: string[]
  ) => {
    const response = await apiClient.get<ApiResponse<any>>('/marketing/coupons/validate', {
      params: { code, userId, orderAmount, productIds },
    });
    return extractResponseData<any>(response);
  },

  // ==================== ENGINEER COUPONS ====================

  createEngineerCoupon: async (data: CreateEngineerCouponDto): Promise<Coupon> => {
    const response = await apiClient.post<ApiResponse<Coupon>>(
      '/admin/marketing/coupons/engineer',
      data
    );
    return extractResponseData<Coupon>(response);
  },

  getEngineerCoupons: async (engineerId: string): Promise<Coupon[]> => {
    const response = await apiClient.get<ApiResponse<Coupon[]>>(
      `/admin/marketing/engineers/${engineerId}/coupons`
    );
    return extractResponseData<Coupon[]>(response);
  },

  getEngineerCouponStats: async (engineerId: string): Promise<EngineerCouponStats> => {
    const response = await apiClient.get<ApiResponse<EngineerCouponStats>>(
      `/admin/marketing/engineers/${engineerId}/coupons/stats`
    );
    return extractResponseData<EngineerCouponStats>(response);
  },

  // ==================== BANNERS ====================

  createBanner: async (data: CreateBannerDto): Promise<Banner> => {
    const response = await apiClient.post<ApiResponse<Banner>>('/admin/marketing/banners', data);
    return extractResponseData<Banner>(response);
  },

  listBanners: async (params?: ListBannersParams): Promise<PaginatedResponse<Banner>> => {
    const response = await apiClient.get<ApiResponse<{ data: Banner[]; meta: any }>>(
      '/admin/marketing/banners',
      { params }
    );
    const result = extractResponseData<{ data: Banner[]; meta: any }>(response);
    return {
      data: result.data,
      meta: result.meta,
    };
  },

  getBanner: async (id: string): Promise<Banner> => {
    const response = await apiClient.get<ApiResponse<Banner>>(`/admin/marketing/banners/${id}`);
    return extractResponseData<Banner>(response);
  },

  updateBanner: async (id: string, data: UpdateBannerDto): Promise<Banner> => {
    const response = await apiClient.patch<ApiResponse<Banner>>(
      `/admin/marketing/banners/${id}`,
      data
    );
    return extractResponseData<Banner>(response);
  },

  deleteBanner: async (id: string): Promise<boolean> => {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean; deletedAt: Date }>>(
      `/admin/marketing/banners/${id}`
    );
    const result = extractResponseData<{ deleted: boolean; deletedAt: Date }>(response);
    return result.deleted;
  },

  toggleBannerStatus: async (id: string): Promise<Banner> => {
    const response = await apiClient.patch<ApiResponse<Banner>>(
      `/admin/marketing/banners/${id}/toggle-status`
    );
    return extractResponseData<Banner>(response);
  },

  // ==================== PUBLIC ENDPOINTS ====================

  getEffectivePrice: async (params: PricingQueryDto): Promise<EffectivePriceResult> => {
    const response = await apiClient.get<ApiResponse<EffectivePriceResult>>(
      '/marketing/pricing/variant',
      { params }
    );
    return extractResponseData<EffectivePriceResult>(response);
  },

  getActiveBanners: async (location?: string): Promise<Banner[]> => {
    const response = await apiClient.get<ApiResponse<Banner[]>>('/marketing/banners', {
      params: location ? { location } : {},
    });
    return extractResponseData<Banner[]>(response);
  },

  trackBannerView: async (id: string): Promise<void> => {
    await apiClient.get(`/marketing/banners/${id}/view`);
  },

  trackBannerClick: async (id: string): Promise<void> => {
    await apiClient.get(`/marketing/banners/${id}/click`);
  },
};
