import { apiClient } from '@/core/api/client';
import type {
  Brand,
  ListBrandsParams,
  CreateBrandDto,
  UpdateBrandDto,
  BrandStats,
  BrandListResponse,
  BrandResponse,
} from '../types/brand.types';

// Brands API - متطابق تماماً مع Backend Endpoints
export const brandsApi = {
  // إنشاء علامة تجارية جديدة
  create: async (data: CreateBrandDto): Promise<Brand> => {
    const response = await apiClient.post<BrandResponse>('/admin/brands', data);
    if (!response.data.success) {
      throw new Error('فشل في إنشاء العلامة التجارية');
    }
    return response.data.data;
  },

  // قائمة العلامات التجارية مع الفلترة والبحث
  list: async (params: ListBrandsParams = {}): Promise<BrandListResponse> => {
    const response = await apiClient.get<BrandListResponse>('/admin/brands', { params });
    if (!response.data.success) {
      throw new Error('فشل في جلب قائمة العلامات التجارية');
    }
    return response.data;
  },

  // الحصول على علامة تجارية بالمعرف
  getById: async (id: string): Promise<Brand> => {
    const response = await apiClient.get<BrandResponse>(`/admin/brands/${id}`);
    if (!response.data.success) {
      throw new Error('فشل في جلب العلامة التجارية');
    }
    return response.data.data;
  },

  // تحديث علامة تجارية
  update: async (id: string, data: UpdateBrandDto): Promise<Brand> => {
    const response = await apiClient.patch<BrandResponse>(`/admin/brands/${id}`, data);
    if (!response.data.success) {
      throw new Error('فشل في تحديث العلامة التجارية');
    }
    return response.data.data;
  },

  // حذف علامة تجارية
  delete: async (id: string): Promise<void> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/admin/brands/${id}`
    );
    if (!response.data.success) {
      throw new Error('فشل في حذف العلامة التجارية');
    }
  },

  // تبديل حالة العلامة التجارية (تفعيل/إيقاف)
  toggleStatus: async (id: string): Promise<Brand> => {
    const response = await apiClient.patch<BrandResponse>(`/admin/brands/${id}/toggle-status`);
    if (!response.data.success) {
      throw new Error('فشل في تحديث حالة العلامة التجارية');
    }
    return response.data.data;
  },

  // إحصائيات العلامات التجارية
  getStats: async (): Promise<BrandStats> => {
    const response = await apiClient.get<{ success: true; data: BrandStats }>(
      '/admin/brands/stats'
    );
    if (!response.data.success) {
      throw new Error('فشل في جلب إحصائيات العلامات التجارية');
    }
    return response.data.data;
  },

  // البحث في العلامات التجارية (للاستخدام في Select components)
  search: async (query: string, limit: number = 10): Promise<Brand[]> => {
    const response = await apiClient.get<BrandListResponse>('/admin/brands', {
      params: {
        search: query,
        limit,
        isActive: true,
        sortBy: 'name',
        sortOrder: 'asc',
      },
    });
    if (!response.data.success) {
      throw new Error('فشل في البحث عن العلامات التجارية');
    }
    return response.data.data;
  },
};
