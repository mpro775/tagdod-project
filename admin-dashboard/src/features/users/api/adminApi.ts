import { apiClient } from '@/core/api/client';

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
  success: boolean;
  message: string;
  data: {
    id: string;
    phone: string;
    firstName: string;
    lastName?: string;
    roles: string[];
    permissions: string[];
    status: string;
    temporaryPassword?: string;
    loginUrl?: string;
  };
}

// Admin management API functions
export const adminApi = {
  /**
   * إنشاء أدمن مع صلاحيات مخصصة
   */
  createAdmin: async (data: CreateAdminDto): Promise<AdminCreationResponse> => {
    const response = await apiClient.post<AdminCreationResponse>('/admin/users/create-admin', data);
    return response.data;
  },

  /**
   * إنشاء أدمن بناءً على الدور
   */
  createRoleBasedAdmin: async (data: CreateRoleBasedAdminDto): Promise<AdminCreationResponse> => {
    const response = await apiClient.post<AdminCreationResponse>('/admin/users/create-role-admin', data);
    return response.data;
  },

  /**
   * تحديث صلاحيات أدمن موجود
   */
  updateAdminPermissions: async (adminId: string, data: { permissions: string[]; roles?: string[] }) => {
    const response = await apiClient.patch(`/admin/users/${adminId}/permissions`, data);
    return response.data;
  },

  /**
   * الحصول على قائمة الأدمن
   */
  getAdmins: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },

  /**
   * الحصول على تفاصيل أدمن
   */
  getAdminDetails: async (adminId: string) => {
    const response = await apiClient.get(`/admin/users/${adminId}`);
    return response.data;
  },

  /**
   * حذف أدمن
   */
  deleteAdmin: async (adminId: string) => {
    const response = await apiClient.delete(`/admin/users/${adminId}`);
    return response.data;
  },

  /**
   * تعليق أدمن
   */
  suspendAdmin: async (adminId: string, reason?: string) => {
    const response = await apiClient.post(`/admin/users/${adminId}/suspend`, { reason });
    return response.data;
  },

  /**
   * تفعيل أدمن
   */
  activateAdmin: async (adminId: string) => {
    const response = await apiClient.post(`/admin/users/${adminId}/activate`);
    return response.data;
  },
};
