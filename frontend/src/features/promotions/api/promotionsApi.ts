import { apiClient } from '@/core/api/client';
import type { PriceRule, ListPriceRulesParams, CreatePriceRuleDto, UpdatePriceRuleDto } from '../types/promotion.types';

export const promotionsApi = {
  create: async (data: CreatePriceRuleDto): Promise<PriceRule> => {
    const response = await apiClient.post<{ success: boolean; data: PriceRule }>('/admin/promotions', data);
    return response.data.data;
  },

  list: async (params: ListPriceRulesParams = {}): Promise<PriceRule[]> => {
    const response = await apiClient.get<{ success: boolean; data: PriceRule[] }>('/admin/promotions', { params });
    return response.data.data;
  },

  getById: async (id: string): Promise<PriceRule> => {
    const response = await apiClient.get<{ success: boolean; data: PriceRule }>(`/admin/promotions/${id}`);
    return response.data.data;
  },

  update: async (id: string, data: UpdatePriceRuleDto): Promise<PriceRule> => {
    const response = await apiClient.patch<{ success: boolean; data: PriceRule }>(`/admin/promotions/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/promotions/${id}`);
  },

  toggleStatus: async (id: string): Promise<PriceRule> => {
    const response = await apiClient.patch<{ success: boolean; data: PriceRule }>(`/admin/promotions/${id}/toggle`);
    return response.data.data;
  },
};

