import { apiClient } from '@/core/api/client';
import { sanitizePaginationParams } from '@/shared/utils/formatters';
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
    const { data } = await apiClient.get('/admin/users', { params: sanitizePaginationParams(params) });
    return {
      data: data.data,
      meta: data.meta
    };
  },

  /**
   * Get user by ID
   */
  getById: async (id: string): Promise<User> => {
    const { data } = await apiClient.get<ApiResponse<{ data: User }>>(`/admin/users/${id}`);
    return data.data.data;
  },

  /**
   * Create new user
   */
  create: async (userData: CreateUserDto): Promise<User> => {
    const { data } = await apiClient.post<ApiResponse<{ data: User }>>('/admin/users', userData);
    return data.data.data;
  },

  /**
   * Update user
   */
  update: async (id: string, userData: UpdateUserDto): Promise<User> => {
    const { data } = await apiClient.patch<ApiResponse<{ data: User }>>(`/admin/users/${id}`, userData);
    return data.data.data;
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
    const { data } = await apiClient.post<ApiResponse<{ data: User }>>(
      `/admin/users/${id}/suspend`,
      suspendData
    );
    return data.data.data;
  },

  /**
   * Activate user
   */
  activate: async (id: string): Promise<User> => {
    const { data } = await apiClient.post<ApiResponse<{ data: User }>>(`/admin/users/${id}/activate`);
    return data.data.data;
  },

  /**
   * Restore deleted user
   */
  restore: async (id: string): Promise<User> => {
    const { data } = await apiClient.post<ApiResponse<{ data: User }>>(`/admin/users/${id}/restore`);
    return data.data.data;
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
    const { data } = await apiClient.get<ApiResponse<{ data: UserStats }>>('/admin/users/stats/summary');
    return data.data.data;
  },
};
