import type { Media } from '@/features/media/types/media.types';

// Enum values are used in BANNER_LOCATION_OPTIONS below
export enum BannerLocation {
  HOME_TOP = 'home_top',
  HOME_MIDDLE = 'home_middle',
  HOME_BOTTOM = 'home_bottom',
  CATEGORY_TOP = 'category_top',
  PRODUCT_PAGE = 'product_page',
  CART_PAGE = 'cart_page',
  CHECKOUT_PAGE = 'checkout_page',
  SIDEBAR = 'sidebar',
  FOOTER = 'footer',
}

// Enum values are used in BANNER_PROMOTION_TYPE_OPTIONS below
export enum BannerPromotionType {
  DISCOUNT = 'discount',
  FREE_SHIPPING = 'free_shipping',
  NEW_ARRIVAL = 'new_arrival',
  SALE = 'sale',
  SEASONAL = 'seasonal',
  BRAND_PROMOTION = 'brand_promotion',
}

export interface Banner {
  _id: string;
  title: string;
  description?: string;
  imageId?: string | Media; // Reference to Media collection (populated)
  imageUrl?: string; // Deprecated: kept for backward compatibility, use imageId instead
  linkUrl?: string;
  altText?: string;
  location: BannerLocation;
  promotionType?: BannerPromotionType;
  isActive: boolean;
  sortOrder: number;
  startDate?: string;
  endDate?: string;
  displayDuration?: number;
  targetAudiences: string[];
  targetCategories: string[];
  targetProducts: string[];
  viewCount: number;
  clickCount: number;
  conversionCount: number;
  createdBy?: string;
  lastModifiedBy?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  deletedBy?: string;
}

export interface CreateBannerDto {
  title: string;
  description?: string;
  imageId: string; // Media ID
  linkUrl?: string;
  altText?: string;
  location: BannerLocation;
  promotionType?: BannerPromotionType;
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
  imageId?: string; // Media ID
  linkUrl?: string;
  altText?: string;
  location?: BannerLocation;
  promotionType?: BannerPromotionType;
  isActive?: boolean;
  sortOrder?: number;
  startDate?: string;
  endDate?: string;
  displayDuration?: number;
  targetAudiences?: string[];
  targetCategories?: string[];
  targetProducts?: string[];
}

export interface ListBannersDto {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  location?: BannerLocation;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BannerListResponse {
  data: Banner[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface BannerResponse {
  success: boolean;
  data: Banner;
}

export interface BannerListApiResponse {
  success: boolean;
  data: {
    data: Banner[];
    meta: {
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    };
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
}

// Banner location options for forms
export const BANNER_LOCATION_OPTIONS = [
  { value: BannerLocation.HOME_TOP, label: 'أعلى الصفحة الرئيسية' },
  { value: BannerLocation.HOME_MIDDLE, label: 'وسط الصفحة الرئيسية' },
  { value: BannerLocation.HOME_BOTTOM, label: 'أسفل الصفحة الرئيسية' },
  { value: BannerLocation.CATEGORY_TOP, label: 'أعلى صفحة الفئة' },
  { value: BannerLocation.PRODUCT_PAGE, label: 'صفحة المنتج' },
  { value: BannerLocation.CART_PAGE, label: 'صفحة سلة المشتريات' },
  { value: BannerLocation.CHECKOUT_PAGE, label: 'صفحة الدفع' },
  { value: BannerLocation.SIDEBAR, label: 'الشريط الجانبي' },
  { value: BannerLocation.FOOTER, label: 'أسفل الصفحة' },
];

// Banner promotion type options for forms
export const BANNER_PROMOTION_TYPE_OPTIONS = [
  { value: BannerPromotionType.DISCOUNT, label: 'خصم' },
  { value: BannerPromotionType.FREE_SHIPPING, label: 'شحن مجاني' },
  { value: BannerPromotionType.NEW_ARRIVAL, label: 'منتج جديد' },
  { value: BannerPromotionType.SALE, label: 'تخفيض' },
  { value: BannerPromotionType.SEASONAL, label: 'موسمي' },
  { value: BannerPromotionType.BRAND_PROMOTION, label: 'ترويج العلامة التجارية' },
];
