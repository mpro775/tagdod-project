import { create } from 'zustand';
import { STORAGE_KEYS, DEFAULT_THEME } from '@/config/constants';

interface ThemeState {
  mode: 'light' | 'dark';
  direction: 'ltr' | 'rtl';
  language: 'ar' | 'en';
  highContrast: boolean;
  reducedMotion: boolean;

  // Actions
  toggleMode: () => void;
  // eslint-disable-next-line no-unused-vars
  setMode: (mode: 'light' | 'dark') => void;
  // eslint-disable-next-line no-unused-vars
  setDirection: (direction: 'ltr' | 'rtl') => void;
  // eslint-disable-next-line no-unused-vars
  setLanguage: (language: 'ar' | 'en') => void;
  toggleDirection: () => void;
  // eslint-disable-next-line no-unused-vars
  setHighContrast: (enabled: boolean) => void;
  // eslint-disable-next-line no-unused-vars
  setReducedMotion: (enabled: boolean) => void;
  initialize: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: DEFAULT_THEME as 'light' | 'dark',
  direction: 'rtl',
  language: 'ar',
  highContrast: false,
  reducedMotion: false,

  toggleMode: () => {
    const newMode = get().mode === 'light' ? 'dark' : 'light';
    localStorage.setItem(STORAGE_KEYS.THEME, newMode);
    set({ mode: newMode });
  },

  setMode: (mode: 'light' | 'dark') => {
    localStorage.setItem(STORAGE_KEYS.THEME, mode);
    set({ mode });
  },

  setDirection: (direction: 'ltr' | 'rtl') => {
    set({ direction });
    document.dir = direction;
    document.documentElement.setAttribute('dir', direction);
  },

  setLanguage: (language: 'ar' | 'en') => {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
    const direction = language === 'ar' ? 'rtl' : 'ltr';
    set({ language, direction });
    document.dir = direction;
    document.documentElement.setAttribute('dir', direction);
    document.documentElement.setAttribute('lang', language);
  },

  toggleDirection: () => {
    const currentDirection = get().direction;
    const newDirection = currentDirection === 'rtl' ? 'ltr' : 'rtl';
    const newLanguage = newDirection === 'rtl' ? 'ar' : 'en';

    get().setLanguage(newLanguage);
  },

  setHighContrast: (enabled: boolean) => {
    localStorage.setItem('highContrast', enabled.toString());
    set({ highContrast: enabled });

    if (enabled) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  },

  setReducedMotion: (enabled: boolean) => {
    localStorage.setItem('reducedMotion', enabled.toString());
    set({ reducedMotion: enabled });

    if (enabled) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  },

  initialize: () => {
    const savedMode = localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark' | null;
    const savedLanguage = localStorage.getItem(STORAGE_KEYS.LANGUAGE) as 'ar' | 'en' | null;
    const savedHighContrast = localStorage.getItem('highContrast') === 'true';
    const savedReducedMotion = localStorage.getItem('reducedMotion') === 'true';

    if (savedMode) {
      set({ mode: savedMode });
    }

    const language = savedLanguage || 'ar';
    const direction = language === 'ar' ? 'rtl' : 'ltr';

    set({
      language,
      direction,
      highContrast: savedHighContrast,
      reducedMotion: savedReducedMotion,
    });

    document.dir = direction;
    document.documentElement.setAttribute('dir', direction);
    document.documentElement.setAttribute('lang', language);

    // Apply accessibility classes
    if (savedHighContrast) {
      document.documentElement.classList.add('high-contrast');
    }
    if (savedReducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    }
  },
}));
