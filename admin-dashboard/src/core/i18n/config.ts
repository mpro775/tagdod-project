import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { DEFAULT_LANGUAGE } from '@/config/constants';

// استيراد الترجمات المحلية
import arCommon from './locales/ar/common.json';
import enCommon from './locales/en/common.json';
import arDashboard from './locales/ar/dashboard.json';
import enDashboard from './locales/en/dashboard.json';
import arUsers from './locales/ar/users.json';
import enUsers from './locales/en/users.json';
import arAttributes from './locales/ar/attributes.json';
import enAttributes from './locales/en/attributes.json';
import arCategories from './locales/ar/categories.json';
import enCategories from './locales/en/categories.json';
import arBanners from './locales/ar/banners.json';
import enBanners from './locales/en/banners.json';
import arBrands from './locales/ar/brands.json';
import enBrands from './locales/en/brands.json';
import arMedia from './locales/ar/media.json';
import enMedia from './locales/en/media.json';
import arErrorLogs from './locales/ar/errorLogs.json';
import enErrorLogs from './locales/en/errorLogs.json';
import arAddresses from './locales/ar/addresses.json';
import enAddresses from './locales/en/addresses.json';
import arAudit from './locales/ar/audit.json';
import enAudit from './locales/en/audit.json';
import arAuth from './locales/ar/auth.json';
import enAuth from './locales/en/auth.json';
import arOrders from './locales/ar/orders.json';
import enOrders from './locales/en/orders.json';
import arServices from './locales/ar/services.json';
import enServices from './locales/en/services.json';
import arCart from './locales/ar/cart.json';
import enCart from './locales/en/cart.json';
import arCoupons from './locales/ar/coupons.json';
import enCoupons from './locales/en/coupons.json';
import arExchangeRates from './locales/ar/exchangeRates.json';
import enExchangeRates from './locales/en/exchangeRates.json';
import arMarketing from './locales/ar/marketing.json';
import enMarketing from './locales/en/marketing.json';
import arAnalytics from './locales/ar/analytics.json';
import enAnalytics from './locales/en/analytics.json';
import arNotifications from './locales/ar/notifications.json';
import enNotifications from './locales/en/notifications.json';
import arSystemSettings from './locales/ar/systemSettings.json';
import enSystemSettings from './locales/en/systemSettings.json';
import arSearch from './locales/ar/search.json';
import enSearch from './locales/en/search.json';
import arSystemMonitoring from './locales/ar/system-monitoring.json';
import enSystemMonitoring from './locales/en/system-monitoring.json';
import arProducts from './locales/ar/products.json';
import enProducts from './locales/en/products.json';
import arSupport from './locales/ar/support.json';
import enSupport from './locales/en/support.json';

// الترجمات المحلية
const resources = {
  ar: {
    common: arCommon,
    dashboard: arDashboard,
    users: arUsers,
    attributes: arAttributes,
    categories: arCategories,
    banners: arBanners,
    brands: arBrands,
    media: arMedia,
    errorLogs: arErrorLogs,
    addresses: arAddresses,
    audit: arAudit,
    auth: arAuth,
    orders: arOrders,
    services: arServices,
    cart: arCart,
    coupons: arCoupons,
    exchangeRates: arExchangeRates,
    marketing: arMarketing,
    analytics: arAnalytics,
    notifications: arNotifications,
    systemSettings: arSystemSettings,
    search: arSearch,
    'system-monitoring': arSystemMonitoring,
    products: arProducts,
    support: arSupport,
  },
  en: {
    common: enCommon,
    dashboard: enDashboard,
    users: enUsers,
    attributes: enAttributes,
    categories: enCategories,
    banners: enBanners,
    brands: enBrands,
    media: enMedia,
    errorLogs: enErrorLogs,
    addresses: enAddresses,
    audit: enAudit,
    auth: enAuth,
    orders: enOrders,
    services: enServices,
    cart: enCart,
    coupons: enCoupons,
    exchangeRates: enExchangeRates,
    marketing: enMarketing,
    analytics: enAnalytics,
    notifications: enNotifications,
    systemSettings: enSystemSettings,
    search: enSearch,
    'system-monitoring': enSystemMonitoring,
    products: enProducts,
    support: enSupport,
  },
};

// تهيئة i18next فقط إذا لم تكن مهيأة بالفعل
if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      // استخدام الترجمات المحلية
      resources,
      
      fallbackLng: DEFAULT_LANGUAGE,
      defaultNS: 'common',
      ns: ['common', 'auth', 'orders', 'services', 'users', 'dashboard', 'attributes', 'categories', 'banners', 'brands', 'media', 'errorLogs', 'addresses', 'audit', 'cart', 'coupons', 'exchangeRates', 'marketing', 'analytics', 'notifications', 'systemSettings', 'search', 'system-monitoring', 'products', 'support'],
      
      interpolation: {
        escapeValue: false, // React already escapes
      },

      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupLocalStorage: 'language',
      },

      // React-specific options
      react: {
        useSuspense: false, // تعطيل Suspense لأننا نستخدم ترجمات محلية
      },

      // Debug في بيئة التطوير فقط
      debug: import.meta.env.DEV,
    });
}

export default i18n;

