import { apiClient } from '@/core/api/client';
import type {
  User,
  ListUsersParams,
  CreateUserDto,
  UpdateUserDto,
  SuspendUserDto,
  UserStats,
} from '../types/user.types';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/common.types';

export const usersApi = {
  /**
   * Get list of users
   */
  list: async (params: ListUsersParams): Promise<PaginatedResponse<User>> => {
    const { data } = await apiClient.get('/admin/users', { params });
    return data;
  },

  /**
   * Get user by ID
   */
  getById: async (id: string): Promise<User> => {
    const { data } = await apiClient.get<ApiResponse<User>>(`/admin/users/${id}`);
    return data.data;
  },

  /**
   * Create new user
   */
  create: async (userData: CreateUserDto): Promise<User> => {
    const { data } = await apiClient.post<ApiResponse<User>>('/admin/users', userData);
    return data.data;
  },

  /**
   * Update user
   */
  update: async (id: string, userData: UpdateUserDto): Promise<User> => {
    const { data } = await apiClient.patch<ApiResponse<User>>(`/admin/users/${id}`, userData);
    return data.data;
  },

  /**
   * Delete user (soft delete)
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${id}`);
  },

  /**
   * Suspend user
   */
  suspend: async (id: string, suspendData?: SuspendUserDto): Promise<User> => {
    const { data } = await apiClient.post<ApiResponse<User>>(
      `/admin/users/${id}/suspend`,
      suspendData
    );
    return data.data;
  },

  /**
   * Activate user
   */
  activate: async (id: string): Promise<User> => {
    const { data } = await apiClient.post<ApiResponse<User>>(`/admin/users/${id}/activate`);
    return data.data;
  },

  /**
   * Restore deleted user
   */
  restore: async (id: string): Promise<User> => {
    const { data } = await apiClient.post<ApiResponse<User>>(`/admin/users/${id}/restore`);
    return data.data;
  },

  /**
   * Permanently delete user
   */
  permanentDelete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${id}/permanent`);
  },

  /**
   * Get user statistics
   */
  getStats: async (): Promise<UserStats> => {
    const { data } = await apiClient.get<ApiResponse<UserStats>>('/admin/users/stats/summary');
    return data.data;
  },

  /**
   * Assign role to user
   */
  assignRole: async (id: string, role: string): Promise<User> => {
    const { data } = await apiClient.post<ApiResponse<User>>(`/admin/users/${id}/assign-role`, {
      role,
    });
    return data.data;
  },

  /**
   * Remove role from user
   */
  removeRole: async (id: string, role: string): Promise<User> => {
    const { data } = await apiClient.post<ApiResponse<User>>(`/admin/users/${id}/remove-role`, {
      role,
    });
    return data.data;
  },

  /**
   * Add permission to user
   */
  addPermission: async (id: string, permission: string): Promise<User> => {
    const { data } = await apiClient.post<ApiResponse<User>>(`/admin/users/${id}/add-permission`, {
      permission,
    });
    return data.data;
  },

  /**
   * Remove permission from user
   */
  removePermission: async (id: string, permission: string): Promise<User> => {
    const { data } = await apiClient.post<ApiResponse<User>>(
      `/admin/users/${id}/remove-permission`,
      { permission }
    );
    return data.data;
  },
};
