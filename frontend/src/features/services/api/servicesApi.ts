import { apiClient } from '@/core/api/client';
import type { ServiceRequest, ListServicesParams } from '../types/service.types';

export const servicesApi = {
  list: async (params: ListServicesParams = {}): Promise<ServiceRequest[]> => {
    const response = await apiClient.get<{ data: ServiceRequest[] }>('/admin/services/requests', { params });
    return response.data.data;
  },

  getById: async (id: string): Promise<ServiceRequest> => {
    const response = await apiClient.get<{ data: ServiceRequest }>(`/admin/services/requests/${id}`);
    return response.data.data;
  },
};

