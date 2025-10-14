import { BaseEntity, ListParams } from '@/shared/types/common.types';

// Category Interface - متطابق تماماً مع Backend
export interface Category extends BaseEntity {
  // Tree Structure
  parentId: string | null;

  // Basic Info
  name: string; // Arabic
  nameEn: string; // English
  slug: string;
  path: string; // e.g. /electronics/phones
  depth: number;

  // Description
  description?: string; // Arabic
  descriptionEn?: string; // English

  // Images
  image?: string;
  imageId?: string;
  icon?: string;
  iconId?: string;

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];

  // Display
  order: number;
  isActive: boolean;
  showInMenu: boolean;
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
  image?: string;
  imageId?: string;
  icon?: string;
  iconId?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  order?: number;
  isActive?: boolean;
  showInMenu?: boolean;
  isFeatured?: boolean;
}

export interface UpdateCategoryDto {
  name?: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  image?: string;
  imageId?: string;
  icon?: string;
  iconId?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  order?: number;
  isActive?: boolean;
  showInMenu?: boolean;
  isFeatured?: boolean;
}

export interface ListCategoriesParams extends ListParams {
  parentId?: string | null;
  isActive?: boolean;
  isFeatured?: boolean;
  includeDeleted?: boolean;
}

export interface ReorderCategoriesDto {
  categories: Array<{ id: string; order: number }>;
}

// Category Statistics
export interface CategoryStats {
  total: number;
  active: number;
  inactive: number;
  featured: number;
  topLevel: number; // Categories with no parent
  withProducts: number;
}

