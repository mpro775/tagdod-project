import { BaseEntity, ListParams } from '@/shared/types/common.types';

// Brand Interface - متطابق تماماً مع Backend Schema
export interface Brand extends BaseEntity {
  // Basic Info - متطابق مع Backend
  name: string; // الاسم بالعربية (مطلوب)
  nameEn: string; // الاسم بالإنجليزية (مطلوب)
  slug: string; // Auto-generated from name (unique)
  image: string; // Brand logo/image URL (مطلوب)
  description?: string; // الوصف بالعربية (اختياري)
  descriptionEn?: string; // الوصف بالإنجليزية (اختياري)

  // Status & Order
  isActive: boolean; // Active status (default: true)
  sortOrder: number; // For ordering (default: 0)

  // Additional Data
  metadata?: Record<string, unknown>; // Additional data (اختياري)
}

// DTOs - متطابقة تماماً مع Backend DTOs

export interface CreateBrandDto {
  name: string; // مطلوب، 2-100 حرف
  nameEn: string; // مطلوب، 2-100 حرف
  image: string; // مطلوب
  description?: string; // اختياري، حتى 500 حرف
  descriptionEn?: string; // اختياري، حتى 500 حرف
  isActive?: boolean; // اختياري، default: true
  sortOrder?: number; // اختياري، default: 0
  metadata?: Record<string, unknown>; // اختياري
}

export interface UpdateBrandDto {
  name?: string; // اختياري، 2-100 حرف
  nameEn?: string; // اختياري، 2-100 حرف
  image?: string; // اختياري
  description?: string; // اختياري، حتى 500 حرف
  descriptionEn?: string; // اختياري، حتى 500 حرف
  isActive?: boolean; // اختياري
  sortOrder?: number; // اختياري
  metadata?: Record<string, unknown>; // اختياري
}

export interface ListBrandsParams extends ListParams {
  search?: string; // البحث في name, nameEn, description, descriptionEn
  isActive?: boolean; // فلترة حسب الحالة
  sortBy?: 'name' | 'nameEn' | 'createdAt' | 'sortOrder'; // ترتيب
  sortOrder?: 'asc' | 'desc'; // اتجاه الترتيب
  language?: 'ar' | 'en'; // اللغة المفضلة
}

// Brand Statistics - للتحليلات
export interface BrandStats {
  total: number;
  active: number;
  inactive: number;
  withProducts: number;
}

// API Response Types - متطابقة مع نمط الاستجابة الموحد
export interface BrandListResponse {
  success: true;
  data: Brand[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BrandResponse {
  success: true;
  data: Brand;
}

export interface BrandErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
