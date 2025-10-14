import { BaseEntity, ListParams } from '@/shared/types/common.types';

// Coupon Enums - متطابق 100% مع Backend
export enum CouponType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  FREE_SHIPPING = 'free_shipping',
  BUY_X_GET_Y = 'buy_x_get_y',
  FIRST_ORDER = 'first_order',
}

export enum CouponStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  EXHAUSTED = 'exhausted',
}

export enum CouponVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  AUTO_APPLY = 'auto_apply',
}

export enum DiscountAppliesTo {
  ENTIRE_ORDER = 'entire_order',
  SPECIFIC_PRODUCTS = 'specific_products',
  SPECIFIC_CATEGORIES = 'specific_categories',
  SPECIFIC_BRANDS = 'specific_brands',
  CHEAPEST_ITEM = 'cheapest_item',
  MOST_EXPENSIVE = 'most_expensive',
}

// Buy X Get Y Configuration
export interface BuyXGetY {
  buyQuantity: number;
  getQuantity: number;
  productId?: string;
  categoryId?: string;
}

// Coupon Stats
export interface CouponStats {
  views: number;
  applies: number;
  successfulOrders: number;
  failedAttempts: number;
  totalRevenue: number;
  totalDiscount: number;
}

// Usage History Item
export interface UsageHistoryItem {
  userId: string;
  usedAt: Date;
  orderId: string;
}

// Coupon Metadata
export interface CouponMetadata {
  campaign?: string;
  source?: string;
  notes?: string;
  tags?: string[];
}

// Coupon Interface - متطابق تماماً مع Backend
export interface Coupon extends BaseEntity {
  code: string;
  title: string;
  description?: string;
  type: CouponType;
  status: CouponStatus;
  visibility: CouponVisibility;

  // Discount Configuration
  discountPercentage?: number;
  discountAmount?: number;
  maxDiscountAmount?: number;
  appliesTo: DiscountAppliesTo;
  applicableProductIds?: string[];
  applicableCategoryIds?: string[];
  applicableBrandIds?: string[];

  // Conditions
  minOrderAmount?: number;
  minQuantity?: number;
  currency?: string;
  allowedAccountTypes?: string[];
  allowedUserIds?: string[];
  firstOrderOnly: boolean;
  newUsersOnly: boolean;

  // Usage Limits
  maxTotalUses?: number;
  currentUses: number;
  maxUsesPerUser: number;
  oneTimeUse: boolean;

  // Date Range
  startDate: Date;
  endDate: Date;

  // Buy X Get Y
  buyXGetY?: BuyXGetY;

  // Advanced Features
  stackable: boolean;
  excludeSaleItems: boolean;
  excludedProductIds?: string[];
  excludedCategoryIds?: string[];

  // Tracking & Analytics
  stats: CouponStats;
  usageHistory?: UsageHistoryItem[];

  // Metadata
  metadata?: CouponMetadata;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date;
  deletedBy?: string;
}

// DTOs - متطابقة مع Backend

export interface CreateCouponDto {
  code: string;
  title: string;
  description?: string;
  type: CouponType;
  visibility?: CouponVisibility;

  // Discount Configuration
  discountPercentage?: number;
  discountAmount?: number;
  maxDiscountAmount?: number;
  appliesTo?: DiscountAppliesTo;
  applicableProductIds?: string[];
  applicableCategoryIds?: string[];
  applicableBrandIds?: string[];

  // Conditions
  minOrderAmount?: number;
  minQuantity?: number;
  currency?: string;
  allowedAccountTypes?: string[];
  allowedUserIds?: string[];
  firstOrderOnly?: boolean;
  newUsersOnly?: boolean;

  // Usage Limits
  maxTotalUses?: number;
  maxUsesPerUser?: number;
  oneTimeUse?: boolean;

  // Date Range
  startDate: string;
  endDate: string;

  // Buy X Get Y
  buyXGetY?: BuyXGetY;

  // Advanced Features
  stackable?: boolean;
  excludeSaleItems?: boolean;
  excludedProductIds?: string[];
  excludedCategoryIds?: string[];

  // Metadata
  metadata?: CouponMetadata;
}

export interface UpdateCouponDto {
  title?: string;
  description?: string;
  status?: CouponStatus;
  visibility?: CouponVisibility;
  discountPercentage?: number;
  discountAmount?: number;
  maxDiscountAmount?: number;
  appliesTo?: DiscountAppliesTo;
  applicableProductIds?: string[];
  applicableCategoryIds?: string[];
  applicableBrandIds?: string[];
  minOrderAmount?: number;
  minQuantity?: number;
  currency?: string;
  allowedAccountTypes?: string[];
  allowedUserIds?: string[];
  firstOrderOnly?: boolean;
  newUsersOnly?: boolean;
  maxTotalUses?: number;
  maxUsesPerUser?: number;
  oneTimeUse?: boolean;
  startDate?: string;
  endDate?: string;
  buyXGetY?: BuyXGetY;
  stackable?: boolean;
  excludeSaleItems?: boolean;
  excludedProductIds?: string[];
  excludedCategoryIds?: string[];
  metadata?: CouponMetadata;
}

export interface ListCouponsParams extends ListParams {
  status?: CouponStatus;
  type?: CouponType;
  visibility?: CouponVisibility;
  includeDeleted?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ValidateCouponDto {
  code: string;
  orderAmount: number;
  currency: string;
  userId?: string;
  accountType?: string;
  productIds?: string[];
  categoryIds?: string[];
}

export interface BulkGenerateCouponsDto {
  prefix: string;
  count: number;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  maxUsesPerUser?: number;
}

// Coupon Analytics
export interface CouponAnalytics {
  code: string;
  title: string;
  stats: CouponStats;
  conversionRate: number;
  averageOrderValue: number;
  revenuePerUse: number;
  performance: 'excellent' | 'good' | 'average' | 'poor';
}

