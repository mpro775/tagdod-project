import { BaseEntity, ListParams } from '@/shared/types/common.types';

// Product Status - متطابق تماماً مع الباك إند
export enum ProductStatus {
  // eslint-disable-next-line no-unused-vars
  DRAFT = 'draft',           // مسودة
  // eslint-disable-next-line no-unused-vars
  ACTIVE = 'active',         // نشط
  // eslint-disable-next-line no-unused-vars
  ARCHIVED = 'archived',     // مؤرشف
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
  // المعلومات الأساسية (ثنائي اللغة)
  name: string; // الاسم بالعربية
  nameEn: string; // الاسم بالإنجليزية
  slug: string;
  description: string; // الوصف بالعربية
  descriptionEn: string; // الوصف بالإنجليزية

  // التصنيف
  categoryId: string | {
    _id: string;
    parentId?: string | null;
    name: string;
    nameEn: string;
    slug: string;
    description?: string;
    descriptionEn?: string;
    metaKeywords?: string[];
    order?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    productsCount?: number;
    childrenCount?: number;
    deletedAt?: Date | null;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
    imageId?: string;
  };
  brandId?: string | {
    _id: string;
    name: string;
    nameEn: string;
    slug: string;
    image?: string;
    description?: string;
    descriptionEn?: string;
    isActive?: boolean;
    sortOrder?: number;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
    metadata?: any;
  };
  sku?: string;

  mainImage?: string;
  // الصور (مبسط)
  mainImageId?: string; // الصورة الرئيسية
  imageIds: string[]; // صور إضافية
  images?: string[];

  // السمات
  attributes: string[]; // السمات التي يستخدمها هذا المنتج

  // الحالة (مبسط)
  status: ProductStatus;
  isActive: boolean;
  isFeatured: boolean; // منتج مميز
  isNew: boolean; // منتج جديد
  isBestseller: boolean; // الأكثر مبيعاً

  // الإحصائيات
  viewsCount: number; // عدد المشاهدات
  salesCount: number; // عدد المبيعات
  variantsCount: number; // عدد الـ variants
  reviewsCount: number; // عدد التقييمات الحقيقية
  averageRating: number; // متوسط التقييم الحقيقي

  // التقييم اليدوي (للأدمن)
  useManualRating?: boolean; // استخدام التقييم اليدوي بدلاً من الحقيقي
  manualRating?: number; // التقييم اليدوي (0-5)
  manualReviewsCount?: number; // عدد التقييمات اليدوي (للعرض فقط)

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];

  // الترتيب
  order: number;

  // المنتجات الشبيهة
  relatedProducts?: string[]; // IDs of related products

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

  // التسعير (محفوظ بالدولار في الباك إند)
  price: number;
  compareAtPrice?: number;
  costPrice?: number;

  // المخزون
  stock: number;
  minStock: number;
  trackInventory: boolean;
  allowBackorder: boolean;

  // الصور
  imageId?: string;

  // الوزن والأبعاد
  weight?: number;

  // الحالة
  isActive: boolean;
  isAvailable: boolean;

  // الإحصائيات
  salesCount: number;

  // Soft Delete
  deletedAt?: Date | null;
  deletedBy?: string;
}

// DTOs - متطابقة تماماً مع Backend

export interface CreateProductDto {
  name: string; // الاسم بالعربية
  nameEn: string; // الاسم بالإنجليزية
  description: string; // الوصف بالعربية
  descriptionEn: string; // الوصف بالإنجليزية
  categoryId: string;
  
  brandId?: string;
  sku?: string;
  mainImage?: string;
  mainImageId?: string;
  imageIds?: string[];
  images?: string[];
  attributes?: string[]; // Attribute IDs
  
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  
  relatedProducts?: string[]; // Related product IDs
  
  status?: ProductStatus;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  order?: number;
  
  // حقول المخزون
  stock?: number;
  minStock?: number;
  maxStock?: number;
  trackStock?: boolean;
  allowBackorder?: boolean;
  
  // التقييم اليدوي
  useManualRating?: boolean;
  manualRating?: number;
  manualReviewsCount?: number;
}

export interface UpdateProductDto {
  name?: string; // الاسم بالعربية
  nameEn?: string; // الاسم بالإنجليزية
  description?: string; // الوصف بالعربية
  descriptionEn?: string; // الوصف بالإنجليزية
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
  
  relatedProducts?: string[]; // Related product IDs
  
  status?: ProductStatus;
  isActive?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  order?: number;
  
  // حقول المخزون
  stock?: number;
  minStock?: number;
  maxStock?: number;
  trackStock?: boolean;
  allowBackorder?: boolean;
  
  // التقييم اليدوي
  useManualRating?: boolean;
  manualRating?: number;
  manualReviewsCount?: number;
}

export interface ListProductsParams extends ListParams {
  categoryId?: string;
  brandId?: string;
  status?: ProductStatus;
  isFeatured?: boolean;
  isNew?: boolean;
  includeDeleted?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  
  // فلاتر المخزون
  lowStock?: boolean;
  outOfStock?: boolean;
  trackStock?: boolean;
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
  costPrice?: number;
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
  archived: number;
  featured: number;
  new: number;
}

// Pricing and Inventory Types
export interface PriceInfo {
  variantId: string;
  currency: string;
  price: number;
  formatted: string;
}

export interface InventorySummary {
  totalVariants: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
  // Optional enhanced fields returned by backend if available
  inStockUnits?: number;
  lowStockUnits?: number;
  outOfStockUnits?: number;
  variantsPerProduct?: Array<{
    productId: string;
    productName?: string;
    variantsCount: number;
    totalUnits?: number;
  }>;
}

export interface StockUpdateRequest {
  quantity: number;
  operation: 'add' | 'subtract' | 'set';
  reason?: string;
}

// Bulk Operations
export interface BulkUpdateStockDto {
  updates: Array<{
    productId: string;
    stock: number;
    reason?: string;
  }>;
}

export interface StockAlertDto {
  minStockThreshold?: number;
  includeOutOfStock?: boolean;
  includeLowStock?: boolean;
}

export interface LowStockItem {
  variantId: string;
  productId: string;
  sku?: string;
  currentStock: number;
  minStock: number;
  difference: number;
}

export interface OutOfStockItem {
  variantId: string;
  productId: string;
  sku?: string;
}

