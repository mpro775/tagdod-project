import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { ApiErrorResponse } from '@/shared/types/common.types';
import * as Sentry from '@sentry/react';

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
      const data = error.response?.data;
      
      // New unified format: { success: false, error: { code, message, details } }
      if (data?.error?.message) {
        return data.error.message;
      }
      
      // Legacy format: { message: string }
      if (data?.message) {
        return data.message;
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
      // eslint-disable-next-line no-console
      console.error(`[Error${context ? ` - ${context}` : ''}]:`, error);
    }

    // Send to error tracking service (Sentry)
    Sentry.withScope((scope) => {
      if (context) {
        scope.setTag('context', context);
      }

      // Add additional context based on error type
      if (error instanceof AxiosError) {
        scope.setTag('error_type', 'api_error');
        scope.setLevel('error');

        if (error.response) {
          scope.setContext('api_response', {
            status: error.response.status,
            statusText: error.response.statusText,
            url: error.config?.url,
            method: error.config?.method,
          });
        } else if (error.request) {
          scope.setTag('error_type', 'network_error');
          scope.setLevel('warning');
        }
      } else {
        scope.setTag('error_type', 'application_error');
        scope.setLevel('error');
      }

      // Add user context if available
      try {
        // Get user data from localStorage (as stored by authStore)
        const userData = localStorage.getItem('user_data');
        if (userData) {
          const user = JSON.parse(userData);
          if (user && user._id) {
            scope.setUser({
              id: user._id,
              email: user.email,
              username: user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.firstName || user.email
            });
          }
        }
      } catch {
        // Silently ignore user context errors
      }

      Sentry.captureException(error);
    });
  }
}

