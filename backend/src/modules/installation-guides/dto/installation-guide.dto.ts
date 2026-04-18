import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInstallationGuideDto {
  @ApiProperty({ description: 'Arabic title' })
  @IsString()
  @IsNotEmpty()
  titleAr!: string;

  @ApiProperty({ description: 'English title' })
  @IsString()
  @IsNotEmpty()
  titleEn!: string;

  @ApiProperty({ description: 'Arabic tag' })
  @IsString()
  @IsNotEmpty()
  tagAr!: string;

  @ApiProperty({ description: 'English tag' })
  @IsString()
  @IsNotEmpty()
  tagEn!: string;

  @ApiProperty({ description: 'Arabic description' })
  @IsString()
  @IsNotEmpty()
  descriptionAr!: string;

  @ApiProperty({ description: 'English description' })
  @IsString()
  @IsNotEmpty()
  descriptionEn!: string;

  @ApiProperty({ description: 'Media ID for cover image' })
  @IsMongoId()
  coverImageId!: string;

  @ApiProperty({ description: 'Bunny Stream video ID/GUID' })
  @IsString()
  @IsNotEmpty()
  videoId!: string;

  @ApiPropertyOptional({ description: 'Linked product ID', nullable: true })
  @IsOptional()
  @IsMongoId()
  linkedProductId?: string | null;

  @ApiPropertyOptional({ description: 'Display order', default: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Active status', default: true })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateInstallationGuideDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  titleAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  titleEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  tagAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  tagEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  descriptionAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  descriptionEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  coverImageId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  videoId?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsMongoId()
  linkedProductId?: string | null;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class ToggleInstallationGuideDto {
  @ApiProperty({ description: 'Target active status' })
  @Type(() => Boolean)
  @IsBoolean()
  isActive!: boolean;
}

export class ListInstallationGuidesDto {
  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    default: 'sortOrder',
    enum: [
      'sortOrder',
      'titleAr',
      'titleEn',
      'tagAr',
      'tagEn',
      'isActive',
      'createdAt',
      'updatedAt',
    ],
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ default: 'asc', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

export class InstallationGuideVideoDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  url!: string;

  @ApiPropertyOptional()
  embedUrl?: string;

  @ApiPropertyOptional()
  hlsUrl?: string;

  @ApiPropertyOptional()
  mp4Url?: string;

  @ApiPropertyOptional()
  thumbnailUrl?: string;

  @ApiProperty({ enum: ['processing', 'ready', 'failed'] })
  status!: 'processing' | 'ready' | 'failed';
}

export class InstallationGuideLinkedProductDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  nameEn!: string;

  @ApiPropertyOptional()
  mainImageUrl?: string;
}

export class InstallationGuideListItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  titleAr!: string;

  @ApiProperty()
  titleEn!: string;

  @ApiProperty()
  tagAr!: string;

  @ApiProperty()
  tagEn!: string;

  @ApiPropertyOptional()
  coverImageUrl?: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  sortOrder!: number;

  @ApiProperty()
  updatedAt!: Date;
}

export class InstallationGuideDetailDto extends InstallationGuideListItemDto {
  @ApiProperty()
  descriptionAr!: string;

  @ApiProperty()
  descriptionEn!: string;

  @ApiProperty()
  coverImageId!: string;

  @ApiProperty()
  videoId!: string;

  @ApiPropertyOptional({ nullable: true })
  linkedProductId?: string | null;

  @ApiPropertyOptional({ type: InstallationGuideVideoDto })
  video?: InstallationGuideVideoDto;

  @ApiPropertyOptional({ type: InstallationGuideLinkedProductDto, nullable: true })
  linkedProduct?: InstallationGuideLinkedProductDto | null;

  @ApiProperty()
  createdAt!: Date;
}

