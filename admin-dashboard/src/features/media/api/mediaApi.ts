import { apiClient } from '@/core/api/client';
import type {
  Media,
  ListMediaParams,
  UploadMediaDto,
  UpdateMediaDto,
  MediaStats,
  UploadResponse,
} from '../types/media.types';
import type { PaginatedResponse } from '@/shared/types/common.types';

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

    const response = await apiClient.post<UploadResponse>('/admin/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * List media with pagination
   */
  list: async (params: ListMediaParams): Promise<PaginatedResponse<Media>> => {
    const response = await apiClient.get<PaginatedResponse<Media>>('/admin/media', {
      params,
    });
    return response.data;
  },

  /**
   * Get media by ID
   */
  getById: async (id: string): Promise<Media> => {
    const response = await apiClient.get<{ data: Media }>(`/admin/media/${id}`);
    return response.data.data;
  },

  /**
   * Update media
   */
  update: async (id: string, data: UpdateMediaDto): Promise<Media> => {
    const response = await apiClient.patch<{ data: Media }>(`/admin/media/${id}`, data);
    return response.data.data;
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
    const response = await apiClient.post<{ data: Media }>(`/admin/media/${id}/restore`);
    return response.data.data;
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
    const response = await apiClient.get<{ data: MediaStats }>('/admin/media/stats/summary');
    return response.data.data;
  },
};
