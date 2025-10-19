import { IsOptional, IsString, IsBoolean, IsNumber, IsArray, Min } from 'class-validator';

export class CreateCategoryDto {
  @IsOptional() 
  @IsString() 
  parentId?: string | null;
  
  @IsString() 
  name!: string; // الاسم بالعربية
  
  @IsString() 
  nameEn!: string; // الاسم بالإنجليزية
  
  @IsOptional() 
  @IsString() 
  description?: string; // الوصف بالعربية
  
  @IsOptional() 
  @IsString() 
  descriptionEn?: string; // الوصف بالإنجليزية
  
  @IsOptional() 
  @IsString() 
  imageId?: string; // من مستودع الصور
  
  @IsOptional() 
  @IsString() 
  metaTitle?: string;
  
  @IsOptional() 
  @IsString() 
  metaDescription?: string;
  
  @IsOptional() 
  @IsArray() 
  @IsString({ each: true }) 
  metaKeywords?: string[];
  
  @IsOptional() 
  @IsNumber() 
  @Min(0) 
  order?: number;
  
  @IsOptional() 
  @IsBoolean() 
  isActive?: boolean = true;
  
  @IsOptional() 
  @IsBoolean() 
  isFeatured?: boolean = false;
}

export class UpdateCategoryDto {
  @IsOptional() 
  @IsString() 
  name?: string; // الاسم بالعربية
  
  @IsOptional() 
  @IsString() 
  nameEn?: string; // الاسم بالإنجليزية
  
  @IsOptional() 
  @IsString() 
  description?: string; // الوصف بالعربية
  
  @IsOptional() 
  @IsString() 
  descriptionEn?: string; // الوصف بالإنجليزية
  
  @IsOptional() 
  @IsString() 
  imageId?: string;
  
  @IsOptional() 
  @IsString() 
  metaTitle?: string;
  
  @IsOptional() 
  @IsString() 
  metaDescription?: string;
  
  @IsOptional() 
  @IsArray() 
  @IsString({ each: true }) 
  metaKeywords?: string[];
  
  @IsOptional() 
  @IsNumber() 
  @Min(0) 
  order?: number;
  
  @IsOptional() 
  @IsBoolean() 
  isActive?: boolean;
  
  @IsOptional() 
  @IsBoolean() 
  isFeatured?: boolean;
}

export class ListCategoriesDto {
  @IsOptional() 
  @IsString() 
  parentId?: string | null;
  
  @IsOptional() 
  @IsString() 
  search?: string;
  
  @IsOptional() 
  @IsBoolean() 
  isActive?: boolean;
  
  @IsOptional() 
  @IsBoolean() 
  isFeatured?: boolean;
  
  @IsOptional() 
  @IsBoolean() 
  includeDeleted?: boolean = false;
}

