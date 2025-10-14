import { apiClient } from '@/core/api/client';
import type {
  Category,
  CategoryTreeNode,
  ListCategoriesParams,
  CreateCategoryDto,
  UpdateCategoryDto,
  ReorderCategoriesDto,
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
   * List categories
   */
  list: async (params: ListCategoriesParams): Promise<Category[]> => {
    const response = await apiClient.get<ApiResponse<Category[]>>('/admin/categories', {
      params,
    });
    return response.data.data;
  },

  /**
   * Get category tree
   */
  getTree: async (): Promise<CategoryTreeNode[]> => {
    const response = await apiClient.get<ApiResponse<CategoryTreeNode[]>>(
      '/admin/categories/tree'
    );
    return response.data.data;
  },

  /**
   * Get category by ID
   */
  getById: async (id: string): Promise<Category> => {
    const response = await apiClient.get<ApiResponse<Category>>(
      `/admin/categories/${id}`
    );
    return response.data.data;
  },

  /**
   * Update category
   */
  update: async (id: string, data: UpdateCategoryDto): Promise<Category> => {
    const response = await apiClient.patch<ApiResponse<Category>>(
      `/admin/categories/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete category (soft delete)
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/categories/${id}`);
  },

  /**
   * Restore deleted category
   */
  restore: async (id: string): Promise<Category> => {
    const response = await apiClient.post<ApiResponse<Category>>(
      `/admin/categories/${id}/restore`
    );
    return response.data.data;
  },

  /**
   * Reorder categories
   */
  reorder: async (data: ReorderCategoriesDto): Promise<void> => {
    await apiClient.post('/admin/categories/reorder', data);
  },

  /**
   * Get category statistics
   */
  getStats: async (): Promise<CategoryStats> => {
    const response = await apiClient.get<ApiResponse<CategoryStats>>(
      '/admin/categories/stats'
    );
    return response.data.data;
  },
};

