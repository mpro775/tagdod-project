import { alpha, createTheme, ThemeOptions } from '@mui/material/styles';
import { arSA, enUS } from '@mui/material/locale';
import type {} from '@mui/x-data-grid/themeAugmentation';
import './brand-colors.css';
import {
  designColors,
  designRadius,
  designShadows,
  designTypography,
} from '@/shared/design-system/tokens';

const getBaseTheme = (mode: 'light' | 'dark'): ThemeOptions => {
  const isLight = mode === 'light';

  return {
    palette: {
      mode,
      primary: {
        main: designColors.brand.primary,
        light: '#4DB8E6',
        dark: designColors.brand.primaryDark,
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: designColors.brand.accent,
        light: '#86E6B1',
        dark: '#16844C',
        contrastText: '#FFFFFF',
      },
      success: {
        main: designColors.status.success,
        light: '#DDF7EB',
        dark: '#146C47',
      },
      warning: {
        main: designColors.status.warning,
        light: '#FEF3C7',
        dark: '#92400E',
      },
      error: {
        main: designColors.status.error,
        light: '#FEE2E2',
        dark: '#991B1B',
      },
      info: {
        main: designColors.status.info,
        light: designColors.brand.primaryLight,
        dark: '#155E95',
      },
      background: {
        default: isLight ? designColors.surface.default : '#111827',
        paper: isLight ? designColors.surface.paper : '#172033',
      },
      text: {
        primary: isLight ? designColors.text.primary : '#F8FAFC',
        secondary: isLight ? designColors.text.secondary : '#CBD5E1',
        disabled: isLight ? designColors.text.disabled : '#64748B',
      },
      divider: isLight ? designColors.border.soft : alpha('#FFFFFF', 0.12),
    },
    typography: {
      fontFamily: designTypography.fontFamily,
      h1: {
        fontWeight: designTypography.fontWeights.extrabold,
        lineHeight: designTypography.lineHeights.heading,
      },
      h2: {
        fontWeight: designTypography.fontWeights.extrabold,
        lineHeight: designTypography.lineHeights.heading,
      },
      h3: {
        fontWeight: designTypography.fontWeights.bold,
        lineHeight: designTypography.lineHeights.heading,
      },
      h4: {
        fontWeight: designTypography.fontWeights.bold,
        lineHeight: designTypography.lineHeights.heading,
      },
      h5: {
        fontWeight: designTypography.fontWeights.bold,
        lineHeight: designTypography.lineHeights.heading,
      },
      h6: {
        fontWeight: designTypography.fontWeights.semibold,
        lineHeight: designTypography.lineHeights.heading,
      },
      body1: {
        lineHeight: designTypography.lineHeights.body,
      },
      body2: {
        lineHeight: designTypography.lineHeights.body,
      },
      button: {
        textTransform: 'none',
        fontWeight: designTypography.fontWeights.semibold,
      },
    },
    shape: {
      borderRadius: designRadius.md,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundImage: 'none',
            textRendering: 'optimizeLegibility',
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: designRadius.md,
            minHeight: 38,
            paddingInline: 16,
            letterSpacing: 0,
          },
          containedPrimary: {
            boxShadow: `0 8px 18px ${alpha(designColors.brand.primary, 0.18)}`,
          },
          outlined: {
            borderColor: isLight ? designColors.border.default : alpha('#FFFFFF', 0.18),
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: designRadius.lg,
            backgroundImage: 'none',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: designRadius.lg,
            backgroundImage: 'none',
          },
          elevation1: {
            boxShadow: designShadows.card,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: 'small',
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: designRadius.md,
          },
        },
      },
      MuiSelect: {
        defaultProps: {
          size: 'small',
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: designRadius.pill,
            fontWeight: designTypography.fontWeights.semibold,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: designRadius.xl,
            boxShadow: designShadows.modal,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
            boxShadow: designShadows.drawer,
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            minHeight: 42,
          },
          indicator: {
            height: 3,
            borderRadius: designRadius.pill,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            minHeight: 42,
            letterSpacing: 0,
            fontWeight: designTypography.fontWeights.semibold,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: designTypography.fontWeights.bold,
            color: isLight ? designColors.text.primary : '#F8FAFC',
            backgroundColor: isLight ? '#F8FAFC' : alpha('#FFFFFF', 0.04),
          },
          root: {
            borderBottomColor: isLight ? designColors.border.soft : alpha('#FFFFFF', 0.12),
          },
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: 'none',
            backgroundColor: isLight ? designColors.surface.paper : '#172033',
          },
          columnHeaders: {
            backgroundColor: isLight ? '#F8FAFC' : alpha('#FFFFFF', 0.04),
            borderBottomColor: isLight ? designColors.border.soft : alpha('#FFFFFF', 0.12),
          },
          columnHeaderTitle: {
            fontWeight: designTypography.fontWeights.bold,
          },
          cell: {
            borderBottomColor: isLight ? designColors.border.soft : alpha('#FFFFFF', 0.1),
          },
          row: {
            '&:hover': {
              backgroundColor: alpha(designColors.brand.primary, isLight ? 0.045 : 0.12),
            },
          },
          footerContainer: {
            borderTopColor: isLight ? designColors.border.soft : alpha('#FFFFFF', 0.12),
          },
        },
      },
    },
  };
};

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

export const lightTheme = createAppTheme('light', 'rtl', 'ar');
export const darkTheme = createAppTheme('dark', 'rtl', 'ar');
