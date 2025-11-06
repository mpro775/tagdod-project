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

// Navigation type enum
export enum BannerNavigationType {
  EXTERNAL_URL = 'external_url', // رابط خارجي
  CATEGORY = 'category', // فئة معينة
  PRODUCT = 'product', // منتج معين
  SECTION = 'section', // قسم/شاشة معينة في التطبيق
  NONE = 'none', // بدون تنقل
}

// User role enum (matching backend)
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  MERCHANT = 'merchant',
  ENGINEER = 'engineer',
}

export interface Banner {
  _id: string;
  title: string;
  description?: string;
  imageId?: string | Media; // Reference to Media collection (populated)
  imageUrl?: string; // Deprecated: kept for backward compatibility, use imageId instead
  linkUrl?: string; // Legacy field - kept for backward compatibility
  altText?: string;
  // Navigation settings
  navigationType?: BannerNavigationType;
  navigationTarget?: string; // Category ID, Product ID, Section name, or external URL
  navigationParams?: Record<string, unknown>; // Additional parameters for navigation
  location: BannerLocation;
  promotionType?: BannerPromotionType;
  isActive: boolean;
  sortOrder: number;
  startDate?: string;
  endDate?: string;
  displayDuration?: number;
  targetAudiences: string[];
  targetUserTypes: UserRole[]; // User roles that can see this banner
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
  linkUrl?: string; // Legacy field - kept for backward compatibility
  altText?: string;
  // Navigation settings
  navigationType?: BannerNavigationType;
  navigationTarget?: string; // Category ID, Product ID, Section name, or external URL
  navigationParams?: Record<string, unknown>; // Additional parameters for navigation
  location: BannerLocation;
  promotionType?: BannerPromotionType;
  isActive?: boolean;
  sortOrder?: number;
  startDate?: string;
  endDate?: string;
  displayDuration?: number;
  targetAudiences?: string[];
  targetUserTypes?: UserRole[]; // User roles that can see this banner (empty = all users)
  targetCategories?: string[];
  targetProducts?: string[];
}

export interface UpdateBannerDto {
  title?: string;
  description?: string;
  imageId?: string; // Media ID
  linkUrl?: string; // Legacy field - kept for backward compatibility
  altText?: string;
  // Navigation settings
  navigationType?: BannerNavigationType;
  navigationTarget?: string; // Category ID, Product ID, Section name, or external URL
  navigationParams?: Record<string, unknown>; // Additional parameters for navigation
  location?: BannerLocation;
  promotionType?: BannerPromotionType;
  isActive?: boolean;
  sortOrder?: number;
  startDate?: string;
  endDate?: string;
  displayDuration?: number;
  targetAudiences?: string[];
  targetUserTypes?: UserRole[]; // User roles that can see this banner (empty = all users)
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

// Banner navigation type options for forms
export const BANNER_NAVIGATION_TYPE_OPTIONS = [
  { value: BannerNavigationType.NONE, label: 'بدون تنقل' },
  { value: BannerNavigationType.EXTERNAL_URL, label: 'رابط خارجي' },
  { value: BannerNavigationType.CATEGORY, label: 'فئة' },
  { value: BannerNavigationType.PRODUCT, label: 'منتج' },
  { value: BannerNavigationType.SECTION, label: 'قسم في التطبيق' },
];

// User role options for targeting
export const USER_ROLE_OPTIONS = [
  { value: UserRole.USER, label: 'عميل' },
  { value: UserRole.ENGINEER, label: 'مهندس' },
  { value: UserRole.MERCHANT, label: 'تاجر' },
  { value: UserRole.ADMIN, label: 'مدير' },
  { value: UserRole.SUPER_ADMIN, label: 'مدير عام' },
];
