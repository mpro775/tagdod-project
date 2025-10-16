import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/shared/types/common.types';

// Category interface
interface Category {
  _id: string;
  name: string;
  nameEn: string;
  slug: string;
  isActive: boolean;
}

// Brand interface
interface Brand {
  _id: string;
  name: string;
  nameEn: string;
  slug: string;
  isActive: boolean;
}

// Attribute interface
interface AttributeValue {
  _id: string;
  value: string;
  valueEn: string;
  isActive: boolean;
}

interface Attribute {
  _id: string;
  name: string;
  nameEn: string;
  type: 'text' | 'select' | 'multiselect' | 'number' | 'boolean';
  values: AttributeValue[];
  isRequired: boolean;
  isActive: boolean;
}

// Query Keys
const CATEGORIES_KEY = 'categories';
const BRANDS_KEY = 'brands';
const ATTRIBUTES_KEY = 'attributes';

// ==================== Categories ====================

export const useCategories = () => {
  return useQuery({
    queryKey: [CATEGORIES_KEY],
    queryFn: async (): Promise<Category[]> => {
      const response = await apiClient.get<ApiResponse<Category[]>>('/admin/categories');
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ==================== Brands ====================

export const useBrands = () => {
  return useQuery({
    queryKey: [BRANDS_KEY],
    queryFn: async (): Promise<Brand[]> => {
      const response = await apiClient.get<ApiResponse<Brand[]>>('/admin/brands');
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ==================== Attributes ====================

export const useAttributes = () => {
  return useQuery({
    queryKey: [ATTRIBUTES_KEY],
    queryFn: async (): Promise<Attribute[]> => {
      const response = await apiClient.get<ApiResponse<Attribute[]>>('/admin/attributes');
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ==================== Helper Functions ====================

export const useProductFormData = () => {
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: brands, isLoading: brandsLoading } = useBrands();
  const { data: attributes, isLoading: attributesLoading } = useAttributes();

  const isLoading = categoriesLoading || brandsLoading || attributesLoading;

  // Transform data for form select options
  const categoryOptions = (Array.isArray(categories) ? categories : []).map((cat) => ({
    value: cat._id,
    label: `${cat.name} (${cat.nameEn})`,
  }));

  const brandOptions = (Array.isArray(brands) ? brands : []).map((brand) => ({
    value: brand._id,
    label: `${brand.name} (${brand.nameEn})`,
  }));

  const attributeOptions = (Array.isArray(attributes) ? attributes : []).map((attr) => ({
    value: attr._id,
    label: `${attr.name} (${attr.nameEn})`,
    type: attr.type,
    values: attr.values,
  }));

  return {
    categories,
    brands,
    attributes,
    categoryOptions,
    brandOptions,
    attributeOptions,
    isLoading,
  };
};
