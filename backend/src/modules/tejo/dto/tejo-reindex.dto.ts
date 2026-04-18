import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export enum TejoReindexScope {
  PRODUCTS = 'products',
  KB = 'kb',
  ALL = 'all',
}

export class TejoReindexDto {
  @ApiProperty({ enum: TejoReindexScope, required: false, default: TejoReindexScope.ALL })
  @IsOptional()
  @IsEnum(TejoReindexScope)
  scope?: TejoReindexScope;

  @ApiProperty({ required: false, default: false, description: 'Full rebuild or incremental rebuild' })
  @IsOptional()
  @IsBoolean()
  full?: boolean;

  @ApiProperty({ required: false, description: 'Optional reason for audit log' })
  @IsOptional()
  @IsString()
  reason?: string;
}

