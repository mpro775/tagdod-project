import { apiClient } from '@/core/api/client';
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
    const response = await apiClient.post<{ sent: boolean; devCode?: string }>(
      '/auth/send-otp',
      data
    );
    return response.data;
  },

  /**
   * تحقق من OTP وتسجيل دخول
   */
  verifyOtp: async (data: VerifyOtpDto) => {
    const response = await apiClient.post<LoginResponse>('/auth/verify-otp', data);
    return response.data;
  },

  /**
   * نسيت كلمة المرور
   */
  forgotPassword: async (data: ForgotPasswordDto) => {
    const response = await apiClient.post<{ sent: boolean; devCode?: string }>(
      '/auth/forgot-password',
      data
    );
    return response.data;
  },

  /**
   * إعادة تعيين كلمة المرور
   */
  resetPassword: async (data: ResetPasswordDto) => {
    const response = await apiClient.post<{ updated: boolean }>(
      '/auth/reset-password',
      data
    );
    return response.data;
  },

  /**
   * تعيين كلمة المرور (بعد تسجيل الدخول)
   */
  setPassword: async (data: SetPasswordDto) => {
    const response = await apiClient.post<{ updated: boolean }>(
      '/auth/set-password',
      data
    );
    return response.data;
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
    jobTitle?: string;
  }) => {
    const response = await apiClient.patch<{ updated: boolean }>('/auth/me', data);
    return response.data;
  },

  /**
   * حذف الحساب
   */
  deleteAccount: async () => {
    const response = await apiClient.delete<{ deleted: boolean }>('/auth/me');
    return response.data;
  },

  /**
   * تحديث الـ Refresh Token
   */
  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post<{ accessToken: string }>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },
};

