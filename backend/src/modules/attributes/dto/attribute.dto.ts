import { IsString, IsEnum, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';
import { AttributeType } from '../schemas/attribute.schema';

export class CreateAttributeDto {
  @IsString()
  name!: string; // الاسم بالعربية

  @IsString()
  nameEn!: string; // الاسم بالإنجليزية

  @IsEnum(AttributeType)
  type!: AttributeType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsBoolean()
  isFilterable?: boolean;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsBoolean()
  showInFilters?: boolean;

  @IsOptional()
  @IsString()
  groupId?: string;
}

export class UpdateAttributeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  nameEn?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFilterable?: boolean;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsBoolean()
  showInFilters?: boolean;

  @IsOptional()
  @IsString()
  groupId?: string;
}

export class CreateAttributeValueDto {
  @IsString()
  value!: string; // القيمة بالعربية

  @IsOptional()
  @IsString()
  valueEn?: string;

  @IsOptional()
  @IsString()
  hexCode?: string; // للألوان

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  imageId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}

export class UpdateAttributeValueDto {
  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsString()
  valueEn?: string;

  @IsOptional()
  @IsString()
  hexCode?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  imageId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

