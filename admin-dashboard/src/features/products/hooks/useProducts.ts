import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../api/productsApi';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import toast from 'react-hot-toast';
import type {
  ListProductsParams,
  CreateProductDto,
  UpdateProductDto,
  CreateVariantDto,
  UpdateVariantDto,
  GenerateVariantsDto,
  StockUpdateRequest,
} from '../types/product.types';

// Query Keys
const PRODUCTS_KEY = 'products';

// ==================== Products ====================

// List products
export const useProducts = (params: ListProductsParams) => {
  return useQuery({
    queryKey: [PRODUCTS_KEY, params],
    queryFn: () => productsApi.list(params),
    placeholderData: (previousData) => previousData,
  });
};

// Get single product
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: [PRODUCTS_KEY, id],
    queryFn: () => productsApi.getById(id),
    enabled: !!id,
  });
};

// Create product
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductDto) => productsApi.create(data),
    onSuccess: () => {
      toast.success('تم إنشاء المنتج بنجاح');
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Update product
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductDto }) =>
      productsApi.update(id, data),
    onSuccess: (_, variables) => {
      toast.success('تم تحديث المنتج بنجاح');
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Delete product
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      toast.success('تم حذف المنتج بنجاح');
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Restore product
export const useRestoreProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsApi.restore(id),
    onSuccess: () => {
      toast.success('تم استعادة المنتج بنجاح');
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Get product stats
export const useProductStats = () => {
  return useQuery({
    queryKey: [PRODUCTS_KEY, 'stats'],
    queryFn: () => productsApi.getStats(),
  });
};

// ==================== Variants ====================

// Add variant
export const useAddVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVariantDto) => productsApi.addVariant(data),
    onSuccess: (_, variables) => {
      toast.success('تم إضافة الخيار بنجاح');
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY, variables.productId] });
    },
    onError: ErrorHandler.showError,
  });
};

// Update variant
export const useUpdateVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      variantId,
      data,
    }: {
      productId: string;
      variantId: string;
      data: UpdateVariantDto;
    }) => productsApi.updateVariant(variantId, data),
    onSuccess: (_, variables) => {
      toast.success('تم تحديث الخيار بنجاح');
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY, variables.productId] });
    },
    onError: ErrorHandler.showError,
  });
};

// Delete variant
export const useDeleteVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, variantId }: { productId: string; variantId: string }) =>
      productsApi.deleteVariant(variantId),
    onSuccess: (_, variables) => {
      toast.success('تم حذف الخيار بنجاح');
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY, variables.productId] });
    },
    onError: ErrorHandler.showError,
  });
};

// Generate variants
export const useGenerateVariants = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: GenerateVariantsDto }) =>
      productsApi.generateVariants(productId, data),
    onSuccess: (result, variables) => {
      toast.success(`تم توليد ${result.generated} متغير من أصل ${result.total} بنجاح`);
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY, variables.productId] });
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// List variants for a product
export const useProductVariants = (productId: string) => {
  return useQuery({
    queryKey: [PRODUCTS_KEY, productId, 'variants'],
    queryFn: () => productsApi.listVariants(productId),
    enabled: !!productId,
  });
};

// ==================== Pricing Management ====================

// Get variant price
export const useVariantPrice = (variantId: string, currency?: string) => {
  return useQuery({
    queryKey: [PRODUCTS_KEY, 'variants', variantId, 'price', currency],
    queryFn: () => productsApi.getVariantPrice(variantId, currency),
    enabled: !!variantId,
  });
};

// Get product prices
export const useProductPrices = (productId: string, currency?: string) => {
  return useQuery({
    queryKey: [PRODUCTS_KEY, productId, 'prices', currency],
    queryFn: () => productsApi.getProductPrices(productId, currency),
    enabled: !!productId,
  });
};

// Get price range
export const useProductPriceRange = (productId: string, currency?: string) => {
  return useQuery({
    queryKey: [PRODUCTS_KEY, productId, 'price-range', currency],
    queryFn: () => productsApi.getPriceRange(productId, currency),
    enabled: !!productId,
  });
};

// ==================== Inventory Management ====================

// Update stock
export const useUpdateStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ variantId, data }: { variantId: string; data: StockUpdateRequest }) =>
      productsApi.updateStock(variantId, data),
    onSuccess: (_,) => {
      toast.success('تم تحديث المخزون بنجاح');
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY, 'inventory'] });
    },
    onError: ErrorHandler.showError,
  });
};

// Check availability
export const useCheckAvailability = (variantId: string, quantity: number) => {
  return useQuery({
    queryKey: [PRODUCTS_KEY, 'variants', variantId, 'availability', quantity],
    queryFn: () => productsApi.checkAvailability(variantId, quantity),
    enabled: !!variantId && quantity > 0,
  });
};

// Get low stock variants
export const useLowStockVariants = (threshold?: number) => {
  return useQuery({
    queryKey: [PRODUCTS_KEY, 'inventory', 'low-stock', threshold],
    queryFn: () => productsApi.getLowStock(threshold),
  });
};

// Get out of stock variants
export const useOutOfStockVariants = () => {
  return useQuery({
    queryKey: [PRODUCTS_KEY, 'inventory', 'out-of-stock'],
    queryFn: () => productsApi.getOutOfStock(),
  });
};

// Get inventory summary
export const useInventorySummary = () => {
  return useQuery({
    queryKey: [PRODUCTS_KEY, 'inventory', 'summary'],
    queryFn: () => productsApi.getInventorySummary(),
  });
};