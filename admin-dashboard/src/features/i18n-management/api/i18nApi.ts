import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/shared/types/common.types';

export interface Translation {
  id: string;
  key: string;
  ar: string;
  en: string;
  namespace: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: string;
}

export interface TranslationStats {
  totalTranslations: number;
  byNamespace: Record<string, number>;
  missingArabic: number;
  missingEnglish: number;
  arabicCompleteness: number;
  englishCompleteness: number;
  recentUpdates: Array<{
    key: string;
    updatedAt: Date;
    updatedBy: string;
  }>;
}

export const i18nApi = {
  /**
   * Get all translations
   */
  getTranslations: async (params?: {
    namespace?: string;
    search?: string;
    missingOnly?: boolean;
    missingLanguage?: 'ar' | 'en';
  }): Promise<Translation[]> => {
    const response = await apiClient.get<ApiResponse<Translation[]>>(
      '/i18n',
      { params }
    );
    return response.data.data;
  },

  /**
   * Get translation by key
   */
  getTranslationByKey: async (key: string): Promise<Translation> => {
    const response = await apiClient.get<ApiResponse<Translation>>(
      `/i18n/${key}`
    );
    return response.data.data;
  },

  /**
   * Create translation
   */
  createTranslation: async (data: {
    key: string;
    ar: string;
    en: string;
    namespace?: string;
    description?: string;
  }): Promise<Translation> => {
    const response = await apiClient.post<ApiResponse<Translation>>(
      '/i18n',
      data
    );
    return response.data.data;
  },

  /**
   * Update translation
   */
  updateTranslation: async (key: string, data: {
    ar?: string;
    en?: string;
    namespace?: string;
    description?: string;
  }): Promise<Translation> => {
    const response = await apiClient.put<ApiResponse<Translation>>(
      `/i18n/${key}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete translation
   */
  deleteTranslation: async (key: string): Promise<void> => {
    await apiClient.delete(`/i18n/${key}`);
  },

  /**
   * Get statistics
   */
  getStatistics: async (): Promise<TranslationStats> => {
    const response = await apiClient.get<ApiResponse<TranslationStats>>(
      '/i18n/statistics'
    );
    return response.data.data;
  },

  /**
   * Bulk import
   */
  bulkImport: async (data: {
    translations: Record<string, { ar: string; en: string; description?: string }>;
    namespace?: string;
    overwrite?: boolean;
  }) => {
    const response = await apiClient.post<ApiResponse<{
      imported: number;
      updated: number;
      skipped: number;
    }>>('/i18n/bulk-import', data);
    return response.data.data;
  },

  /**
   * Export translations
   */
  exportTranslations: async (params?: {
    namespace?: string;
    format?: 'json' | 'csv';
    language?: 'ar' | 'en' | 'both';
  }) => {
    const response = await apiClient.get<ApiResponse<{
      data: any;
      format: string;
    }>>('/i18n/export', { params });
    return response.data.data;
  },

  /**
   * Get public translations (for frontend use)
   */
  getPublicTranslations: async (lang: 'ar' | 'en', namespace?: string): Promise<Record<string, string>> => {
    const response = await apiClient.get<Record<string, string>>(
      `/i18n/public/translations/${lang}`,
      { params: { namespace } }
    );
    return response.data;
  },
};

