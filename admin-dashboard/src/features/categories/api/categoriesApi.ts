import { apiClient } from '@/core/api/client';
import type {
  Category,
  CategoryTreeNode,
  ListCategoriesParams,
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryStats,
} from '../types/category.types';
import type { ApiResponse } from '@/shared/types/common.types';

export const categoriesApi = {
  /**
   * Create category
   */
  create: async (data: CreateCategoryDto): Promise<Category> => {
    const response = await apiClient.post<ApiResponse<Category>>('/admin/categories', data);
    return response.data.data;
  },

  /**
   * List categories with filtering and search
   */
  list: async (params: ListCategoriesParams): Promise<Category[]> => {
    const response = await apiClient.get<ApiResponse<Category[]>>('/admin/categories', {
      params,
    });
    return response.data.data;
  },

  /**
   * Get category tree (hierarchical structure)
   */
  getTree: async (): Promise<CategoryTreeNode[]> => {
    const response = await apiClient.get<ApiResponse<CategoryTreeNode[]>>('/admin/categories/tree');
    return response.data.data;
  },

  /**
   * Get category by ID with full details
   */
  getById: async (id: string): Promise<Category> => {
    const response = await apiClient.get<ApiResponse<Category>>(`/admin/categories/${id}`);
    return response.data.data;
  },

  /**
   * Update category
   */
  update: async (id: string, data: UpdateCategoryDto): Promise<Category> => {
    const response = await apiClient.patch<ApiResponse<Category>>(`/admin/categories/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete category (soft delete)
   */
  delete: async (id: string): Promise<{ deleted: boolean; deletedAt: Date }> => {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean; deletedAt: Date }>>(
      `/admin/categories/${id}`
    );
    return response.data.data;
  },

  /**
   * Restore deleted category
   */
  restore: async (id: string): Promise<{ restored: boolean }> => {
    const response = await apiClient.post<ApiResponse<{ restored: boolean }>>(
      `/admin/categories/${id}/restore`
    );
    return response.data.data;
  },

  /**
   * Permanent delete category (Super Admin only)
   */
  permanentDelete: async (id: string): Promise<{ deleted: boolean; message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean; message: string }>>(
      `/admin/categories/${id}/permanent`
    );
    return response.data.data;
  },

  /**
   * Update category statistics
   */
  updateStats: async (
    id: string
  ): Promise<{ updated: boolean; productCount: number; updatedAt: Date }> => {
    const response = await apiClient.post<
      ApiResponse<{ updated: boolean; productCount: number; updatedAt: Date }>
    >(`/admin/categories/${id}/update-stats`);
    return response.data.data;
  },

  /**
   * Get category statistics summary
   */
  getStats: async (): Promise<CategoryStats> => {
    const response = await apiClient.get<ApiResponse<CategoryStats>>('/admin/categories/stats/summary');
    return response.data.data;
  },
};
