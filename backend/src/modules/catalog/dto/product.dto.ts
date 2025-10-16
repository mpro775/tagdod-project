import { IsArray, IsBoolean, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString() categoryId!: string;
  @IsString() name!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() brandId?: string;
  @IsOptional() @IsNumber() adminRating?: number = 0;
  @IsOptional() @IsArray() tags?: string[] = [];
  @IsOptional() @IsBoolean() isFeatured?: boolean = false;
  @IsOptional() @IsBoolean() isNew?: boolean = false;
  @IsOptional() @IsIn(['Active','Hidden']) status?: 'Active'|'Hidden' = 'Active';
  @IsOptional() images?: Array<{url: string; sort: number}> = [];
  @IsOptional() specs?: Array<{name: string; value: string}> = [];
}

export class UpdateProductDto {
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() brandId?: string;
  @IsOptional() @IsNumber() adminRating?: number;
  @IsOptional() @IsArray() tags?: string[];
  @IsOptional() @IsBoolean() isFeatured?: boolean;
  @IsOptional() @IsBoolean() isNew?: boolean;
  @IsOptional() @IsIn(['Active','Hidden']) status?: 'Active'|'Hidden';
  @IsOptional() images?: Array<{url: string; sort: number}>;
  @IsOptional() specs?: Array<{name: string; value: string}>;
}

export class AddVariantDto {
  @IsString() productId!: string;
  @IsString() sku!: string;
  @IsOptional() attributes?: Record<string,string>;
  @IsOptional() @IsString() barcode?: string;
  @IsOptional() @IsIn(['Active','Hidden']) status?: 'Active'|'Hidden' = 'Active';
  @IsOptional() images?: Array<{url: string; sort: number}> = [];
}

export class UpdateVariantDto {
  @IsOptional() @IsString() sku?: string;
  @IsOptional() attributes?: Record<string,string>;
  @IsOptional() @IsString() barcode?: string;
  @IsOptional() @IsIn(['Active','Hidden']) status?: 'Active'|'Hidden';
  @IsOptional() images?: Array<{url: string; sort: number}>;
}

export class SetVariantPriceDto {
  @IsString() variantId!: string;
  @IsNumber() basePriceUSD!: number; // السعر الأساسي بالدولار
  @IsOptional() @IsNumber() compareAtUSD?: number; // السعر المقارن بالدولار
  @IsOptional() @IsNumber() wholesalePriceUSD?: number; // السعر بالجملة بالدولار
  @IsOptional() @IsNumber() moq?: number; // الحد الأدنى للطلب
  @IsOptional() @IsString() notes?: string; // ملاحظات إضافية
}
