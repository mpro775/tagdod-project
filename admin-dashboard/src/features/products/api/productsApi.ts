import { apiClient } from '@/core/api/client';
import { sanitizePaginationParams } from '@/shared/utils/formatters';
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
  PriceInfo,
  InventorySummary,
  StockUpdateRequest,
} from '../types/product.types';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/common.types';

export const productsApi = {
  // ==================== Products ====================

  /**
   * Create product
   */
  create: async (data: CreateProductDto): Promise<Product> => {
    const response = await apiClient.post('/admin/products', data);
    return response.data.data;
  },

  /**
   * List products
   */
  list: async (params: ListProductsParams): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get<ApiResponse<{
      products: Product[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>>('/admin/products', {
      params: sanitizePaginationParams(params),
    });
    return {
      data: response.data.data.products,
      meta: {
        page: response.data.data.page,
        limit: response.data.data.limit,
        total: response.data.data.total,
        totalPages: response.data.data.totalPages,
      },
    };
  },

  /**
   * Get product by ID
   */
  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get(`/admin/products/${id}`);
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

  /**
   * List variants for a product
   */
  listVariants: async (productId: string): Promise<Variant[]> => {
    const response = await apiClient.get<ApiResponse<Variant[]>>(
      `/admin/products/${productId}/variants`
    );
    return response.data.data;
  },

  // ==================== Pricing Management ====================

  /**
   * Get variant price in specific currency
   */
  getVariantPrice: async (variantId: string, currency?: string): Promise<PriceInfo> => {
    const response = await apiClient.get<ApiResponse<PriceInfo>>(
      `/admin/products/variants/${variantId}/price`,
      { params: { currency } }
    );
    return response.data.data;
  },

  /**
   * Get all variant prices for product
   */
  getProductPrices: async (productId: string, currency?: string): Promise<PriceInfo[]> => {
    const response = await apiClient.get<ApiResponse<PriceInfo[]>>(
      `/admin/products/${productId}/prices`,
      { params: { currency } }
    );
    return response.data.data;
  },

  /**
   * Get product price range
   */
  getPriceRange: async (
    productId: string,
    currency?: string
  ): Promise<{ min: number; max: number }> => {
    const response = await apiClient.get<ApiResponse<{ min: number; max: number }>>(
      `/admin/products/${productId}/price-range`,
      { params: { currency } }
    );
    return response.data.data;
  },

  // ==================== Inventory Management ====================

  /**
   * Update variant stock
   */
  updateStock: async (variantId: string, data: StockUpdateRequest): Promise<Variant> => {
    const response = await apiClient.post<ApiResponse<Variant>>(
      `/admin/products/variants/${variantId}/stock`,
      data
    );
    return response.data.data;
  },

  /**
   * Check variant availability
   */
  checkAvailability: async (
    variantId: string,
    quantity: number
  ): Promise<{ available: boolean; availableQuantity: number }> => {
    const response = await apiClient.get<
      ApiResponse<{ available: boolean; availableQuantity: number }>
    >(`/admin/products/variants/${variantId}/availability`, { params: { quantity } });
    return response.data.data;
  },

  /**
   * Get low stock variants
   */
  getLowStock: async (threshold?: number): Promise<Variant[]> => {
    const response = await apiClient.get<ApiResponse<Variant[]>>(
      '/admin/products/inventory/low-stock',
      { params: { threshold } }
    );
    return response.data.data;
  },

  /**
   * Get out of stock variants
   */
  getOutOfStock: async (): Promise<Variant[]> => {
    const response = await apiClient.get<ApiResponse<Variant[]>>(
      '/admin/products/inventory/out-of-stock'
    );
    return response.data.data;
  },

  /**
   * Get inventory summary
   */
  getInventorySummary: async (): Promise<InventorySummary> => {
    const response = await apiClient.get<ApiResponse<InventorySummary>>(
      '/admin/products/inventory/summary'
    );
    return response.data.data;
  },
};
