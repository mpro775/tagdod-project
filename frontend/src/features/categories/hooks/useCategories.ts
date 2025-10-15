import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../api/categoriesApi';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import toast from 'react-hot-toast';
import type {
  ListCategoriesParams,
  CreateCategoryDto,
  UpdateCategoryDto,
  ReorderCategoriesDto,
} from '../types/category.types';

// Query Keys
const CATEGORIES_KEY = 'categories';

// List categories
export const useCategories = (params: ListCategoriesParams = {}) => {
  return useQuery({
    queryKey: [CATEGORIES_KEY, params],
    queryFn: () => categoriesApi.list(params),
  });
};

// Get category tree
export const useCategoryTree = () => {
  return useQuery({
    queryKey: [CATEGORIES_KEY, 'tree'],
    queryFn: () => categoriesApi.getTree(),
  });
};

// Get single category
export const useCategory = (id: string) => {
  return useQuery({
    queryKey: [CATEGORIES_KEY, id],
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
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Delete category
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

// Restore category
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

// Reorder categories
export const useReorderCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReorderCategoriesDto) => categoriesApi.reorder(data),
    onSuccess: () => {
      toast.success('تم تحديث الترتيب بنجاح');
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Get category stats
export const useCategoryStats = () => {
  return useQuery({
    queryKey: [CATEGORIES_KEY, 'stats'],
    queryFn: () => categoriesApi.getStats(),
  });
};
