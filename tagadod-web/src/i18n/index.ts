import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ar from './locales/ar.json'
import en from './locales/en.json'

const STORAGE_KEY = 'tagadod-lang'

export const languages = [
  { code: 'ar', label: 'العربية', dir: 'rtl' as const },
  { code: 'en', label: 'English', dir: 'ltr' as const },
]

export const defaultLanguage = 'ar'

export function getStoredLanguage(): string {
  return localStorage.getItem(STORAGE_KEY) || defaultLanguage
}

export function setStoredLanguage(lang: string): void {
  localStorage.setItem(STORAGE_KEY, lang)
}

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: getStoredLanguage(),
  fallbackLng: 'ar',
  interpolation: {
    escapeValue: false,
  },
  debug: false,
  showSupportNotice: false,
})

i18n.on('languageChanged', (lng) => {
  const lang = languages.find((x) => x.code === lng)
  if (lang) {
    document.documentElement.dir = lang.dir
    document.documentElement.lang = lng
  }
})

// Initialize dir on load
const initialLang = languages.find((x) => x.code === i18n.language)
if (initialLang) {
  document.documentElement.dir = initialLang.dir
  document.documentElement.lang = i18n.language
}

export default i18n
