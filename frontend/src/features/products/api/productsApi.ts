import { apiClient } from '@/core/api/client';
import type {
  Product,
  Variant,
  ListProductsParams,
  CreateProductDto,
  UpdateProductDto,
  CreateVariantDto,
  UpdateVariantDto,
  GenerateVariantsDto,
  ProductStats,
} from '../types/product.types';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/common.types';

export const productsApi = {
  // ==================== Products ====================

  /**
   * Create product
   */
  create: async (data: CreateProductDto): Promise<Product> => {
    const response = await apiClient.post<ApiResponse<Product>>('/admin/products', data);
    return response.data.data;
  },

  /**
   * List products
   */
  list: async (params: ListProductsParams): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get('/admin/products', { params });
    return response.data;
  },

  /**
   * Get product by ID
   */
  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get<ApiResponse<Product>>(`/admin/products/${id}`);
    return response.data.data;
  },

  /**
   * Update product
   */
  update: async (id: string, data: UpdateProductDto): Promise<Product> => {
    const response = await apiClient.patch<ApiResponse<Product>>(`/admin/products/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete product (soft delete)
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/products/${id}`);
  },

  /**
   * Restore deleted product
   */
  restore: async (id: string): Promise<Product> => {
    const response = await apiClient.post<ApiResponse<Product>>(`/admin/products/${id}/restore`);
    return response.data.data;
  },

  /**
   * Update product statistics
   */
  updateStats: async (id: string): Promise<void> => {
    await apiClient.post(`/admin/products/${id}/update-stats`);
  },

  /**
   * Get product statistics
   */
  getStats: async (): Promise<ProductStats> => {
    const response = await apiClient.get<ApiResponse<ProductStats>>(
      '/admin/products/stats/summary'
    );
    return response.data.data;
  },

  // ==================== Variants ====================

  /**
   * Add variant to product
   */
  addVariant: async (data: CreateVariantDto): Promise<Variant> => {
    const response = await apiClient.post<ApiResponse<Variant>>(
      `/admin/products/${data.productId}/variants`,
      data
    );
    return response.data.data;
  },

  /**
   * Update variant
   */
  updateVariant: async (
    productId: string,
    variantId: string,
    data: UpdateVariantDto
  ): Promise<Variant> => {
    const response = await apiClient.patch<ApiResponse<Variant>>(
      `/admin/products/${productId}/variants/${variantId}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete variant
   */
  deleteVariant: async (productId: string, variantId: string): Promise<void> => {
    await apiClient.delete(`/admin/products/${productId}/variants/${variantId}`);
  },

  /**
   * Generate variants automatically
   */
  generateVariants: async (productId: string, data: GenerateVariantsDto): Promise<Variant[]> => {
    const response = await apiClient.post<ApiResponse<Variant[]>>(
      `/admin/products/${productId}/generate-variants`,
      data
    );
    return response.data.data;
  },

  /**
   * Set default variant
   */
  setDefaultVariant: async (productId: string, variantId: string): Promise<Variant> => {
    const response = await apiClient.post<ApiResponse<Variant>>(
      `/admin/products/${productId}/variants/${variantId}/set-default`
    );
    return response.data.data;
  },
};
