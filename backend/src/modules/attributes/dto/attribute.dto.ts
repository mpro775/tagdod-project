import { IsString, IsEnum, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttributeType } from '../schemas/attribute.schema';

export class CreateAttributeDto {
  @ApiProperty({
    description: 'اسم السمة باللغة العربية',
    example: 'اللون',
    minLength: 1,
    maxLength: 100
  })
  @IsString()
  name!: string; // الاسم بالعربية

  @ApiProperty({
    description: 'اسم السمة باللغة الإنجليزية',
    example: 'Color',
    minLength: 1,
    maxLength: 100
  })
  @IsString()
  nameEn!: string; // الاسم بالإنجليزية

  @ApiProperty({
    description: 'نوع السمة',
    enum: AttributeType,
    example: AttributeType.SELECT,
    enumName: 'AttributeType'
  })
  @IsEnum(AttributeType)
  type!: AttributeType;

  @ApiPropertyOptional({
    description: 'وصف السمة',
    example: 'لون المنتج',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'ترتيب العرض (للتنظيم)',
    example: 1,
    minimum: 0,
    default: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({
    description: 'هل السمة قابلة للفلترة في الواجهة؟',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isFilterable?: boolean;

  @ApiPropertyOptional({
    description: 'هل السمة إلزامية عند إنشاء منتج؟',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({
    description: 'هل تظهر السمة في الفلاتر الجانبية؟',
    example: true,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  showInFilters?: boolean;

  @ApiPropertyOptional({
    description: 'معرف مجموعة السمات (للتنظيم)',
    example: '64a1b2c3d4e5f6789abcdef1'
  })
  @IsOptional()
  @IsString()
  groupId?: string;
}

export class UpdateAttributeDto {
  @ApiPropertyOptional({
    description: 'اسم السمة باللغة العربية',
    example: 'اللون المحدث',
    minLength: 1,
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'اسم السمة باللغة الإنجليزية',
    example: 'Updated Color',
    minLength: 1,
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiPropertyOptional({
    description: 'نوع السمة',
    enum: AttributeType,
    enumName: 'AttributeType',
    example: AttributeType.SELECT,
  })
  @IsOptional()
  @IsEnum(AttributeType)
  type?: AttributeType;

  @ApiPropertyOptional({
    description: 'وصف السمة',
    example: 'لون المنتج المحدث',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'ترتيب العرض (للتنظيم)',
    example: 2,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({
    description: 'هل السمة نشطة؟',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'هل السمة قابلة للفلترة في الواجهة؟',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  isFilterable?: boolean;

  @ApiPropertyOptional({
    description: 'هل السمة إلزامية عند إنشاء منتج؟',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({
    description: 'هل تظهر السمة في الفلاتر الجانبية؟',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  showInFilters?: boolean;

  @ApiPropertyOptional({
    description: 'معرف مجموعة السمات (للتنظيم)',
    example: '64a1b2c3d4e5f6789abcdef1'
  })
  @IsOptional()
  @IsString()
  groupId?: string;
}

export class CreateAttributeValueDto {
  @ApiProperty({
    description: 'القيمة باللغة العربية',
    example: 'أحمر',
    minLength: 1,
    maxLength: 100
  })
  @IsString()
  value!: string; // القيمة بالعربية

  @ApiPropertyOptional({
    description: 'القيمة باللغة الإنجليزية',
    example: 'Red',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  valueEn?: string;

  @ApiPropertyOptional({
    description: 'كود اللون (Hex Code) - للألوان',
    example: '#FF0000',
    pattern: '^#[0-9A-Fa-f]{6}$'
  })
  @IsOptional()
  @IsString()
  hexCode?: string; // للألوان

  @ApiPropertyOptional({
    description: 'رابط الصورة',
    example: 'https://example.com/images/red-color.jpg',
    format: 'uri'
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'معرف الصورة في النظام',
    example: 'img_123456789'
  })
  @IsOptional()
  @IsString()
  imageId?: string;

  @ApiPropertyOptional({
    description: 'وصف القيمة',
    example: 'اللون الأحمر الفاتح',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'ترتيب العرض',
    example: 1,
    minimum: 0,
    default: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}

export class UpdateAttributeValueDto {
  @ApiPropertyOptional({
    description: 'القيمة باللغة العربية',
    example: 'أحمر داكن',
    minLength: 1,
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  value?: string;

  @ApiPropertyOptional({
    description: 'القيمة باللغة الإنجليزية',
    example: 'Dark Red',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  valueEn?: string;

  @ApiPropertyOptional({
    description: 'كود اللون (Hex Code) - للألوان',
    example: '#CC0000',
    pattern: '^#[0-9A-Fa-f]{6}$'
  })
  @IsOptional()
  @IsString()
  hexCode?: string;

  @ApiPropertyOptional({
    description: 'رابط الصورة',
    example: 'https://example.com/images/dark-red-color.jpg',
    format: 'uri'
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'معرف الصورة في النظام',
    example: 'img_987654321'
  })
  @IsOptional()
  @IsString()
  imageId?: string;

  @ApiPropertyOptional({
    description: 'وصف القيمة',
    example: 'اللون الأحمر الداكن',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'ترتيب العرض',
    example: 2,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({
    description: 'هل القيمة نشطة؟',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

