import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { ApiErrorResponse } from '@/shared/types/common.types';

export class ErrorHandler {
  /**
   * Show error message
   */
  static showError(error: unknown): void {
    const message = this.getErrorMessage(error);
    toast.error(message);
  }

  /**
   * Get error message
   */
  static getErrorMessage(error: unknown): string {
    // Axios error
    if (error instanceof AxiosError) {
      const apiError = error.response?.data as ApiErrorResponse;
      
      if (apiError?.error?.message) {
        return apiError.error.message;
      }

      // Network error
      if (error.code === 'ERR_NETWORK') {
        return 'خطأ في الاتصال بالشبكة';
      }

      // Timeout
      if (error.code === 'ECONNABORTED') {
        return 'انتهت مهلة الطلب';
      }

      return 'حدث خطأ غير متوقع';
    }

    // Error object
    if (error instanceof Error) {
      return error.message;
    }

    // String error
    if (typeof error === 'string') {
      return error;
    }

    return 'حدث خطأ غير متوقع';
  }

  /**
   * Get field errors
   */
  static getFieldErrors(error: unknown): Record<string, string> {
    if (error instanceof AxiosError) {
      const apiError = error.response?.data as ApiErrorResponse;
      
      if (apiError?.error?.fieldErrors) {
        const fieldErrors: Record<string, string> = {};
        apiError.error.fieldErrors.forEach((fieldError) => {
          fieldErrors[fieldError.field] = fieldError.message;
        });
        return fieldErrors;
      }
    }

    return {};
  }

  /**
   * Log error
   */
  static logError(error: unknown, context?: string): void {
    if (import.meta.env.MODE === 'development') {
      console.error(`[Error${context ? ` - ${context}` : ''}]:`, error);
    }

    // TODO: Send to error tracking service (Sentry, etc.)
  }
}

