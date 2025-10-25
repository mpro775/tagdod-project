import { IsString, IsEnum, IsOptional, IsBoolean, IsNumber, IsArray, Min } from 'class-validator';
import { ProductStatus } from '../schemas/product.schema';

export class CreateProductDto {
  @IsString() name!: string; // الاسم بالعربية
  @IsString() nameEn!: string; // الاسم بالإنجليزية
  @IsString() description!: string; // الوصف بالعربية
  @IsString() descriptionEn!: string; // الوصف بالإنجليزية
  @IsString() categoryId!: string;
  
  @IsOptional() @IsString() brandId?: string;
  @IsOptional() @IsString() sku?: string;
  @IsOptional() @IsString() mainImage?: string;
  @IsOptional() @IsString() mainImageId?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) imageIds?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) images?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) attributes?: string[]; // Attribute IDs
  
  @IsOptional() @IsString() metaTitle?: string;
  @IsOptional() @IsString() metaDescription?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) metaKeywords?: string[];
  
  @IsOptional() @IsEnum(ProductStatus) status?: ProductStatus;
  @IsOptional() @IsBoolean() isFeatured?: boolean;
  @IsOptional() @IsBoolean() isNew?: boolean;
  @IsOptional() @IsBoolean() isBestseller?: boolean;
  @IsOptional() @IsNumber() @Min(0) order?: number;
  
  // حقول المخزون
  @IsOptional() @IsNumber() @Min(0) stock?: number;
  @IsOptional() @IsNumber() @Min(0) minStock?: number;
  @IsOptional() @IsNumber() @Min(0) maxStock?: number;
  @IsOptional() @IsBoolean() trackStock?: boolean;
  @IsOptional() @IsBoolean() allowBackorder?: boolean;
}

export class UpdateProductDto {
  @IsOptional() @IsString() name?: string; // الاسم بالعربية
  @IsOptional() @IsString() nameEn?: string; // الاسم بالإنجليزية
  @IsOptional() @IsString() description?: string; // الوصف بالعربية
  @IsOptional() @IsString() descriptionEn?: string; // الوصف بالإنجليزية
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsString() brandId?: string;
  @IsOptional() @IsString() sku?: string;
  @IsOptional() @IsString() mainImage?: string;
  @IsOptional() @IsString() mainImageId?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) imageIds?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) images?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) attributes?: string[];
  
  @IsOptional() @IsString() metaTitle?: string;
  @IsOptional() @IsString() metaDescription?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) metaKeywords?: string[];
  
  @IsOptional() @IsEnum(ProductStatus) status?: ProductStatus;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsBoolean() isFeatured?: boolean;
  @IsOptional() @IsBoolean() isNew?: boolean;
  @IsOptional() @IsBoolean() isBestseller?: boolean;
  @IsOptional() @IsNumber() @Min(0) order?: number;
  
  // حقول المخزون
  @IsOptional() @IsNumber() @Min(0) stock?: number;
  @IsOptional() @IsNumber() @Min(0) minStock?: number;
  @IsOptional() @IsNumber() @Min(0) maxStock?: number;
  @IsOptional() @IsBoolean() trackStock?: boolean;
  @IsOptional() @IsBoolean() allowBackorder?: boolean;
}

export class ListProductsDto {
  @IsOptional() @IsNumber() @Min(1) page?: number = 1;
  @IsOptional() @IsNumber() @Min(1) limit?: number = 20;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsString() brandId?: string;
  @IsOptional() @IsEnum(ProductStatus) status?: ProductStatus;
  @IsOptional() @IsBoolean() isFeatured?: boolean;
  @IsOptional() @IsBoolean() isNew?: boolean;
  @IsOptional() @IsBoolean() includeDeleted?: boolean;
  @IsOptional() @IsString() sortBy?: string;
  @IsOptional() @IsString() sortOrder?: 'asc' | 'desc';
  
  // فلاتر المخزون
  @IsOptional() @IsBoolean() lowStock?: boolean;
  @IsOptional() @IsBoolean() outOfStock?: boolean;
  @IsOptional() @IsBoolean() trackStock?: boolean;
}

export class CreateVariantDto {
  @IsString() productId!: string;
  @IsOptional() @IsString() sku?: string;
  @IsArray() attributeValues!: Array<{ attributeId: string; valueId: string }>;
  @IsNumber() @Min(0) price!: number;
  @IsOptional() @IsNumber() @Min(0) compareAtPrice?: number;
  @IsOptional() @IsNumber() @Min(0) costPrice?: number;
  @IsNumber() @Min(0) stock!: number;
  @IsOptional() @IsBoolean() trackInventory?: boolean;
  @IsOptional() @IsString() imageId?: string;
  @IsOptional() @IsNumber() weight?: number;
}

export class UpdateVariantDto {
  @IsOptional() @IsString() sku?: string;
  @IsOptional() @IsNumber() @Min(0) price?: number;
  @IsOptional() @IsNumber() @Min(0) compareAtPrice?: number;
  @IsOptional() @IsNumber() @Min(0) stock?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsString() imageId?: string;
}

export class GenerateVariantsDto {
  @IsNumber() @Min(0) defaultPrice!: number;
  @IsNumber() @Min(0) defaultStock!: number;
  @IsOptional() @IsBoolean() overwriteExisting?: boolean;
}

export class UpdateStockDto {
  @IsString() productId!: string;
  @IsNumber() @Min(0) stock!: number;
  @IsOptional() @IsString() reason?: string;
}

export class BulkUpdateStockDto {
  @IsArray() updates!: Array<{
    productId: string;
    stock: number;
    reason?: string;
  }>;
}

export class StockAlertDto {
  @IsOptional() @IsNumber() @Min(0) minStockThreshold?: number;
  @IsOptional() @IsBoolean() includeOutOfStock?: boolean;
  @IsOptional() @IsBoolean() includeLowStock?: boolean;
}

