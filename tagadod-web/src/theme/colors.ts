/**
 * Tagadod App Colors - from app_colors.dart
 */
export const colors = {
  // Primary & Secondary
  primary: '#1E99D3',
  secondary: '#159647',

  // Backgrounds
  lightBackground: '#FFFFFF',
  darkBackground: '#212124',
  darkGray: '#1C1C1E',
  lightGray: '#F5F5F5',

  // Text
  titles: '#56575C',
  darkTitles: '#D8D8DC',

  // UI Elements
  gray: '#8A8A8E',
  white: '#FFFFFF',
  black: '#000000',
  red: '#E01B1B',
  yellow: '#FFB340',
  orange: '#FFB340',
  lightBlue: '#E4F5FF',

  // Specific
  lightBottomAppBar: '#F9F9F9',
  darkBottomAppBar: '#3A3A3C',
  textFieldBackground: '#EEEEEE',
  lightOnboardingCerial: '#E6F7FF',
  darkOnboardingCerial: '#2D2D2F',
  lightPatternBackground: '#EFEFF1',
  lightGreenBackground: '#D9F0D9',
} as const;

export const gradients = {
  linerGreen: 'linear-gradient(135deg, #159647 0%, #8BC543 100%)',
  linerGreenReversed: 'linear-gradient(135deg, #8BC543 0%, #159647 100%)',
  linerBlue: 'linear-gradient(135deg, #E4F5FF 0%, #C8EDFF 100%)',
  /** للوضع الليلي – كـ darkLinerBlue في التطبيق */
  linerBlueDark: 'linear-gradient(135deg, rgba(58,58,60,0.5) 0%, #3A3A3C 100%)',
} as const;

export type Colors = typeof colors;
export type Gradients = typeof gradients;
