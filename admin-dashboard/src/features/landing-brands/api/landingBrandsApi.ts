import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/shared/types/common.types';
import type { LandingBrand, UpdateLandingBrandDto, ListLandingBrandsParams } from '../types/landing-brand.types';

export const landingBrandsApi = {
  list: async (params: ListLandingBrandsParams = {}): Promise<{ data: LandingBrand[]; meta: any }> => {
    const response = await apiClient.get<ApiResponse<{ brands: LandingBrand[]; pagination: any }>>('/admin/brands/landing', { params });
    return { data: response.data.data.brands, meta: response.data.data.pagination };
  },
  update: async (id: string, data: UpdateLandingBrandDto): Promise<LandingBrand> => {
    const response = await apiClient.patch<ApiResponse<LandingBrand>>(`/admin/brands/${id}/landing`, data);
    return response.data.data;
  },
};
