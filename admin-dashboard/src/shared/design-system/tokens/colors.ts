export const designColors = {
  brand: {
    primary: '#1A8BC2',
    primaryDark: '#126A96',
    primaryLight: '#DDF3FB',
    accent: '#2FBF71',
  },
  surface: {
    default: '#F6F8FB',
    paper: '#FFFFFF',
    raised: '#FFFFFF',
    soft: '#EEF4F8',
  },
  text: {
    primary: '#17212B',
    secondary: '#52616F',
    disabled: '#9AA7B2',
  },
  border: {
    default: '#D8E1E8',
    soft: '#EAF0F4',
  },
  status: {
    success: '#228B5E',
    warning: '#B7791F',
    error: '#C2413B',
    info: '#1A75BB',
    neutral: '#64748B',
  },
} as const;

export type DesignStatusTone = keyof typeof designColors.status;
export type DesignBrandTone = keyof typeof designColors.brand;

export default designColors;
