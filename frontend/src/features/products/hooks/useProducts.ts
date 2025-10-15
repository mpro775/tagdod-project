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
    }) => productsApi.updateVariant(productId, variantId, data),
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
      productsApi.deleteVariant(productId, variantId),
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
    onSuccess: (_, variables) => {
      toast.success('تم إنشاء الخيارات بنجاح');
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY, variables.productId] });
    },
    onError: ErrorHandler.showError,
  });
};
