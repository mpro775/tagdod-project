/**
 * Tagadodo Brand Colors - ألوان العلامة التجارية
 * 
 * هذا الملف يحتوي على جميع الألوان المستخدمة في تطبيق Tagadodo
 * مع دعم للوضع الفاتح والداكن
 */

export const colors = {
  // الألوان الأساسية
  primary: {
    main: '#1A8BC2',      // اللون الأساسي - أزرق Tagadodo
    light: '#4DB8E6',     // نسخة فاتحة
    dark: '#1470A3',      // نسخة داكنة
    contrastText: '#FFFFFF',
  },
  
  // الألوان الثانوية
  secondary: {
    main: '#90EE90',      // الأخضر الفاتح
    light: '#B8F5B8',     // نسخة فاتحة
    dark: '#7DD87D',      // نسخة داكنة
    contrastText: '#000000',
  },
  
  // الألوان المحايدة
  neutral: {
    black: '#000000',
    dark: '#333333',
    medium: '#666666',
    light: '#F5F5F5',
    white: '#FFFFFF',
  },
  
  // ألوان الحالة
  status: {
    success: '#90EE90',    // أخضر للنجاح
    warning: '#FFA500',    // برتقالي للتحذير
    error: '#FF6B6B',     // أحمر للخطأ
    info: '#1A8BC2',      // أزرق للمعلومات
  },
  
  // ألوان الخلفية
  background: {
    primary: '#1A8BC2',
    secondary: '#90EE90',
    light: '#FFFFFF',
    dark: '#333333',
    paper: '#FFFFFF',
  },
  
  // ألوان النص
  text: {
    primary: '#000000',
    secondary: '#666666',
    light: '#FFFFFF',
    muted: '#999999',
  },
  
  // ألوان الحدود
  border: {
    primary: '#1A8BC2',
    secondary: '#90EE90',
    light: '#E0E0E0',
    dark: '#333333',
  },
  
  // ألوان الظلال
  shadow: {
    primary: 'rgba(26, 139, 194, 0.3)',
    secondary: 'rgba(144, 238, 144, 0.3)',
    light: 'rgba(0, 0, 0, 0.1)',
    dark: 'rgba(0, 0, 0, 0.3)',
  },
} as const;

// ألوان متدرجة
export const gradients = {
  primary: 'linear-gradient(135deg, #1A8BC2 0%, #4DB8E6 100%)',
  secondary: 'linear-gradient(135deg, #90EE90 0%, #B8F5B8 100%)',
  brand: 'linear-gradient(135deg, #1A8BC2 0%, #90EE90 100%)',
  dark: 'linear-gradient(135deg, #333333 0%, #000000 100%)',
} as const;

// ألوان الوضع المظلم
export const darkColors = {
  ...colors,
  background: {
    ...colors.background,
    primary: '#1A8BC2',
    secondary: '#90EE90',
    light: '#1a1a1a',
    dark: '#000000',
    paper: '#2a2a2a',
  },
  text: {
    ...colors.text,
    primary: '#FFFFFF',
    secondary: '#CCCCCC',
    light: '#FFFFFF',
    muted: '#999999',
  },
} as const;
