import * as tus from 'tus-js-client';
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
  mediaId?: string;
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

export interface DirectUploadCredentials {
  videoId: string;
  guid: string;
  libraryId: string;
  tusEndpoint: string;
  signature: string;
  expire: number;
}

export const videoApi = {
  prepareDirectUpload: async (params: {
    title: string;
    fileSize: number;
    mimeType: string;
  }): Promise<DirectUploadCredentials> => {
    const response = await apiClient.post<ApiResponse<DirectUploadCredentials>>(
      '/upload/video/prepare-direct',
      params,
    );
    return response.data.data;
  },

  confirmDirectUpload: async (params: {
    videoId: string;
    guid: string;
    title: string;
    category?: string;
    mimeType?: string;
    size?: number;
  }): Promise<VideoUploadResponse> => {
    const response = await apiClient.post<ApiResponse<VideoUploadResponse>>(
      '/upload/video/confirm-direct',
      params,
    );
    return response.data.data;
  },

  uploadDirect: async (
    file: File,
    title: string,
    category: 'banner' | 'product' | 'category' | 'brand' | 'other' | undefined,
    onProgress?: (progress: VideoUploadProgress) => void,
  ): Promise<VideoUploadResponse> => {
    const credentials = await videoApi.prepareDirectUpload({
      title,
      fileSize: file.size,
      mimeType: file.type || 'video/mp4',
    });

    const startedAt = Date.now();

    await new Promise<void>((resolve, reject) => {
      const upload = new tus.Upload(file, {
        endpoint: credentials.tusEndpoint,
        chunkSize: 5 * 1024 * 1024,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        metadata: {
          filetype: file.type || 'video/mp4',
          title: title,
        },
        headers: {
          AuthorizationSignature: credentials.signature,
          AuthorizationExpire: String(credentials.expire),
          VideoId: credentials.videoId,
          LibraryId: String(credentials.libraryId),
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          if (!onProgress) return;
          const elapsedSeconds = Math.max((Date.now() - startedAt) / 1000, 0.001);
          const speedBytesPerSec = bytesUploaded / elapsedSeconds;
          const remainingBytes = Math.max(bytesTotal - bytesUploaded, 0);
          const etaSeconds = speedBytesPerSec > 0 ? remainingBytes / speedBytesPerSec : 0;

          onProgress({
            loaded: bytesUploaded,
            total: bytesTotal,
            percent: Math.min(100, Math.max(0, Math.round((bytesUploaded / bytesTotal) * 100))),
            speedBytesPerSec,
            etaSeconds,
          });
        },
        onSuccess: () => {
          resolve();
        },
        onError: (error) => {
          reject(error);
        },
      });

      upload.start();
    });

    const result = await videoApi.confirmDirectUpload({
      videoId: credentials.videoId,
      guid: credentials.guid,
      title,
      category,
      mimeType: file.type || 'video/mp4',
      size: file.size,
    });

    return result;
  },

  upload: async (
    file: File,
    title?: string,
    category?: 'banner' | 'product' | 'category' | 'brand' | 'other',
    onProgress?: (progress: VideoUploadProgress) => void,
  ): Promise<VideoUploadResponse> => {
    const formData = new FormData();
    formData.append('video', file);
    if (title) {
      formData.append('title', title);
    }
    if (category) {
      formData.append('category', category);
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
