import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/shared/types/common.types';

export interface VideoUploadResponse {
  videoId: string;
  guid: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  status: 'processing' | 'ready' | 'failed';
  duration?: number;
  size: number;
  mimeType: string;
}

export interface VideoInfo {
  id: string;
  title: string;
  guid: string;
  url: string;
  thumbnailUrl?: string;
  status: 'processing' | 'ready' | 'failed';
  duration?: number;
  width?: number;
  height?: number;
  fps?: number;
  bitrate?: number;
  size?: number;
  uploadedAt?: string;
}

export interface VideoListResponse {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  items: VideoInfo[];
}

export const videoApi = {
  /**
   * Upload video to Bunny Stream
   */
  upload: async (file: File, title?: string): Promise<VideoUploadResponse> => {
    const formData = new FormData();
    formData.append('video', file);
    if (title) {
      formData.append('title', title);
    }

    const response = await apiClient.post<ApiResponse<VideoUploadResponse>>(
      '/admin/upload/video',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  /**
   * Get video information
   */
  getInfo: async (videoId: string): Promise<VideoInfo> => {
    const response = await apiClient.get<ApiResponse<VideoInfo>>(
      `/admin/upload/video/${videoId}`
    );
    return response.data.data;
  },

  /**
   * Delete video
   */
  delete: async (videoId: string): Promise<void> => {
    await apiClient.delete(`/admin/upload/video/${videoId}`);
  },

  /**
   * List videos
   */
  list: async (page: number = 1, perPage: number = 20): Promise<VideoListResponse> => {
    const response = await apiClient.get<ApiResponse<VideoListResponse>>(
      '/admin/upload/videos',
      {
        params: { page, perPage }
      }
    );
    return response.data.data;
  },
};
