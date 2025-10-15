import { BaseEntity, ListParams } from '@/shared/types/common.types';

export enum BannerType {
  IMAGE = 'image',
  VIDEO = 'video',
  CAROUSEL = 'carousel',
}

export enum BannerLocation {
  HOME_TOP = 'home_top',
  HOME_MIDDLE = 'home_middle',
  HOME_BOTTOM = 'home_bottom',
  CATEGORY_TOP = 'category_top',
  PRODUCT_SIDEBAR = 'product_sidebar',
  CUSTOM = 'custom',
}

export enum BannerPromotionType {
  NONE = 'none',
  PRICE_RULE = 'price_rule',
  COUPON = 'coupon',
}

export interface Banner extends BaseEntity {
  title: string;
  description?: string;
  image: string;
  type: BannerType;
  location: BannerLocation;
  linkUrl?: string;
  linkText?: string;
  isActive: boolean;
  sortOrder: number;
  startDate?: Date;
  endDate?: Date;
  clickCount: number;
  viewCount: number;
  promotionType: BannerPromotionType;
  linkedPriceRuleId?: string;
  linkedCouponCode?: string;
  conversionCount: number;
  revenue: number;
  metadata?: Record<string, unknown>;
}

export interface CreateBannerDto {
  title: string;
  description?: string;
  image: string;
  type?: BannerType;
  location?: BannerLocation;
  linkUrl?: string;
  linkText?: string;
  isActive?: boolean;
  sortOrder?: number;
  startDate?: string;
  endDate?: string;
  promotionType?: BannerPromotionType;
  linkedCouponCode?: string;
}

export type UpdateBannerDto = Partial<CreateBannerDto>;

export interface ListBannersParams extends ListParams {
  location?: BannerLocation;
  isActive?: boolean;
  type?: BannerType;
}
