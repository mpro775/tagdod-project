import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/shared/types/common.types';
import type {
  Brand,
  ListBrandsParams,
  CreateBrandDto,
  UpdateBrandDto,
  BrandStats,
} from '../types/brand.types';

// Helper function to extract nested data from API response
function extractData<T>(response: any): T {
  const outer = response?.data;
  if (outer && typeof outer === 'object') {
    if (Array.isArray(outer)) {
      return outer as T;
    }

    if ('data' in outer) {
      return extractData<T>({ data: outer.data });
    }
  }

  return outer as T;
}

// Brands API - متطابق تماماً مع Backend Endpoints
export const brandsApi = {
  // إنشاء علامة تجارية جديدة
  create: async (data: CreateBrandDto): Promise<Brand> => {
    const response = await apiClient.post<ApiResponse<Brand>>('/admin/brands', data);
    return response.data.data;
  },

  // قائمة العلامات التجارية مع الفلترة والبحث
  list: async (params: ListBrandsParams = {}): Promise<{ data: Brand[]; meta: any }> => {
    const response = await apiClient.get<ApiResponse<{ brands: Brand[]; pagination: any }>>('/admin/brands', { params });
    return {
      data: response.data.data.brands,
      meta: response.data.data.pagination,
    };
  },

  // الحصول على علامة تجارية بالمعرف
  getById: async (id: string): Promise<Brand> => {
    const response = await apiClient.get<ApiResponse<Brand>>(`/admin/brands/${id}`);
    return response.data.data;
  },

  // تحديث علامة تجارية
  update: async (id: string, data: UpdateBrandDto): Promise<Brand> => {
    const response = await apiClient.patch<ApiResponse<Brand>>(`/admin/brands/${id}`, data);
    return response.data.data;
  },

  // حذف علامة تجارية
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/brands/${id}`);
  },

  // تبديل حالة العلامة التجارية (تفعيل/إيقاف)
  toggleStatus: async (id: string): Promise<Brand> => {
    const response = await apiClient.patch<ApiResponse<Brand>>(`/admin/brands/${id}/toggle-status`);
    return response.data.data;
  },

  // إحصائيات العلامات التجارية
  getStats: async (): Promise<BrandStats> => {
    const response = await apiClient.get<ApiResponse<BrandStats>>(
      '/admin/brands/stats/summary'
    );
    return extractData<BrandStats>(response);
  },

  // البحث في العلامات التجارية (للاستخدام في Select components)
  search: async (query: string, limit: number = 10): Promise<Brand[]> => {
    const response = await apiClient.get<ApiResponse<{ brands: Brand[]; pagination: any }>>('/admin/brands', {
      params: {
        search: query,
        limit,
        isActive: true,
        sortBy: 'name',
        sortOrder: 'asc',
      },
    });
    return response.data.data.brands;
  },
};
