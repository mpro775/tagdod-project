import { apiClient } from '@/core/api/client';
import type {
  Brand,
  ListBrandsParams,
  CreateBrandDto,
  UpdateBrandDto,
  BrandStats,
} from '../types/brand.types';
import type { ApiResponse } from '@/shared/types/common.types';

export const brandsApi = {
  create: async (data: CreateBrandDto): Promise<Brand> => {
    const response = await apiClient.post<ApiResponse<Brand>>('/admin/brands', data);
    return response.data.data;
  },

  list: async (params: ListBrandsParams = {}): Promise<Brand[]> => {
    const response = await apiClient.get<ApiResponse<Brand[]>>('/admin/brands', { params });
    return response.data.data;
  },

  getById: async (id: string): Promise<Brand> => {
    const response = await apiClient.get<ApiResponse<Brand>>(`/admin/brands/${id}`);
    return response.data.data;
  },

  update: async (id: string, data: UpdateBrandDto): Promise<Brand> => {
    const response = await apiClient.patch<ApiResponse<Brand>>(`/admin/brands/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/brands/${id}`);
  },

  toggleStatus: async (id: string): Promise<Brand> => {
    const response = await apiClient.patch<ApiResponse<Brand>>(
      `/admin/brands/${id}/toggle-status`
    );
    return response.data.data;
  },

  getStats: async (): Promise<BrandStats> => {
    const response = await apiClient.get<ApiResponse<BrandStats>>('/admin/brands/stats');
    return response.data.data;
  },
};

