import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/shared/types/common.types';
import type {
  Policy,
  PolicyType,
  UpdatePolicyDto,
  TogglePolicyDto,
} from '../types/policy.types';

export const policiesApi = {
  /**
   * Get all policies (Admin)
   */
  getAll: async (): Promise<Policy[]> => {
    const response = await apiClient.get<ApiResponse<Policy[]>>('/admin/policies');
    return response.data.data;
  },

  /**
   * Get policy by type (Admin)
   */
  getByType: async (type: PolicyType): Promise<Policy> => {
    const response = await apiClient.get<ApiResponse<Policy>>(`/admin/policies/${type}`);
    return response.data.data;
  },

  /**
   * Update policy (Admin)
   */
  update: async (type: PolicyType, data: UpdatePolicyDto): Promise<Policy> => {
    const response = await apiClient.put<ApiResponse<Policy>>(`/admin/policies/${type}`, data);
    return response.data.data;
  },

  /**
   * Toggle policy active status (Admin)
   */
  toggle: async (type: PolicyType, data: TogglePolicyDto): Promise<Policy> => {
    const response = await apiClient.post<ApiResponse<Policy>>(`/admin/policies/${type}/toggle`, data);
    return response.data.data;
  },

  /**
   * Get terms and conditions (Public)
   */
  getTerms: async (): Promise<Policy> => {
    const response = await apiClient.get<ApiResponse<Policy>>('/policies/public/terms');
    return response.data.data;
  },

  /**
   * Get privacy policy (Public)
   */
  getPrivacy: async (): Promise<Policy> => {
    const response = await apiClient.get<ApiResponse<Policy>>('/policies/public/privacy');
    return response.data.data;
  },

  /**
   * Get policy by type (Public)
   */
  getPublicByType: async (type: PolicyType): Promise<Policy> => {
    const response = await apiClient.get<ApiResponse<Policy>>(`/policies/public/${type}`);
    return response.data.data;
  },
};
