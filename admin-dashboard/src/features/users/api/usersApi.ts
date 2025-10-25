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
    const { data } = await apiClient.get<ApiResponse<{
      users: User[];
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    }>>('/admin/users', {
      params: sanitizePaginationParams(params),
    });
    return {
      data: data.data.users,
      meta: {
        page: data.data.page,
        limit: data.data.limit,
        total: data.data.total,
        totalPages: data.data.totalPages,
      },
    };
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
    const { data } = await apiClient.patch<ApiResponse<User>>(
      `/admin/users/${id}`,
      userData
    );
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
  suspend: async (id: string, suspendData?: SuspendUserDto) => {
    const { data } = await apiClient.post<ApiResponse<{
      id: string;
      status: string;
      suspended: boolean;
    }>>(
      `/admin/users/${id}/suspend`,
      suspendData
    );
    return data.data;
  },

  /**
   * Activate user
   */
  activate: async (id: string) => {
    const { data } = await apiClient.post<ApiResponse<{
      id: string;
      status: string;
      activated: boolean;
    }>>(
      `/admin/users/${id}/activate`
    );
    return data.data;
  },

  /**
   * Restore deleted user
   */
  restore: async (id: string) => {
    const { data } = await apiClient.post<ApiResponse<{
      id: string;
      restored: boolean;
    }>>(
      `/admin/users/${id}/restore`
    );
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
    const { data } = await apiClient.get<ApiResponse<UserStats>>(
      '/admin/users/stats/summary'
    );
    return data.data;
  },
};
