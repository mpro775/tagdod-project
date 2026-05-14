import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/shared/types/common.types';
import type { Article, CreateArticleDto, UpdateArticleDto, ListArticlesParams } from '../types/article.types';

export const articlesApi = {
  create: async (data: CreateArticleDto): Promise<Article> => {
    const response = await apiClient.post<ApiResponse<Article>>('/admin/articles', data);
    return response.data.data;
  },
  list: async (params: ListArticlesParams = {}): Promise<{ data: Article[]; meta: any }> => {
    const response = await apiClient.get<ApiResponse<{ articles: Article[]; pagination: any }>>('/admin/articles', { params });
    return { data: response.data.data.articles, meta: response.data.data.pagination };
  },
  getById: async (id: string): Promise<Article> => {
    const response = await apiClient.get<ApiResponse<Article>>(`/admin/articles/${id}`);
    return response.data.data;
  },
  update: async (id: string, data: UpdateArticleDto): Promise<Article> => {
    const response = await apiClient.patch<ApiResponse<Article>>(`/admin/articles/${id}`, data);
    return response.data.data;
  },
  delete: async (id: string): Promise<void> => { await apiClient.delete(`/admin/articles/${id}`); },
  publish: async (id: string): Promise<Article> => {
    const response = await apiClient.patch<ApiResponse<Article>>(`/admin/articles/${id}/publish`);
    return response.data.data;
  },
  archive: async (id: string): Promise<Article> => {
    const response = await apiClient.patch<ApiResponse<Article>>(`/admin/articles/${id}/archive`);
    return response.data.data;
  },
  toggleLanding: async (id: string): Promise<Article> => {
    const response = await apiClient.patch<ApiResponse<Article>>(`/admin/articles/${id}/toggle-landing`);
    return response.data.data;
  },
  toggleFeatured: async (id: string): Promise<Article> => {
    const response = await apiClient.patch<ApiResponse<Article>>(`/admin/articles/${id}/toggle-featured`);
    return response.data.data;
  },
};
