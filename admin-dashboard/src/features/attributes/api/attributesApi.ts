import { apiClient } from '@/core/api/client';
import type {
  Attribute,
  AttributeValue,
  ListAttributesParams,
  CreateAttributeDto,
  UpdateAttributeDto,
  CreateAttributeValueDto,
  UpdateAttributeValueDto,
} from '../types/attribute.types';
import type { ApiResponse } from '@/shared/types/common.types';

export const attributesApi = {
  // ==================== Attributes ====================

  create: async (data: CreateAttributeDto): Promise<Attribute> => {
    const response = await apiClient.post<ApiResponse<Attribute>>('/admin/attributes', data);
    return response.data.data;
  },

  list: async (params: ListAttributesParams = {}): Promise<Attribute[]> => {
    const response = await apiClient.get<ApiResponse<Attribute[]>>('/admin/attributes', {
      params,
    });
    return response.data.data;
  },

  getById: async (id: string): Promise<Attribute> => {
    const response = await apiClient.get<ApiResponse<Attribute>>(`/admin/attributes/${id}`);
    return response.data.data;
  },

  update: async (id: string, data: UpdateAttributeDto): Promise<Attribute> => {
    const response = await apiClient.patch<ApiResponse<Attribute>>(`/admin/attributes/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/attributes/${id}`);
  },

  restore: async (id: string): Promise<Attribute> => {
    const response = await apiClient.post<ApiResponse<Attribute>>(
      `/admin/attributes/${id}/restore`
    );
    return response.data.data;
  },

  // ==================== Attribute Values ====================

  createValue: async (
    attributeId: string,
    data: CreateAttributeValueDto
  ): Promise<AttributeValue> => {
    const response = await apiClient.post<ApiResponse<AttributeValue>>(
      `/admin/attributes/${attributeId}/values`,
      data
    );
    return response.data.data;
  },

  listValues: async (attributeId: string): Promise<AttributeValue[]> => {
    const response = await apiClient.get<ApiResponse<AttributeValue[]>>(
      `/admin/attributes/${attributeId}/values`
    );
    return response.data.data;
  },

  updateValue: async (id: string, data: UpdateAttributeValueDto): Promise<AttributeValue> => {
    const response = await apiClient.patch<ApiResponse<AttributeValue>>(
      `/admin/attributes/values/${id}`,
      data
    );
    return response.data.data;
  },

  deleteValue: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/attributes/values/${id}`);
  },
};
