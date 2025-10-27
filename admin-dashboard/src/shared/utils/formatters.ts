import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

/**
 * Format date
 */
export const formatDate = (
  date: Date | string,
  formatStr = 'yyyy-MM-dd',
  locale: 'ar' | 'en' = 'ar'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const localeObj = locale === 'ar' ? ar : enUS;
  return format(dateObj, formatStr, { locale: localeObj });
};

/**
 * Format currency
 */
export const formatCurrency = (
  amount: number,
  currency = 'USD',
  locale: 'ar' | 'en' = 'ar'
): string => {
  const localeStr = locale === 'ar' ? 'ar-SA' : 'en-US';

  return new Intl.NumberFormat(localeStr, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format number
 */
export const formatNumber = (
  value: number,
  locale: 'ar' | 'en' = 'ar',
  options?: Intl.NumberFormatOptions
): string => {
  const localeStr = locale === 'ar' ? 'ar-SA' : 'en-US';
  return new Intl.NumberFormat(localeStr, options).format(value);
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');

  // Format as: +966 XX XXX XXXX
  if (cleaned.startsWith('966')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(
      8
    )}`;
  }

  // Format as: 0XX XXX XXXX
  if (cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }

  return phone;
};

/**
 * Truncate text
 */
export const truncateText = (text: string, maxLength = 50, suffix = '...'): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Sanitize pagination parameters to ensure they are numbers
 */
export const sanitizePaginationParams = (params: Record<string, any>): Record<string, any> => {
  const sanitized = { ...params };

  // Ensure page and limit are numbers
  if (sanitized.page !== undefined) {
    sanitized.page = sanitized.page ? Number(sanitized.page) : 1;
  }

  if (sanitized.limit !== undefined) {
    sanitized.limit = sanitized.limit ? Number(sanitized.limit) : 20;
  }

  return sanitized;
};