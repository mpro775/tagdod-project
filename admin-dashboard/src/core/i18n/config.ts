import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { DEFAULT_LANGUAGE, API_BASE_URL } from '@/config/constants';

// استيراد الترجمات المحلية كاحتياطي
import arCommon from './locales/ar/common.json';
import enCommon from './locales/en/common.json';

// الترجمات المحلية
const resources = {
  ar: {
    common: arCommon,
  },
  en: {
    common: enCommon,
  },
};

i18n
  .use(Backend) // Load translations from API
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // تحميل الترجمات من Backend API
    backend: {
      loadPath: `${API_BASE_URL}/i18n/public/translations/{{lng}}?namespace={{ns}}`,
      crossDomain: false,
      // إعادة المحاولة في حالة الفشل
      requestOptions: {
        mode: 'cors',
        credentials: 'same-origin',
        cache: 'default',
      },
      // في حالة فشل التحميل من API، استخدم الترجمات المحلية
      parse: (data: string) => {
        try {
          return JSON.parse(data);
        } catch {
          // Failed to parse translations from API, using local fallback
          return {};
        }
      },
    },
    
    // الترجمات المحلية كاحتياطي
    resources,
    
    fallbackLng: DEFAULT_LANGUAGE,
    defaultNS: 'common',
    ns: ['common', 'auth', 'products', 'orders', 'services', 'users', 'settings', 'validation', 'notifications'],
    
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

    // إعدادات Cache
    cache: {
      enabled: true,
      expirationTime: 24 * 60 * 60 * 1000, // 24 ساعة
    },

    // استخدام الموارد المحلية كاحتياطي
    partialBundledLanguages: true,

    // Debug في بيئة التطوير فقط
    debug: import.meta.env.DEV,
  });

export default i18n;

