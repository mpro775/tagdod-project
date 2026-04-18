import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsObject, IsOptional, IsString, Max, MinLength } from 'class-validator';

export class CreateTejoKnowledgeDto {
  @ApiProperty({ description: 'Knowledge unique key', example: 'faq_delivery_hours' })
  @IsString()
  @MinLength(2)
  key!: string;

  @ApiProperty({ description: 'Knowledge text body' })
  @IsString()
  @MinLength(5)
  text!: string;

  @ApiProperty({ required: false, example: 'ar' })
  @IsOptional()
  @IsString()
  locale?: string;

  @ApiProperty({ required: false, description: 'Optional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateTejoKnowledgeDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(5)
  text?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  locale?: string;

  @ApiProperty({ required: false, description: 'Optional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class ListTejoKnowledgeQueryDto {
  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiProperty({ required: false, example: 20 })
  @IsOptional()
  @Type(() => Number)
  @Max(200)
  limit?: number;

  @ApiProperty({ required: false, description: 'Search in key and text' })
  @IsOptional()
  @IsString()
  q?: string;
}
