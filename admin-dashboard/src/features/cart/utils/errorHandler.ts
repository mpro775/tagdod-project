// Error Handling Utilities for Cart Feature

import React from "react";

export interface CartError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export class CartErrorHandler {
  static createError(code: string, message: string, details?: any): CartError {
    return {
      code,
      message,
      details,
      timestamp: new Date(),
    };
  }

  static handleApiError(error: any): CartError {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          return this.createError(
            'VALIDATION_ERROR',
            data.message || 'بيانات غير صحيحة',
            data.details
          );
        case 401:
          return this.createError(
            'UNAUTHORIZED',
            'غير مصرح بالوصول',
            { status }
          );
        case 403:
          return this.createError(
            'FORBIDDEN',
            'غير مسموح بتنفيذ هذا الإجراء',
            { status }
          );
        case 404:
          return this.createError(
            'NOT_FOUND',
            'السلة غير موجودة',
            { status }
          );
        case 409:
          return this.createError(
            'CONFLICT',
            data.message || 'تعارض في البيانات',
            data.details
          );
        case 422:
          return this.createError(
            'VALIDATION_ERROR',
            data.message || 'بيانات غير صحيحة',
            data.errors
          );
        case 429:
          return this.createError(
            'RATE_LIMITED',
            'تم تجاوز الحد المسموح من الطلبات',
            { status }
          );
        case 500:
          return this.createError(
            'SERVER_ERROR',
            'خطأ في الخادم',
            { status }
          );
        default:
          return this.createError(
            'UNKNOWN_ERROR',
            data.message || 'حدث خطأ غير متوقع',
            { status, data }
          );
      }
    } else if (error.request) {
      // Request was made but no response received
      return this.createError(
        'NETWORK_ERROR',
        'فشل في الاتصال بالخادم',
        { originalError: error.message }
      );
    } else {
      // Something else happened
      return this.createError(
        'UNKNOWN_ERROR',
        error.message || 'حدث خطأ غير متوقع',
        { originalError: error }
      );
    }
  }

  static getErrorMessage(error: CartError): string {
    const errorMessages: Record<string, string> = {
      VALIDATION_ERROR: 'البيانات المدخلة غير صحيحة',
      UNAUTHORIZED: 'غير مصرح بالوصول',
      FORBIDDEN: 'غير مسموح بتنفيذ هذا الإجراء',
      NOT_FOUND: 'العنصر المطلوب غير موجود',
      CONFLICT: 'تعارض في البيانات',
      RATE_LIMITED: 'تم تجاوز الحد المسموح من الطلبات',
      SERVER_ERROR: 'خطأ في الخادم',
      NETWORK_ERROR: 'فشل في الاتصال بالخادم',
      UNKNOWN_ERROR: 'حدث خطأ غير متوقع',
    };

    return errorMessages[error.code] || error.message;
  }

  static getErrorSeverity(error: CartError): 'error' | 'warning' | 'info' {
    const severityMap: Record<string, 'error' | 'warning' | 'info'> = {
      VALIDATION_ERROR: 'warning',
      UNAUTHORIZED: 'error',
      FORBIDDEN: 'error',
      NOT_FOUND: 'warning',
      CONFLICT: 'warning',
      RATE_LIMITED: 'warning',
      SERVER_ERROR: 'error',
      NETWORK_ERROR: 'error',
      UNKNOWN_ERROR: 'error',
    };

    return severityMap[error.code] || 'error';
  }

  static logError(error: CartError, context?: string): void {
    console.error(`[Cart Error${context ? ` - ${context}` : ''}]:`, {
      code: error.code,
      message: error.message,
      details: error.details,
      timestamp: error.timestamp,
    });
  }
}

// Validation utilities
export class CartValidator {
  static validateCartId(cartId: string): boolean {
    return !!cartId && cartId.length > 0;
  }

  static validateCartFilters(_filters: any): boolean {
    // Add validation logic for cart filters
    return true;
  }

  static validateCustomerInfo(customerInfo: any): boolean {
    if (!customerInfo) return false;
    
    const { name, email, phone } = customerInfo;
    
    if (!name || name.trim().length === 0) return false;
    if (!email || !this.isValidEmail(email)) return false;
    if (!phone || phone.trim().length === 0) return false;
    
    return true;
  }

  static validateShippingAddress(address: any): boolean {
    if (!address) return false;
    
    const { street, city } = address;
    
    if (!street || street.trim().length === 0) return false;
    if (!city || city.trim().length === 0) return false;
    
    return true;
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateReminderData(data: any): boolean {
    if (!data) return false;
    
    const { reminderType, customMessage } = data;
    
    if (!reminderType || !['first', 'second', 'final'].includes(reminderType)) {
      return false;
    }
    
    if (customMessage && customMessage.length > 500) {
      return false;
    }
    
    return true;
  }
}

// Retry utilities
export class CartRetryHandler {
  static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          break;
        }
        
        // Don't retry on certain error types
        if (this.shouldNotRetry(error)) {
          break;
        }
        
        // Wait before retrying
        await this.delay(delay * attempt);
      }
    }
    
    throw lastError;
  }

  private static shouldNotRetry(error: any): boolean {
    const nonRetryableErrors = ['VALIDATION_ERROR', 'UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND'];
    return nonRetryableErrors.some(code => error.code === code);
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Error boundary for React components
export class CartErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: CartError }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any): { hasError: boolean; error?: CartError } {
    return {
      hasError: true,
      error: CartErrorHandler.createError('COMPONENT_ERROR', error.message, error),
    };
  }

  componentDidCatch(error: any, errorInfo: any) {
    CartErrorHandler.logError(
      CartErrorHandler.createError('COMPONENT_ERROR', error.message, { error, errorInfo }),
      'CartErrorBoundary'
    );
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || React.createElement('div', { style: { padding: '20px', textAlign: 'center' } },
        React.createElement('h3', null, 'حدث خطأ في تحميل مكون السلة'),
        React.createElement('p', null, 'يرجى تحديث الصفحة أو المحاولة مرة أخرى')
      );
    }

    return this.props.children;
  }
}

// Default error messages in Arabic
export const ERROR_MESSAGES = {
  CART_NOT_FOUND: 'السلة غير موجودة',
  CART_ALREADY_CONVERTED: 'تم تحويل هذه السلة إلى طلب مسبقاً',
  CART_EMPTY: 'السلة فارغة',
  CART_EXPIRED: 'انتهت صلاحية السلة',
  INVALID_CART_ID: 'معرف السلة غير صحيح',
  INVALID_CUSTOMER_INFO: 'معلومات العميل غير صحيحة',
  INVALID_SHIPPING_ADDRESS: 'عنوان الشحن غير صحيح',
  REMINDER_ALREADY_SENT: 'تم إرسال التذكير مسبقاً',
  REMINDER_LIMIT_EXCEEDED: 'تم تجاوز الحد المسموح من التذكيرات',
  NETWORK_ERROR: 'فشل في الاتصال بالخادم',
  SERVER_ERROR: 'خطأ في الخادم',
  UNAUTHORIZED: 'غير مصرح بالوصول',
  FORBIDDEN: 'غير مسموح بتنفيذ هذا الإجراء',
  VALIDATION_ERROR: 'البيانات المدخلة غير صحيحة',
  UNKNOWN_ERROR: 'حدث خطأ غير متوقع',
};

export default CartErrorHandler;
