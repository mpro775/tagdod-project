import { apiClient } from '@/core/api/client';
import { unwrapApiData } from '@/core/api/response';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/common.types';
import type {
  Media,
  ListMediaParams,
  UploadMediaDto,
  UpdateMediaDto,
  MediaStats,
  UploadResponse,
  CleanupResponse,
  MediaUsageUpdate,
  MediaWithUser,
  BulkMediaOperation,
} from '../types/media.types';

const unwrapNestedData = <T>(payload: unknown): T => {
  const value = unwrapApiData<T | { data: T }>(payload);
  return value && typeof value === 'object' && 'data' in value
    ? (value as { data: T }).data
    : (value as T);
};

export const mediaApi = {
  /**
   * Upload media file
   */
  upload: async (file: File, data: UploadMediaDto): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', data.name);
    formData.append('category', data.category);
    if (data.description) formData.append('description', data.description);
    if (data.tags && Array.isArray(data.tags)) {
      data.tags.forEach((tag, index) => {
        formData.append(`tags[${index}]`, tag);
      });
    }
    if (data.isPublic !== undefined) formData.append('isPublic', String(data.isPublic));

    const response = await apiClient.post<ApiResponse<UploadResponse>>('/admin/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return unwrapApiData<UploadResponse>(response.data);
  },

  /**
   * List media with pagination
   */
  list: async (params: ListMediaParams): Promise<PaginatedResponse<Media>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Media>>>('/admin/media', {
      params,
    });
    return unwrapApiData<PaginatedResponse<Media>>(response.data, { data: [], meta: {
      page: params.page || 1,
      limit: params.limit || 24,
      total: 0,
      totalPages: 0,
    } });
  },

  /**
   * Get media by ID
   */
  getById: async (id: string): Promise<Media> => {
    const response = await apiClient.get<ApiResponse<Media>>(`/admin/media/${id}`);
    return unwrapNestedData<Media>(response.data);
  },

  /**
   * Update media
   */
  update: async (id: string, data: UpdateMediaDto): Promise<Media> => {
    const response = await apiClient.patch<ApiResponse<Media>>(`/admin/media/${id}`, data);
    return unwrapNestedData<Media>(response.data);
  },

  /**
   * Delete media (soft delete)
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/media/${id}`);
  },

  /**
   * Restore deleted media
   */
  restore: async (id: string): Promise<Media> => {
    const response = await apiClient.post<ApiResponse<Media>>(`/admin/media/${id}/restore`);
    return unwrapNestedData<Media>(response.data);
  },

  /**
   * Permanent delete (Super Admin only)
   */
  permanentDelete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/media/${id}/permanent`);
  },

  /**
   * Get media statistics
   */
  getStats: async (): Promise<MediaStats> => {
    const response = await apiClient.get('/admin/media/stats/summary');
    return unwrapNestedData<MediaStats>(response.data);
  },

  /**
   * Update media usage count
   */
  updateUsage: async (data: MediaUsageUpdate): Promise<void> => {
    await apiClient.post('/admin/media/usage', data);
  },

  /**
   * Bulk operations on media
   */
  bulkOperation: async (data: BulkMediaOperation): Promise<{ success: boolean; affected: number }> => {
    const response = await apiClient.post<ApiResponse<{ success: boolean; affected: number }>>('/admin/media/bulk', data);
    return unwrapApiData<{ success: boolean; affected: number }>(response.data);
  },

  /**
   * Cleanup deleted files (Super Admin only)
   */
  cleanupDeleted: async (): Promise<CleanupResponse> => {
    const response = await apiClient.post<ApiResponse<CleanupResponse>>('/admin/media/cleanup/deleted');
    return unwrapApiData<CleanupResponse>(response.data);
  },

  /**
   * Cleanup duplicate files (Super Admin only)
   */
  cleanupDuplicates: async (): Promise<CleanupResponse> => {
    const response = await apiClient.post<ApiResponse<CleanupResponse>>('/admin/media/cleanup/duplicates');
    return unwrapApiData<CleanupResponse>(response.data);
  },

  /**
   * Cleanup unused files (Super Admin only)
   */
  cleanupUnused: async (days?: number): Promise<CleanupResponse> => {
    const response = await apiClient.post<ApiResponse<CleanupResponse>>('/admin/media/cleanup/unused', null, {
      params: days ? { days } : {},
    });
    return unwrapApiData<CleanupResponse>(response.data);
  },

  /**
   * Get media with user information
   */
  getMediaWithUser: async (id: string): Promise<MediaWithUser> => {
    const response = await apiClient.get<ApiResponse<MediaWithUser>>(`/admin/media/${id}/with-user`);
    return unwrapNestedData<MediaWithUser>(response.data);
  },
};
