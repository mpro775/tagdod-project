import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, IsArray, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum SearchEntity {
  PRODUCTS = 'products',
  CATEGORIES = 'categories',
  BRANDS = 'brands',
  ALL = 'all',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum ProductSortBy {
  NAME = 'name',
  PRICE = 'price',
  RATING = 'rating',
  VIEWS = 'views',
  CREATED_AT = 'createdAt',
  RELEVANCE = 'relevance',
}

// ==================== البحث الشامل ====================
export class SearchQueryDto {
  @ApiProperty({ description: 'نص البحث', required: false })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({ description: 'اللغة', enum: ['ar', 'en'], required: false })
  @IsOptional()
  @IsEnum(['ar', 'en'])
  lang?: 'ar' | 'en' = 'ar';

  @ApiProperty({ description: 'نوع الكيانات', enum: SearchEntity, required: false })
  @IsOptional()
  @IsEnum(SearchEntity)
  entity?: SearchEntity = SearchEntity.ALL;

  @ApiProperty({ description: 'رقم الصفحة', minimum: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'عدد النتائج', minimum: 1, maximum: 100, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

// ==================== بحث المنتجات المتقدم ====================
export class AdvancedProductSearchDto {
  @ApiProperty({ description: 'نص البحث', required: false })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({ description: 'اللغة', enum: ['ar', 'en'], required: false })
  @IsOptional()
  @IsEnum(['ar', 'en'])
  lang?: 'ar' | 'en' = 'ar';

  // Filters
  @ApiProperty({ description: 'معرف الفئة', required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ description: 'معرف البراند', required: false })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiProperty({ description: 'الحالة', enum: ['draft', 'active', 'out_of_stock', 'discontinued'], required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: 'منتجات مميزة', required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ description: 'منتجات جديدة', required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isNew?: boolean;

  // Price Range
  @ApiProperty({ description: 'السعر الأدنى', minimum: 0, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiProperty({ description: 'السعر الأعلى', minimum: 0, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  // Rating
  @ApiProperty({ description: 'التقييم الأدنى', minimum: 0, maximum: 5, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  // Attributes (JSON string)
  @ApiProperty({ 
    description: 'السمات (JSON)', 
    example: '{"color": "red", "size": "large"}',
    required: false 
  })
  @IsOptional()
  @IsString()
  attributes?: string; // JSON string

  // Tags
  @ApiProperty({ description: 'الوسوم', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  // Sorting
  @ApiProperty({ description: 'ترتيب حسب', enum: ProductSortBy, required: false })
  @IsOptional()
  @IsEnum(ProductSortBy)
  sortBy?: ProductSortBy = ProductSortBy.RELEVANCE;

  @ApiProperty({ description: 'اتجاه الترتيب', enum: SortOrder, required: false })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  // Pagination
  @ApiProperty({ description: 'رقم الصفحة', minimum: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'عدد النتائج', minimum: 1, maximum: 100, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  // Faceted Search
  @ApiProperty({ description: 'إرجاع الـ Facets', required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeFacets?: boolean = false;
}

// ==================== Response DTOs ====================
export class SearchResultDto {
  type: 'product' | 'category' | 'brand';
  id: string;
  title: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  thumbnail?: string;
  metadata?: Record<string, any>;
  relevanceScore?: number;
  createdAt?: Date;
}

export class FacetDto {
  field: string;
  values: Array<{
    value: string;
    count: number;
  }>;
}

export class ProductSearchResultDto {
  results: SearchResultDto[];
  total: number;
  page: number;
  totalPages: number;
  facets?: FacetDto[];
  priceRange?: {
    min: number;
    max: number;
  };
}
