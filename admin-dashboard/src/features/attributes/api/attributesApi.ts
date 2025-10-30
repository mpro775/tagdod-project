import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/shared/types/common.types';
import type {
  Attribute,
  AttributeValue,
  ListAttributesParams,
  CreateAttributeDto,
  UpdateAttributeDto,
  CreateAttributeValueDto,
  UpdateAttributeValueDto,
  AttributeStats,
} from '../types/attribute.types';

export const attributesApi = {
  // ==================== Attributes CRUD ====================

  /**
   * إنشاء سمة جديدة
   * POST /admin/attributes
   */
  create: async (data: CreateAttributeDto): Promise<Attribute> => {
    const response = await apiClient.post<ApiResponse<Attribute>>('/admin/attributes', data);
    return response.data.data;
  },

  /**
   * الحصول على قائمة السمات مع فلترة
   * GET /admin/attributes
   */
  list: async (params: ListAttributesParams = {}): Promise<{ data: Attribute[]; meta?: any }> => {
    const response = await apiClient.get<ApiResponse<Attribute[]>>('/admin/attributes', {
      params,
    });
    // Backend يرجع array مباشرة، نحوله لـ object
    return { data: response.data.data as Attribute[], meta: undefined };
  },

  /**
   * الحصول على سمة واحدة مع قيمها
   * GET /admin/attributes/:id
   */
  getById: async (id: string): Promise<Attribute> => {
    const response = await apiClient.get<ApiResponse<Attribute>>(`/admin/attributes/${id}`);
    return response.data.data;
  },

  /**
   * تحديث سمة موجودة
   * PATCH /admin/attributes/:id
   */
  update: async (id: string, data: UpdateAttributeDto): Promise<Attribute> => {
    const response = await apiClient.patch<ApiResponse<Attribute>>(`/admin/attributes/${id}`, data);
    return response.data.data;
  },

  /**
   * حذف سمة (Soft Delete)
   * DELETE /admin/attributes/:id
   */
  delete: async (id: string): Promise<{ deleted: boolean; deletedAt: Date }> => {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean; deletedAt: Date }>>(`/admin/attributes/${id}`);
    return response.data.data;
  },

  /**
   * استعادة سمة محذوفة
   * POST /admin/attributes/:id/restore
   */
  restore: async (id: string): Promise<{ restored: boolean }> => {
    const response = await apiClient.post<ApiResponse<{ restored: boolean }>>(
      `/admin/attributes/${id}/restore`
    );
    return response.data.data;
  },

  // ==================== Attribute Values CRUD ====================

  /**
   * إضافة قيمة جديدة للسمة
   * POST /admin/attributes/:attributeId/values
   */
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

  /**
   * الحصول على قيم السمة
   * GET /admin/attributes/:attributeId/values
   */
  listValues: async (attributeId: string): Promise<AttributeValue[]> => {
    const response = await apiClient.get<ApiResponse<AttributeValue[]>>(
      `/admin/attributes/${attributeId}/values`
    );
    return response.data.data;
  },

  /**
   * تحديث قيمة السمة
   * PATCH /admin/attributes/values/:id
   */
  updateValue: async (id: string, data: UpdateAttributeValueDto): Promise<AttributeValue> => {
    const response = await apiClient.patch<ApiResponse<AttributeValue>>(
      `/admin/attributes/values/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * حذف قيمة السمة (Soft Delete)
   * DELETE /admin/attributes/values/:id
   */
  deleteValue: async (id: string): Promise<{ deleted: boolean }> => {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/admin/attributes/values/${id}`);
    return response.data.data;
  },

  // ==================== Statistics ====================

  /**
   * الحصول على إحصائيات السمات
   * GET /admin/attributes/stats/summary
   */
  getStats: async (): Promise<AttributeStats> => {
    const response = await apiClient.get<ApiResponse<{ data: AttributeStats }>>('/admin/attributes/stats/summary');
    // Backend يرجع data.data.data بسبب التداخل
    return (response.data.data as any).data || response.data.data;
  },
};
