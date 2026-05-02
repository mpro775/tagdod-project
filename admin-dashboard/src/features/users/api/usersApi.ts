import { apiClient } from '@/core/api/client';
import { sanitizePaginationParams } from '@/shared/utils/formatters';
import type {
  User,
  ListUsersParams,
  CreateUserDto,
  UpdateUserDto,
  SuspendUserDto,
  UserStats,
  DeletedUser,
} from '../types/user.types';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/common.types';

export interface ExportResult {
  success: boolean;
  data: {
    fileUrl: string;
    format: string;
    exportedAt: string;
    fileName: string;
    recordCount: number;
    fields?: string[];
    error?: string;
  };
}

const extractFileName = (contentDisposition?: string): string => {
  if (!contentDisposition) {
    return `user_names_${Date.now()}.csv`;
  }

  const utf8NameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8NameMatch?.[1]) {
    try {
      return decodeURIComponent(utf8NameMatch[1]);
    } catch {
      return utf8NameMatch[1];
    }
  }

  const quotedNameMatch = contentDisposition.match(/filename="([^"]+)"/i);
  if (quotedNameMatch?.[1]) {
    return quotedNameMatch[1];
  }

  const bareNameMatch = contentDisposition.match(/filename=([^;]+)/i);
  if (bareNameMatch?.[1]) {
    return bareNameMatch[1].trim();
  }

  return `user_names_${Date.now()}.csv`;
};

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
   * Get user IDs only (for "select all" in bulk notifications)
   */
  listIds: async (params: ListUsersParams): Promise<string[]> => {
    const { data } = await apiClient.get<ApiResponse<{ ids: string[] }>>('/admin/users/ids', {
      params: sanitizePaginationParams(params),
    });
    return data.data.ids;
  },

  /**
   * Export users first and last names as CSV
   */
  exportNamesCsv: async (
    params: ListUsersParams,
  ): Promise<{ blob: Blob; fileName: string }> => {
    const response = await apiClient.get<Blob>('/admin/users/export/names', {
      params: sanitizePaginationParams(params),
      responseType: 'blob',
    });

    const contentDisposition = response.headers['content-disposition'] as string | undefined;

    return {
      blob: response.data,
      fileName: extractFileName(contentDisposition),
    };
  },

  exportUsers: async (
    params: ListUsersParams,
    fields: string[],
    format: 'xlsx' | 'excel' | 'csv' = 'xlsx',
  ): Promise<ExportResult> => {
    const { data } = await apiClient.get<ApiResponse<ExportResult> | ExportResult>(
      '/admin/users/export',
      {
        params: {
          ...sanitizePaginationParams(params),
          format,
          fields: fields.join(','),
        },
      },
    );

    const payload = 'data' in data ? (data as ApiResponse<ExportResult>).data : data;
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return payload as ExportResult;
    }
    return { success: true, data: payload as ExportResult['data'] };
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

  /**
   * Get deleted users with deletion reason
   */
  getDeletedUsers: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<DeletedUser>> => {
    const { data } = await apiClient.get<ApiResponse<{
      deletedUsers: DeletedUser[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    }>>('/admin/users/deleted', {
      params: sanitizePaginationParams(params),
    });
    return {
      data: data.data.deletedUsers,
      meta: {
        page: data.data.pagination.page,
        limit: data.data.pagination.limit,
        total: data.data.pagination.total,
        totalPages: data.data.pagination.totalPages,
      },
    };
  },

  /**
   * Update engineer status
   */
  updateEngineerStatus: async (
    id: string,
    status: string,
  ): Promise<{ success: boolean; message: string }> => {
    const { data } = await apiClient.patch<ApiResponse<{
      success: boolean;
      message: string;
      data: {
        userId: string;
        engineerStatus: string;
        engineerCapable: boolean;
        roles: string[];
      };
    }>>(`/admin/users/${id}/engineer-status`, { status });
    return {
      success: data.data.success,
      message: data.data.message,
    };
  },

  /**
   * Update merchant status
   */
  updateMerchantStatus: async (
    id: string,
    status: string,
    merchantDiscountPercent?: number,
  ): Promise<{ success: boolean; message: string }> => {
    const { data } = await apiClient.patch<ApiResponse<{
      success: boolean;
      message: string;
      data: {
        userId: string;
        merchantStatus: string;
        merchantCapable: boolean;
        merchantDiscountPercent: number;
        roles: string[];
      };
    }>>(`/admin/users/${id}/merchant-status`, { 
      status,
      merchantDiscountPercent,
    });
    return {
      success: data.data.success,
      message: data.data.message,
    };
  },

  /**
   * Reset user password (Admin)
   */
  resetPassword: async (
    id: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> => {
    const { data } = await apiClient.post<ApiResponse<{
      success: boolean;
      message: string;
      data: {
        userId: string;
        phone: string;
        resetAt: Date;
        resetBy: string;
      };
    }>>(`/admin/users/${id}/reset-password`, { newPassword });
    return {
      success: data.data.success,
      message: data.data.message,
    };
  },
};
