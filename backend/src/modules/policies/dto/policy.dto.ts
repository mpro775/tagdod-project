import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PolicyType } from '../schemas/policy.schema';

export class CreatePolicyDto {
  @ApiProperty({ enum: PolicyType, description: 'نوع السياسة' })
  @IsEnum(PolicyType)
  @IsNotEmpty()
  type!: PolicyType;

  @ApiProperty({ description: 'العنوان بالعربية' })
  @IsString()
  @IsNotEmpty()
  titleAr!: string;

  @ApiProperty({ description: 'العنوان بالإنجليزية' })
  @IsString()
  @IsNotEmpty()
  titleEn!: string;

  @ApiProperty({ description: 'المحتوى بالعربية (HTML)' })
  @IsString()
  @IsNotEmpty()
  contentAr!: string;

  @ApiProperty({ description: 'المحتوى بالإنجليزية (HTML)' })
  @IsString()
  @IsNotEmpty()
  contentEn!: string;

  @ApiPropertyOptional({ description: 'حالة النشر', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePolicyDto {
  @ApiPropertyOptional({ description: 'العنوان بالعربية' })
  @IsOptional()
  @IsString()
  titleAr?: string;

  @ApiPropertyOptional({ description: 'العنوان بالإنجليزية' })
  @IsOptional()
  @IsString()
  titleEn?: string;

  @ApiPropertyOptional({ description: 'المحتوى بالعربية (HTML)' })
  @IsOptional()
  @IsString()
  contentAr?: string;

  @ApiPropertyOptional({ description: 'المحتوى بالإنجليزية (HTML)' })
  @IsOptional()
  @IsString()
  contentEn?: string;

  @ApiPropertyOptional({ description: 'حالة النشر' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class PolicyResponseDto {
  @ApiProperty()
  _id!: string;

  @ApiProperty({ enum: PolicyType })
  type!: PolicyType;

  @ApiProperty()
  titleAr!: string;

  @ApiProperty()
  titleEn!: string;

  @ApiProperty()
  contentAr!: string;

  @ApiProperty()
  contentEn!: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  lastUpdatedBy!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class TogglePolicyDto {
  @ApiProperty({ description: 'حالة النشر' })
  @IsBoolean()
  @IsNotEmpty()
  isActive!: boolean;
}
