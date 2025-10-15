import { create } from 'zustand';
import { STORAGE_KEYS, DEFAULT_THEME } from '@/config/constants';

interface ThemeState {
  mode: 'light' | 'dark';
  direction: 'ltr' | 'rtl';

  // Actions
  toggleMode: () => void;
  setMode: (mode: 'light' | 'dark') => void;
  setDirection: (direction: 'ltr' | 'rtl') => void;
  initialize: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: DEFAULT_THEME as 'light' | 'dark',
  direction: 'rtl',

  toggleMode: () => {
    const newMode = get().mode === 'light' ? 'dark' : 'light';
    localStorage.setItem(STORAGE_KEYS.THEME, newMode);
    set({ mode: newMode });
  },

  setMode: (mode) => {
    localStorage.setItem(STORAGE_KEYS.THEME, mode);
    set({ mode });
  },

  setDirection: (direction) => {
    set({ direction });
    document.dir = direction;
  },

  initialize: () => {
    const savedMode = localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark' | null;
    const savedLanguage = localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'ar';

    if (savedMode) {
      set({ mode: savedMode });
    }

    const direction = savedLanguage === 'ar' ? 'rtl' : 'ltr';
    set({ direction });
    document.dir = direction;
  },
}));
