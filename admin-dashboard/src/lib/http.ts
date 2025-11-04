import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';
import * as Sentry from '@sentry/react';
import { STORAGE_KEYS } from '@/config/constants';

// Create axios instance with environment configuration
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT ?? 30000),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
http.interceptors.request.use(
  (config) => {
    // Add auth token
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // eslint-disable-next-line no-console
      console.log('🔑 Adding token to request:', config.url);
    }

    // Add language header
    const language = localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'ar';
    config.headers['Accept-Language'] = language;

    // Add Turnstile token if available
    const turnstileToken = localStorage.getItem('cf-turnstile-token');
    if (turnstileToken) {
      config.headers['cf-turnstile-token'] = turnstileToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
http.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    const response = error.response;

    // Extract error message
    const err = (response?.data as any)?.error ?? { 
      message: error.message || 'حدث خطأ غير متوقع' 
    };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        
        if (refreshToken) {
          const refreshResponse = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = refreshResponse.data.data;
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);

          // Retry original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return http(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      // eslint-disable-next-line no-console
      console.error('❌ Access forbidden:', err.message);
      toast.error('ليس لديك صلاحية للوصول إلى هذا المورد');
    }

    // Handle 500+ Server Errors
    if (error.response?.status && error.response.status >= 500) {
      // eslint-disable-next-line no-console
      console.error('❌ Server error:', err.message);
      toast.error('حدث خطأ في الخادم، يرجى المحاولة مرة أخرى');
      
      // Send server errors to Sentry
      Sentry.withScope((scope) => {
        scope.setTag('error_type', 'server_error');
        scope.setLevel('error');
        scope.setContext('http_request', {
          url: originalRequest?.url,
          method: originalRequest?.method,
          status: error.response?.status,
          statusText: error.response?.statusText,
        });
        Sentry.captureException(error);
      });
    } else if (error.response?.status && error.response.status >= 400) {
      // Send client errors (400-499) to Sentry as warnings, except 401 and 403
      if (error.response.status !== 401 && error.response.status !== 403) {
        Sentry.withScope((scope) => {
          scope.setTag('error_type', 'client_error');
          scope.setLevel('warning');
          scope.setContext('http_request', {
            url: originalRequest?.url,
            method: originalRequest?.method,
            status: error.response?.status,
            statusText: error.response?.statusText,
          });
          Sentry.captureException(error);
        });
      }
    } else if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      // Send network errors to Sentry
      Sentry.withScope((scope) => {
        scope.setTag('error_type', 'network_error');
        scope.setLevel('warning');
        scope.setContext('http_request', {
          url: originalRequest?.url,
          method: originalRequest?.method,
          code: error.code,
        });
        Sentry.captureException(error);
      });
    }

    // Show unified error toast for other errors
    toast.error(err.message || 'حدث خطأ غير متوقع');
    // eslint-disable-next-line no-console
    console.error('❌ HTTP Error:', err);
    
    return Promise.reject(err);
  }
);

export default http;
