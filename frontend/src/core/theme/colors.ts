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
    light: '#F5F5F5',
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

// فئات CSS للألوان
export const colorClasses = {
  // خلفيات
  bgPrimary: 'bg-primary',
  bgSecondary: 'bg-secondary',
  bgLight: 'bg-light',
  bgDark: 'bg-dark',
  
  // نصوص
  textPrimary: 'text-primary',
  textSecondary: 'text-secondary',
  textDark: 'text-dark',
  textLight: 'text-light',
  
  // أزرار
  btnPrimary: 'btn-primary',
  btnSecondary: 'btn-secondary',
  
  // حدود
  borderPrimary: 'border-primary',
  borderSecondary: 'border-secondary',
} as const;

// دوال مساعدة للألوان
export const colorUtils = {
  /**
   * تحويل hex إلى rgba
   */
  hexToRgba: (hex: string, alpha: number = 1): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },
  
  /**
   * تحويل hex إلى hsl
   */
  hexToHsl: (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  },
  
  /**
   * إنشاء ألوان متدرجة
   */
  createGradient: (color1: string, color2: string, direction: string = '135deg'): string => {
    return `linear-gradient(${direction}, ${color1} 0%, ${color2} 100%)`;
  },
  
  /**
   * فحص التباين بين لونين
   */
  getContrastRatio: (color1: string, color2: string): number => {
    // تطبيق مبسط لفحص التباين
    const getLuminance = (hex: string): number => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      
      const [rs, gs, bs] = [r, g, b].map(c => 
        c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      );
      
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };
    
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  },
} as const;

// تصدير الألوان الافتراضية
export default colors;
