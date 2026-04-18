import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/shared/types/common.types';
import type {
  CreateTejoPromptRequest,
  TejoAnalyticsSummary,
  TejoConversation,
  TejoKnowledge,
  TejoKnowledgeList,
  TejoPrompt,
  TejoSettings,
  UpdateTejoKnowledgeRequest,
  UpdateTejoPromptRequest,
} from '../types/tejo.types';

export const tejoApi = {
  getPrompts: async (): Promise<TejoPrompt[]> => {
    const response = await apiClient.get<ApiResponse<TejoPrompt[]>>('/admin/tejo/prompts');
    return response.data.data;
  },

  createPrompt: async (payload: CreateTejoPromptRequest): Promise<TejoPrompt> => {
    const response = await apiClient.post<ApiResponse<TejoPrompt>>('/admin/tejo/prompts', payload);
    return response.data.data;
  },

  updatePrompt: async (id: string, payload: UpdateTejoPromptRequest): Promise<TejoPrompt> => {
    const response = await apiClient.patch<ApiResponse<TejoPrompt>>(`/admin/tejo/prompts/${id}`, payload);
    return response.data.data;
  },

  triggerReindex: async (scope: 'products' | 'kb' | 'all', full: boolean) => {
    const response = await apiClient.post<ApiResponse<{ jobId: string }>>('/admin/tejo/reindex', {
      scope,
      full,
    });
    return response.data.data;
  },

  getAnalyticsOverview: async (): Promise<TejoAnalyticsSummary> => {
    const response = await apiClient.get<ApiResponse<TejoAnalyticsSummary>>('/admin/tejo/analytics/overview');
    return response.data.data;
  },

  getAnalyticsQuality: async (): Promise<Record<string, number>> => {
    const response = await apiClient.get<ApiResponse<Record<string, number>>>('/admin/tejo/analytics/quality');
    return response.data.data;
  },

  getAnalyticsVolume: async (): Promise<Record<string, number>> => {
    const response = await apiClient.get<ApiResponse<Record<string, number>>>('/admin/tejo/analytics/volume');
    return response.data.data;
  },

  getConversations: async (page = 1, limit = 20): Promise<{
    data: TejoConversation[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const response = await apiClient.get<ApiResponse<{
      data: TejoConversation[];
      total: number;
      page: number;
      totalPages: number;
    }>>('/admin/tejo/conversations', {
      params: { page, limit },
    });

    return response.data.data;
  },

  getConversationById: async (id: string): Promise<TejoConversation> => {
    const response = await apiClient.get<ApiResponse<TejoConversation>>(`/admin/tejo/conversations/${id}`);
    return response.data.data;
  },

  getKnowledge: async (page = 1, limit = 20, q?: string): Promise<TejoKnowledgeList> => {
    const response = await apiClient.get<ApiResponse<TejoKnowledgeList>>('/admin/tejo/knowledge', {
      params: { page, limit, q },
    });
    return response.data.data;
  },

  getKnowledgeByKey: async (key: string): Promise<TejoKnowledge> => {
    const response = await apiClient.get<ApiResponse<TejoKnowledge>>(`/admin/tejo/knowledge/${key}`);
    return response.data.data;
  },

  createKnowledge: async (payload: {
    key: string;
    text: string;
    locale?: string;
    metadata?: Record<string, unknown>;
  }): Promise<TejoKnowledge> => {
    const response = await apiClient.post<ApiResponse<TejoKnowledge>>('/admin/tejo/knowledge', payload);
    return response.data.data;
  },

  updateKnowledge: async (key: string, payload: UpdateTejoKnowledgeRequest): Promise<TejoKnowledge> => {
    const response = await apiClient.patch<ApiResponse<TejoKnowledge>>(`/admin/tejo/knowledge/${key}`, payload);
    return response.data.data;
  },

  deleteKnowledge: async (key: string): Promise<{ deleted: boolean }> => {
    const response = await apiClient.post<ApiResponse<{ deleted: boolean }>>(`/admin/tejo/knowledge/${key}/delete`);
    return response.data.data;
  },

  getSettings: async (): Promise<TejoSettings> => {
    const response = await apiClient.get<ApiResponse<TejoSettings>>('/admin/tejo/settings');
    return response.data.data;
  },

  updateSettings: async (payload: {
    enabled?: boolean;
    webPilotEnabled?: boolean;
    providerOrder?: string[];
    threshold?: number;
    geminiApiKey?: string;
    geminiChatModel?: string;
    geminiEmbeddingModel?: string;
    geminiBaseUrl?: string;
  }): Promise<TejoSettings> => {
    const response = await apiClient.patch<ApiResponse<TejoSettings>>('/admin/tejo/settings', payload);
    return response.data.data;
  },
};
