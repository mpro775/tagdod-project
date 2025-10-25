import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/shared/types/common.types';

// Types for admin management
export interface CreateAdminDto {
  phone: string;
  firstName: string;
  lastName?: string;
  gender?: 'male' | 'female' | 'other';
  roles: string[];
  permissions: string[];
  temporaryPassword?: string;
  activateImmediately?: boolean;
  description?: string;
}

export interface CreateRoleBasedAdminDto {
  adminType: 'full_admin' | 'product_manager' | 'sales_manager' | 'support_manager' | 'marketing_manager' | 'content_manager' | 'view_only';
  phone: string;
  firstName: string;
  lastName?: string;
  gender?: 'male' | 'female' | 'other';
  additionalPermissions?: string[];
  description?: string;
}

export interface AdminCreationResponse {
  id: string;
  phone: string;
  firstName: string;
  lastName?: string;
  roles: string[];
  permissions: string[];
  status: string;
  temporaryPassword?: string;
  loginUrl?: string;
  message: string;
}

// Admin management API functions
export const adminApi = {
  /**
   * إنشاء أدمن مع صلاحيات مخصصة
   */
  createAdmin: async (data: CreateAdminDto): Promise<AdminCreationResponse> => {
    const response = await apiClient.post<ApiResponse<AdminCreationResponse>>('/admin/users/create-admin', data);
    return response.data.data;
  },

  /**
   * إنشاء أدمن بناءً على الدور
   */
  createRoleBasedAdmin: async (data: CreateRoleBasedAdminDto): Promise<AdminCreationResponse> => {
    const response = await apiClient.post<ApiResponse<AdminCreationResponse>>('/admin/users/create-role-admin', data);
    return response.data.data;
  },

  /**
   * تحديث صلاحيات أدمن موجود
   */
  updateAdminPermissions: async (adminId: string, updateData: { permissions: string[]; roles?: string[] }) => {
    const response = await apiClient.patch<ApiResponse<unknown>>(`/admin/users/${adminId}/permissions`, updateData);
    return response.data.data;
  },

  /**
   * الحصول على قائمة الأدمن
   */
  getAdmins: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await apiClient.get<ApiResponse<unknown>>('/admin/users', { params });
    return response.data.data;
  },

  /**
   * الحصول على تفاصيل أدمن
   */
  getAdminDetails: async (adminId: string) => {
    const response = await apiClient.get<ApiResponse<unknown>>(`/admin/users/${adminId}`);
    return response.data.data;
  },

  /**
   * حذف أدمن
   */
  deleteAdmin: async (adminId: string) => {
    const response = await apiClient.delete<ApiResponse<{ id: string; deleted: boolean; deletedAt: Date }>>(`/admin/users/${adminId}`);
    return response.data.data;
  },

  /**
   * تعليق أدمن
   */
  suspendAdmin: async (adminId: string, reason?: string) => {
    const response = await apiClient.post<ApiResponse<{ id: string; status: string; suspended: boolean }>>(`/admin/users/${adminId}/suspend`, { reason });
    return response.data.data;
  },

  /**
   * تفعيل أدمن
   */
  activateAdmin: async (adminId: string) => {
    const response = await apiClient.post<ApiResponse<{ id: string; status: string; activated: boolean }>>(`/admin/users/${adminId}/activate`);
    return response.data.data;
  },
};
