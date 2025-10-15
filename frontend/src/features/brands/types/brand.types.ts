import { BaseEntity, ListParams } from '@/shared/types/common.types';

// Brand Interface - متطابق تماماً مع Backend
export interface Brand extends BaseEntity {
  // Basic Info
  name: string; // Arabic
  nameEn: string; // English
  slug: string;
  description?: string; // Arabic
  descriptionEn?: string; // English

  // Images
  logo?: string;
  logoId?: string;

  // Contact
  website?: string;
  email?: string;
  phone?: string;

  // Display
  isActive: boolean;
  isFeatured: boolean;
  order: number;

  // Statistics
  productsCount: number;

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];

  // Soft Delete
  deletedAt?: Date | null;
  deletedBy?: string;
}

// DTOs - متطابقة مع Backend

export interface CreateBrandDto {
  name: string;
  nameEn: string;
  description?: string;
  descriptionEn?: string;
  logo?: string;
  logoId?: string;
  website?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  order?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
}

export interface UpdateBrandDto {
  name?: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  logo?: string;
  logoId?: string;
  website?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  order?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
}

export interface ListBrandsParams extends ListParams {
  isActive?: boolean;
  isFeatured?: boolean;
  includeDeleted?: boolean;
}

// Brand Statistics
export interface BrandStats {
  total: number;
  active: number;
  inactive: number;
  featured: number;
  withProducts: number;
}
