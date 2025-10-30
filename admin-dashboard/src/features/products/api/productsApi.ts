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
    const response = await apiClient.get('/admin/products', {
      params: sanitizePaginationParams(params),
    });
    // Backend wraps list in data: { data: T[]; meta: PaginationMeta }
    return {
      data: response.data.data?.data ?? [],
      meta: response.data.data?.meta,
    };
  },

  /**
   * Get product by ID
   */
  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get(`/admin/products/${id}`);
    // Handle both { data: Product } and { data: { data: Product } }
    return response.data.data?.data ?? response.data.data;
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
    const response = await apiClient.get<ApiResponse<ProductStats | { data: ProductStats }>>(
      '/admin/products/stats/summary'
    );
    const payload = response.data.data as ProductStats | { data: ProductStats };
    return (payload as any)?.data ?? (payload as ProductStats);
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
    variantId: string,
    data: UpdateVariantDto
  ): Promise<Variant> => {
    const response = await apiClient.patch<ApiResponse<Variant>>(
      `/admin/products/variants/${variantId}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete variant
   */
  deleteVariant: async (variantId: string): Promise<void> => {
    await apiClient.delete(`/admin/products/variants/${variantId}`);
  },

  /**
   * Generate variants automatically
   */
  generateVariants: async (productId: string, data: GenerateVariantsDto): Promise<{ generated: number; total: number; variants: Variant[] }> => {
    const response = await apiClient.post<ApiResponse<{ generated: number; total: number; variants: Variant[] }>>(
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
    const response = await apiClient.get<ApiResponse<Variant[] | { data: Variant[] }>>(
      `/admin/products/${productId}/variants`
    );
    const payload = response.data.data as Variant[] | { data: Variant[] };
    return Array.isArray(payload) ? payload : payload?.data ?? [];
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
  getLowStock: async (threshold?: number): Promise<import('../types/product.types').LowStockItem[]> => {
    const response = await apiClient.get<ApiResponse<Variant[]>>(
      '/admin/products/inventory/low-stock',
      { params: { threshold } }
    );
    return response.data.data as any;
  },

  /**
   * Get out of stock variants
   */
  getOutOfStock: async (): Promise<import('../types/product.types').OutOfStockItem[]> => {
    const response = await apiClient.get<ApiResponse<any>>(
      '/admin/products/inventory/out-of-stock'
    );
    return response.data.data as any;
  },

  /**
   * Get inventory summary
   */
  getInventorySummary: async (): Promise<InventorySummary> => {
    const response = await apiClient.get<
      ApiResponse<InventorySummary | { data: InventorySummary }>
    >(
      '/admin/products/inventory/summary'
    );
    const payload = response.data.data as InventorySummary | { data: InventorySummary };
    return (payload as any)?.data ?? (payload as InventorySummary);
  },

  // ==================== Related Products ====================

  /**
   * Get related products
   */
  getRelatedProducts: async (productId: string, limit?: number): Promise<Product[]> => {
    const response = await apiClient.get<ApiResponse<{ data: Product[] }>>(
      `/admin/products/${productId}/related`,
      { params: { limit } }
    );
    return response.data.data.data;
  },

  /**
   * Update related products (replace all)
   */
  updateRelatedProducts: async (
    productId: string,
    relatedProductIds: string[]
  ): Promise<Product> => {
    const response = await apiClient.put<ApiResponse<{ product: Product }>>(
      `/admin/products/${productId}/related`,
      { relatedProductIds }
    );
    return response.data.data.product;
  },

  /**
   * Add a single related product
   */
  addRelatedProduct: async (productId: string, relatedProductId: string): Promise<Product> => {
    const response = await apiClient.post<ApiResponse<{ product: Product }>>(
      `/admin/products/${productId}/related/${relatedProductId}`
    );
    return response.data.data.product;
  },

  /**
   * Remove a related product
   */
  removeRelatedProduct: async (productId: string, relatedProductId: string): Promise<Product> => {
    const response = await apiClient.delete<ApiResponse<{ product: Product }>>(
      `/admin/products/${productId}/related/${relatedProductId}`
    );
    return response.data.data.product;
  },
};
