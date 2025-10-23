import { BaseEntity, ListParams } from '@/shared/types/common.types';

// Category Interface - متطابق تماماً مع Backend Schema
export interface Category extends BaseEntity {
  // Tree Structure
  parentId: string | null;

  // Basic Info
  name: string; // Arabic
  nameEn: string; // English
  slug: string;

  // Description (Bilingual)
  description?: string; // Arabic
  descriptionEn?: string; // English

  // Images
  imageId?: string; // Reference to Media collection

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];

  // Display & Order
  order: number;
  isActive: boolean;
  isFeatured: boolean;

  // Statistics
  productsCount: number;
  childrenCount: number;

  // Soft Delete
  deletedAt?: Date | null;
  deletedBy?: string;

  // Populated fields (optional)
  parent?: Category;
  children?: Category[];
}

// Category Tree Node
export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

// DTOs - متطابقة مع Backend

export interface CreateCategoryDto {
  parentId?: string | null;
  name: string;
  nameEn: string;
  description?: string;
  descriptionEn?: string;
  imageId?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  order?: number;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface UpdateCategoryDto {
  name?: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  imageId?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  order?: number;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface ListCategoriesParams extends ListParams {
  search?: string;
  parentId?: string | null;
  isActive?: boolean;
  isFeatured?: boolean;
  includeDeleted?: boolean;
}

// Category Statistics - متطابق مع Backend Response
export interface CategoryStats {
  totalCategories: number;
  activeCategories: number;
  featuredCategories: number;
  deletedCategories: number;
  totalProducts: number;
  categoriesWithProducts: number;
  averageProductsPerCategory: number;
}
