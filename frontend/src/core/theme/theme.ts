import { createTheme, ThemeOptions } from '@mui/material/styles';
import { arSA, enUS } from '@mui/material/locale';
import './brand-colors.css';
import { colors } from './colors';

// Color palette - Tagadodo Brand Colors
const themeColors = {
  primary: colors.primary,
  secondary: colors.secondary,
  success: {
    main: colors.status.success,
    light: colors.secondary.light,
    dark: colors.secondary.dark,
  },
  error: {
    main: colors.status.error,
    light: '#ff8a80',
    dark: '#d32f2f',
  },
  warning: {
    main: colors.status.warning,
    light: '#ffb74d',
    dark: '#f57c00',
  },
  info: {
    main: colors.status.info,
    light: colors.primary.light,
    dark: colors.primary.dark,
  },
};

// Base theme options
const getBaseTheme = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    ...themeColors,
    ...(mode === 'light'
      ? {
          background: {
            default: colors.background.light,
            paper: colors.background.paper,
          },
          text: {
            primary: colors.text.primary,
            secondary: colors.text.secondary,
          },
        }
      : {
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
          text: {
            primary: colors.text.light,
            secondary: colors.text.muted,
          },
        }),
  },
  typography: {
    fontFamily: [
      '"Cairo"',
      '"Tajawal"',
      '"Amiri"',
      '"Scheherazade New"',
      '"Noto Sans Arabic"',
      '"Arial Unicode MS"',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      '"Segoe UI Arabic"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    button: {
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontFamily: 'inherit',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: 'inherit',
          fontFeatureSettings: '"liga" 1, "calt" 1',
          textRendering: 'optimizeLegibility',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

// Create theme with RTL and locale support
export const createAppTheme = (
  mode: 'light' | 'dark' = 'light',
  direction: 'ltr' | 'rtl' = 'rtl',
  language: 'ar' | 'en' = 'ar'
) => {
  const baseTheme = getBaseTheme(mode);
  const locale = language === 'ar' ? arSA : enUS;

  return createTheme(
    {
      ...baseTheme,
      direction,
    },
    locale
  );
};

// Default themes
export const lightTheme = createAppTheme('light', 'rtl', 'ar');
export const darkTheme = createAppTheme('dark', 'rtl', 'ar');

