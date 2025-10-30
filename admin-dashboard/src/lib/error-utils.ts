/**
 * Unified Error Handling Utilities for Frontend
 * يدعم البنية الجديدة للأخطاء من Backend
 */

import { AxiosError } from 'axios';

export interface ParsedError {
  code: string;
  message: string;
  details?: unknown;
  fieldErrors?: Array<{ field: string; message: string }>;
  status?: number;
}

/**
 * استخراج معلومات الخطأ من الاستجابة
 * Extract error information from API response
 * 
 * يدعم كلاً من:
 * - البنية القديمة: { message: string }
 * - البنية الجديدة: { success: false, error: { code, message, details, fieldErrors } }
 */
export function parseApiError(error: unknown): ParsedError {
  // Handle Axios errors
  if (error instanceof AxiosError) {
    const response = error.response;
    const status = response?.status;
    const data = response?.data;

    // New unified format: { success: false, error: { code, message, details, fieldErrors } }
    if (data?.error) {
      return {
        code: data.error.code || `HTTP_${status}`,
        message: data.error.message || getDefaultErrorMessage(status),
        details: data.error.details,
        fieldErrors: data.error.fieldErrors,
        status,
      };
    }

    // Legacy format: { message: string }
    if (data?.message) {
      return {
        code: `HTTP_${status}`,
        message: data.message,
        details: data.details,
        status,
      };
    }

    // No data, use default messages
    return {
      code: error.code || `HTTP_${status}` || 'NETWORK_ERROR',
      message: getDefaultErrorMessage(status) || error.message || 'حدث خطأ غير متوقع',
      status,
    };
  }

  // Handle Error objects
  if (error instanceof Error) {
    return {
      code: 'CLIENT_ERROR',
      message: error.message || 'حدث خطأ غير متوقع',
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      code: 'UNKNOWN_ERROR',
      message: error,
    };
  }

  // Unknown error type
  return {
    code: 'UNKNOWN_ERROR',
    message: 'حدث خطأ غير متوقع',
  };
}

/**
 * الحصول على رسالة خطأ افتراضية بناءً على HTTP status
 * Get default error message based on HTTP status code
 */
function getDefaultErrorMessage(status?: number): string {
  if (!status) return 'حدث خطأ غير متوقع';

  const messages: Record<number, string> = {
    400: 'بيانات غير صحيحة',
    401: 'غير مصرح بالوصول',
    403: 'ليس لديك صلاحية للوصول',
    404: 'العنصر المطلوب غير موجود',
    409: 'تعارض في البيانات',
    422: 'بيانات غير صحيحة',
    429: 'تم تجاوز الحد المسموح من الطلبات',
    500: 'خطأ في الخادم الداخلي',
    502: 'خطأ في بوابة الخادم',
    503: 'الخدمة غير متاحة حالياً',
    504: 'انتهت مهلة الاتصال بالخادم',
  };

  if (status >= 500) {
    return messages[status] || 'خطأ في الخادم';
  }

  if (status >= 400) {
    return messages[status] || 'خطأ في الطلب';
  }

  return 'حدث خطأ غير متوقع';
}

/**
 * الحصول على رسالة الخطأ فقط
 * Get error message only (shorthand)
 */
export function getErrorMessage(error: unknown): string {
  return parseApiError(error).message;
}

/**
 * الحصول على error code فقط
 * Get error code only
 */
export function getErrorCode(error: unknown): string {
  return parseApiError(error).code;
}

/**
 * الحصول على field errors
 * Get field validation errors
 */
export function getFieldErrors(error: unknown): Record<string, string> {
  const parsed = parseApiError(error);
  
  if (!parsed.fieldErrors) {
    return {};
  }

  const result: Record<string, string> = {};
  parsed.fieldErrors.forEach((fieldError) => {
    result[fieldError.field] = fieldError.message;
  });

  return result;
}

/**
 * التحقق من نوع الخطأ
 * Check if error matches specific code
 */
export function isErrorCode(error: unknown, code: string): boolean {
  const parsed = parseApiError(error);
  return parsed.code === code;
}

/**
 * التحقق من أخطاء التحقق
 * Check if error is validation error
 */
export function isValidationError(error: unknown): boolean {
  const parsed = parseApiError(error);
  return parsed.code.includes('VALIDATION') || parsed.status === 400 || parsed.status === 422;
}

/**
 * التحقق من أخطاء المصادقة
 * Check if error is authentication error
 */
export function isAuthError(error: unknown): boolean {
  const parsed = parseApiError(error);
  return parsed.code.includes('AUTH') || parsed.status === 401;
}

/**
 * التحقق من أخطاء الصلاحيات
 * Check if error is permission error
 */
export function isPermissionError(error: unknown): boolean {
  const parsed = parseApiError(error);
  return parsed.code.includes('FORBIDDEN') || parsed.code.includes('PERMISSION') || parsed.status === 403;
}

/**
 * التحقق من أخطاء عدم الوجود
 * Check if error is not found error
 */
export function isNotFoundError(error: unknown): boolean {
  const parsed = parseApiError(error);
  return parsed.code.includes('NOT_FOUND') || parsed.status === 404;
}

/**
 * معالجة خطأ بشكل شامل
 * Handle error comprehensively
 */
export function handleError(error: unknown, context?: string): ParsedError {
  const parsed = parseApiError(error);

  // Log in development
  if (import.meta.env.MODE === 'development') {
    console.error(`[Error${context ? ` - ${context}` : ''}]:`, {
      code: parsed.code,
      message: parsed.message,
      details: parsed.details,
      status: parsed.status,
    });
  }

  return parsed;
}

/**
 * Error Code Constants من Backend
 * Error codes from backend for Frontend reference
 */
export const BackendErrorCodes = {
  // Auth
  AUTH_INVALID_OTP: 'AUTH_100',
  AUTH_USER_NOT_FOUND: 'AUTH_103',
  AUTH_INVALID_PASSWORD: 'AUTH_104',
  AUTH_USER_BLOCKED: 'AUTH_106',
  AUTH_UNAUTHORIZED: 'AUTH_115',
  AUTH_FORBIDDEN: 'AUTH_116',
  
  // Products
  PRODUCT_NOT_FOUND: 'PRODUCT_300',
  PRODUCT_OUT_OF_STOCK: 'PRODUCT_301',
  PRODUCT_INSUFFICIENT_STOCK: 'PRODUCT_302',
  
  // Cart
  CART_NOT_FOUND: 'CART_500',
  CART_EMPTY: 'CART_501',
  CART_ITEM_NOT_FOUND: 'CART_502',
  
  // Orders
  ORDER_NOT_FOUND: 'ORDER_600',
  ORDER_CANNOT_CANCEL: 'ORDER_602',
  
  // Payment
  PAYMENT_FAILED: 'PAYMENT_700',
  
  // Upload
  UPLOAD_FAILED: 'UPLOAD_1050',
  FILE_TOO_LARGE: 'UPLOAD_1051',
  INVALID_FILE_TYPE: 'UPLOAD_1052',
} as const;

export type BackendErrorCode = typeof BackendErrorCodes[keyof typeof BackendErrorCodes];

