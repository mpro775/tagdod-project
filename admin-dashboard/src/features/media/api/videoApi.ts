import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/shared/types/common.types';

export interface VideoUploadResponse {
  videoId: string;
  guid: string;
  title: string;
  url: string;
  embedUrl?: string;
  hlsUrl?: string;
  mp4Url?: string;
  thumbnailUrl?: string;
  status: 'processing' | 'ready' | 'failed';
  duration?: number;
  size: number;
  mimeType: string;
}

export interface VideoUploadProgress {
  loaded: number;
  total: number;
  percent: number;
  speedBytesPerSec: number;
  etaSeconds: number;
}

export interface VideoInfo {
  id: string;
  title: string;
  guid: string;
  url: string;
  embedUrl?: string;
  hlsUrl?: string;
  mp4Url?: string;
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
  upload: async (
    file: File,
    title?: string,
    onProgress?: (progress: VideoUploadProgress) => void,
  ): Promise<VideoUploadResponse> => {
    const formData = new FormData();
    formData.append('video', file);
    if (title) {
      formData.append('title', title);
    }

    const startedAt = Date.now();
    const uploadTimeout = Number(import.meta.env.VITE_VIDEO_UPLOAD_TIMEOUT ?? 600000);

    const response = await apiClient.post<ApiResponse<VideoUploadResponse>>(
      '/upload/video',
      formData,
      {
        timeout: uploadTimeout,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (evt) => {
          if (!onProgress || !evt.total) return;
          const elapsedSeconds = Math.max((Date.now() - startedAt) / 1000, 0.001);
          const speedBytesPerSec = evt.loaded / elapsedSeconds;
          const remainingBytes = Math.max(evt.total - evt.loaded, 0);
          const etaSeconds = speedBytesPerSec > 0 ? remainingBytes / speedBytesPerSec : 0;

          onProgress({
            loaded: evt.loaded,
            total: evt.total,
            percent: Math.min(100, Math.max(0, Math.round((evt.loaded / evt.total) * 100))),
            speedBytesPerSec,
            etaSeconds,
          });
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
      `/upload/video/${videoId}`
    );
    return response.data.data;
  },

  /**
   * Delete video
   */
  delete: async (videoId: string): Promise<void> => {
    await apiClient.delete(`/upload/video/${videoId}`);
  },

  /**
   * List videos
   */
  list: async (page: number = 1, perPage: number = 20): Promise<VideoListResponse> => {
    const response = await apiClient.get<ApiResponse<VideoListResponse>>(
      '/upload/videos',
      {
        params: { page, perPage }
      }
    );
    return response.data.data;
  },
};
