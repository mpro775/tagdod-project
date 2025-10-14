import { 
  IsString, 
  IsOptional, 
  IsBoolean, 
  IsNumber, 
  IsObject,
  MinLength,
  MaxLength,
  IsUrl,
  Min,
  IsIn
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBrandDto {
  @ApiProperty({ example: 'Apple', description: 'Brand name' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'https://example.com/apple-logo.png', description: 'Brand image URL' })
  @IsString()
  image!: string;

  @ApiProperty({ example: 'Leading technology company', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateBrandDto {
  @ApiProperty({ example: 'Apple', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiProperty({ example: 'https://example.com/apple-logo.png', required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ example: 'Leading technology company', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class ListBrandsDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ example: 20, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @ApiProperty({ example: 'Apple', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: 'name', enum: ['name', 'createdAt', 'sortOrder'], required: false })
  @IsOptional()
  @IsIn(['name', 'createdAt', 'sortOrder'])
  sortBy?: 'name' | 'createdAt' | 'sortOrder' = 'sortOrder';

  @ApiProperty({ example: 'asc', enum: ['asc', 'desc'], required: false })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';
}

