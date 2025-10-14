import { BaseEntity, ListParams } from '@/shared/types/common.types';

// Product Status - متطابق مع الباك إند
export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
}

// Variant Attribute
export interface VariantAttribute {
  attributeId: string;
  valueId: string;
  name?: string;
  value?: string;
}

// Product Interface - متطابق تماماً مع Backend
export interface Product extends BaseEntity {
  // المعلومات الأساسية
  name: string;
  nameEn: string;
  slug: string;
  description: string;
  descriptionEn: string;

  // التصنيف
  categoryId: string;
  brandId?: string;
  sku?: string;

  // الصور
  mainImage?: string;
  mainImageId?: string;
  imageIds: string[];
  images: string[];

  // السمات
  attributes: string[];

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];

  // الحالة والعرض
  status: ProductStatus;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isBestseller: boolean;

  // الترتيب
  order: number;

  // الإحصائيات
  viewsCount: number;
  salesCount: number;
  variantsCount: number;
  reviewsCount: number;
  averageRating: number;

  // Soft Delete
  deletedAt?: Date | null;
  deletedBy?: string;

  // Populated fields (من الـ relations)
  category?: {
    _id: string;
    name: string;
    nameEn: string;
  };
  brand?: {
    _id: string;
    name: string;
    nameEn: string;
  };
  variants?: Variant[];
}

// Variant Interface - متطابق تماماً مع Backend
export interface Variant extends BaseEntity {
  productId: string;
  sku?: string;

  // السمات
  attributeValues: VariantAttribute[];

  // التسعير
  price: number;
  compareAtPrice?: number;
  costPrice?: number;

  // المخزون
  stock: number;
  trackInventory: boolean;
  allowBackorder: boolean;
  lowStockThreshold: number;

  // الصور
  image?: string;
  imageId?: string;

  // الوزن والأبعاد
  weight?: number;
  length?: number;
  width?: number;
  height?: number;

  // الحالة
  isActive: boolean;
  isAvailable: boolean;

  // الإحصائيات
  salesCount: number;

  // Soft Delete
  deletedAt?: Date | null;
}

// DTOs - متطابقة تماماً مع Backend

export interface CreateProductDto {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  categoryId: string;
  brandId?: string;
  sku?: string;
  mainImage?: string;
  mainImageId?: string;
  imageIds?: string[];
  images?: string[];
  attributes?: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  status?: ProductStatus;
  isFeatured?: boolean;
  isNew?: boolean;
  order?: number;
}

export interface UpdateProductDto {
  name?: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  categoryId?: string;
  brandId?: string;
  sku?: string;
  mainImage?: string;
  mainImageId?: string;
  imageIds?: string[];
  images?: string[];
  attributes?: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  status?: ProductStatus;
  isActive?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  order?: number;
}

export interface ListProductsParams extends ListParams {
  categoryId?: string;
  brandId?: string;
  status?: ProductStatus;
  isFeatured?: boolean;
  isNew?: boolean;
  includeDeleted?: boolean;
}

export interface CreateVariantDto {
  productId: string;
  sku?: string;
  attributeValues: Array<{ attributeId: string; valueId: string }>;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock: number;
  trackInventory?: boolean;
  imageId?: string;
  weight?: number;
}

export interface UpdateVariantDto {
  sku?: string;
  price?: number;
  compareAtPrice?: number;
  stock?: number;
  isActive?: boolean;
  imageId?: string;
}

export interface GenerateVariantsDto {
  defaultPrice: number;
  defaultStock: number;
  overwriteExisting?: boolean;
}

// Product Statistics
export interface ProductStats {
  total: number;
  active: number;
  draft: number;
  outOfStock: number;
  discontinued: number;
  featured: number;
  new: number;
  bestseller: number;
}

