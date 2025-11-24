import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../api/categoriesApi';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import toast from 'react-hot-toast';
import type {
  ListCategoriesParams,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../types/category.types';

// Query Keys
const CATEGORIES_KEY = 'categories';

// List categories with filtering and search
export const useCategories = (params: ListCategoriesParams = {}) => {
  return useQuery({
    queryKey: [CATEGORIES_KEY, 'list', params],
    queryFn: () => categoriesApi.list(params),
  });
};

// Get category tree (hierarchical structure)
// Note: Filters are applied on frontend since backend doesn't support them
export const useCategoryTree = () => {
  return useQuery({
    queryKey: [CATEGORIES_KEY, 'tree'],
    queryFn: () => categoriesApi.getTree(),
  });
};

// Get single category with full details
export const useCategory = (id: string) => {
  return useQuery({
    queryKey: [CATEGORIES_KEY, 'single', id],
    queryFn: () => categoriesApi.getById(id),
    enabled: !!id,
  });
};

// Create category
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryDto) => categoriesApi.create(data),
    onSuccess: () => {
      toast.success('تم إنشاء الفئة بنجاح');
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Update category
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) =>
      categoriesApi.update(id, data),
    onSuccess: (_, variables) => {
      toast.success('تم تحديث الفئة بنجاح');
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY, 'single', variables.id] });
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Delete category (soft delete)
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      toast.success('تم حذف الفئة بنجاح');
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Restore deleted category
export const useRestoreCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesApi.restore(id),
    onSuccess: () => {
      toast.success('تم استعادة الفئة بنجاح');
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Permanent delete category (Super Admin only)
export const usePermanentDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesApi.permanentDelete(id),
    onSuccess: () => {
      toast.success('تم حذف الفئة نهائياً');
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Update category statistics
export const useUpdateCategoryStats = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesApi.updateStats(id),
    onSuccess: () => {
      toast.success('تم تحديث إحصائيات الفئة');
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Get category statistics summary
export const useCategoryStats = () => {
  return useQuery({
    queryKey: [CATEGORIES_KEY, 'stats'],
    queryFn: () => categoriesApi.getStats(),
  });
};
