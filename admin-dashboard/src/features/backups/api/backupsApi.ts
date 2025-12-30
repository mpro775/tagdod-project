import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/shared/types/common.types';

export interface Backup {
  _id: string;
  name: string;
  filename: string;
  localPath?: string;
  bunnyPath?: string;
  bunnyUrl?: string;
  size: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  type: 'full' | 'incremental';
  errorMessage?: string;
  createdBy?: string;
  isAutomatic: boolean;
  scheduledAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface BackupStats {
  total: number;
  completed: number;
  failed: number;
  totalSize: number;
  lastBackup?: string;
}

export interface BackupsResponse {
  backups: Backup[];
  pagination: {
    total: number;
    limit: number;
    skip: number;
  };
}

export const backupsApi = {
  /**
   * إنشاء نسخة احتياطية يدوياً
   */
  createBackup: async (): Promise<Backup> => {
    const response = await apiClient.post<ApiResponse<Backup>>('/backups');
    return response.data.data;
  },

  /**
   * الحصول على جميع النسخ الاحتياطية
   */
  getAllBackups: async (limit = 50, skip = 0): Promise<BackupsResponse> => {
    const response = await apiClient.get<ApiResponse<{
      message: string;
      data: Backup[];
      pagination: { total: number; limit: number; skip: number };
    }>>(
      '/backups',
      { params: { limit, skip } }
    );
    // Backend يرجع { message, data, pagination } داخل response.data.data
    const backendResponse = response.data.data;
    return {
      backups: backendResponse.data || [],
      pagination: backendResponse.pagination || { total: 0, limit, skip },
    };
  },

  /**
   * الحصول على إحصائيات النسخ الاحتياطي
   */
  getStats: async (): Promise<BackupStats> => {
    const response = await apiClient.get<ApiResponse<{
      message: string;
      data: BackupStats;
    }>>('/backups/stats');
    // Backend يرجع { message, data } داخل response.data.data
    const backendResponse = response.data.data;
    return backendResponse.data;
  },

  /**
   * الحصول على نسخة احتياطية واحدة
   */
  getBackup: async (id: string): Promise<Backup> => {
    const response = await apiClient.get<ApiResponse<Backup>>(`/backups/${id}`);
    return response.data.data;
  },

  /**
   * تحميل نسخة احتياطية
   */
  downloadBackup: async (id: string, filename: string): Promise<void> => {
    const response = await apiClient.get(`/backups/${id}/download`, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * استعادة قاعدة البيانات
   */
  restoreBackup: async (id: string): Promise<void> => {
    await apiClient.post(`/backups/${id}/restore`);
  },

  /**
   * حذف نسخة احتياطية
   */
  deleteBackup: async (id: string): Promise<void> => {
    await apiClient.delete(`/backups/${id}`);
  },
};

