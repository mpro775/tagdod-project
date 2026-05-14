import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/shared/types/common.types';
import type { LandingProduct, UpdateLandingProductDto, ListLandingProductsParams } from '../types/landing-product.types';

export const landingProductsApi = {
  list: async (params: ListLandingProductsParams = {}): Promise<{ data: LandingProduct[]; meta: any }> => {
    const response = await apiClient.get<ApiResponse<{ products: LandingProduct[]; pagination: any }>>('/admin/products/landing', { params });
    return { data: response.data.data.products, meta: response.data.data.pagination };
  },
  update: async (id: string, data: UpdateLandingProductDto): Promise<LandingProduct> => {
    const response = await apiClient.patch<ApiResponse<LandingProduct>>(`/admin/products/${id}/landing`, data);
    return response.data.data;
  },
};
