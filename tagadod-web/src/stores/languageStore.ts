import { create } from 'zustand'
import i18n from '../i18n'
import { getStoredLanguage, setStoredLanguage } from '../i18n'

export type LanguageCode = 'ar' | 'en'

interface LanguageStore {
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  language: (getStoredLanguage() as LanguageCode) || 'ar',
  setLanguage: (lang) => {
    setStoredLanguage(lang)
    i18n.changeLanguage(lang)
    set({ language: lang })
  },
}))
