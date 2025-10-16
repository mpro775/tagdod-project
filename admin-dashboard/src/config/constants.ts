// Application Constants

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Tagadodo Admin';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

// API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
export const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 30000;

// Pagination
export const DEFAULT_PAGE_SIZE = Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 20;
export const MAX_PAGE_SIZE = Number(import.meta.env.VITE_MAX_PAGE_SIZE) || 100;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Upload
export const MAX_UPLOAD_SIZE = Number(import.meta.env.VITE_MAX_UPLOAD_SIZE) || 5 * 1024 * 1024; // 5MB
export const MAX_IMAGES_PER_PRODUCT = Number(import.meta.env.VITE_MAX_IMAGES_PER_PRODUCT) || 10;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Date Format
export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';
export const TIME_FORMAT = 'HH:mm';

// Languages
export const DEFAULT_LANGUAGE = (import.meta.env.VITE_DEFAULT_LANGUAGE as 'ar' | 'en') || 'ar';
export const SUPPORTED_LANGUAGES = ['ar', 'en'] as const;

// Theme
export const DEFAULT_THEME = (import.meta.env.VITE_DEFAULT_THEME as 'light' | 'dark') || 'light';

// Feature Flags
export const ENABLE_ANALYTICS = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
export const ENABLE_PWA = import.meta.env.VITE_ENABLE_PWA === 'true';

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  LANGUAGE: 'language',
  THEME: 'theme',
  SIDEBAR_STATE: 'sidebar_state',
} as const;

// Query Keys
export const QUERY_KEYS = {
  USERS: 'users',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  ATTRIBUTES: 'attributes',
  BRANDS: 'brands',
  BANNERS: 'banners',
  ORDERS: 'orders',
  COUPONS: 'coupons',
  MEDIA: 'media',
  ANALYTICS: 'analytics',
  DASHBOARD: 'dashboard',
} as const;

// Status Colors
export const STATUS_COLORS = {
  active: 'success',
  inactive: 'default',
  pending: 'warning',
  suspended: 'error',
  confirmed: 'info',
  processing: 'warning',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'error',
  refunded: 'warning',
} as const;

// Role Colors
export const ROLE_COLORS = {
  super_admin: 'error',
  admin: 'warning',
  moderator: 'info',
  user: 'default',
} as const;

