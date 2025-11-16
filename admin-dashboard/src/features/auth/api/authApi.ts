import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/shared/types/common.types';
import {
  SendOtpDto,
  VerifyOtpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  SetPasswordDto,
  LoginResponse,
  UserProfile,
} from '../types/auth.types';

export const authApi = {
  /**
   * إرسال OTP
   */
  sendOtp: async (data: SendOtpDto) => {
    const response = await apiClient.post<ApiResponse<{ sent: boolean; devCode?: string }>>(
      '/auth/send-otp',
      data
    );
    return response.data.data;
  },

  /**
   * تحقق من OTP وتسجيل دخول
   */
  verifyOtp: async (data: VerifyOtpDto) => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/verify-otp', data);
    return response.data.data;
  },

  /**
   * نسيت كلمة المرور
   */
  forgotPassword: async (data: ForgotPasswordDto) => {
    const response = await apiClient.post<ApiResponse<{ sent: boolean; devCode?: string }>>(
      '/auth/forgot-password',
      data
    );
    return response.data.data;
  },

  /**
   * إعادة تعيين كلمة المرور
   */
  resetPassword: async (data: ResetPasswordDto) => {
    const response = await apiClient.post<ApiResponse<{ updated: boolean }>>('/auth/reset-password', data);
    return response.data.data;
  },

  /**
   * تعيين كلمة المرور (بعد تسجيل الدخول)
   */
  setPassword: async (data: SetPasswordDto) => {
    const response = await apiClient.post<ApiResponse<{ updated: boolean }>>('/auth/set-password', data);
    return response.data.data;
  },

  /**
   * الحصول على بيانات المستخدم الحالي
   */
  getProfile: async () => {
    const response = await apiClient.get<UserProfile>('/auth/me');
    return response.data;
  },

  /**
   * تحديث الملف الشخصي
   */
  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    gender?: string;
    city?: string;
    jobTitle?: string;
  }) => {
    const response = await apiClient.patch<ApiResponse<{ updated: boolean }>>('/auth/me', data);
    return response.data.data;
  },

  /**
   * حذف الحساب
   */
  deleteAccount: async () => {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>('/auth/me');
    return response.data.data;
  },

  /**
   * تحديث الـ Refresh Token
   */
  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post<ApiResponse<{ accessToken: string }>>('/auth/refresh', {
      refreshToken,
    });
    return response.data.data;
  },

  /**
   * تسجيل دخول الأدمن بكلمة المرور
   */
  adminLogin: async (data: { phone: string; password: string }) => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/admin-login', data);
    return response.data.data;
  },

  /**
   * تسجيل دخول التطوير (للاستخدام في مرحلة التطوير فقط)
   */
  devLogin: async (data: { phone: string; password: string }) => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/dev-login', data);
    return response.data.data;
  },

  /**
   * إنشاء السوبر أدمن (للاستخدام الأولي فقط)
   */
  createSuperAdmin: async (secretKey: string) => {
    const response = await apiClient.post<ApiResponse<{
      message: string;
      admin: {
        id: string;
        phone: string;
        firstName: string;
        lastName: string;
        roles: string[];
        status: string;
      };
      loginInfo: {
        phone: string;
        password: string;
      };
    }>>('/auth/create-super-admin', { secretKey });
    return response.data.data;
  },
};
