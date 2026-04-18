import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export enum TejoPromptStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

export class CreateTejoPromptDto {
  @ApiProperty({ description: 'Prompt name', example: 'tejo-v1-ar-en' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ description: 'Prompt text body' })
  @IsString()
  @MinLength(10)
  body!: string;

  @ApiProperty({ required: false, description: 'Model hint', example: 'provider-a-chat' })
  @IsOptional()
  @IsString()
  modelHint?: string;

  @ApiProperty({ required: false, description: 'Meta configuration object' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @ApiProperty({ required: false, description: 'Activate immediately' })
  @IsOptional()
  @IsBoolean()
  activate?: boolean;
}

export class UpdateTejoPromptDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  modelHint?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @ApiProperty({ required: false, enum: TejoPromptStatus })
  @IsOptional()
  @IsEnum(TejoPromptStatus)
  status?: TejoPromptStatus;

  @ApiProperty({ required: false, description: 'Set this prompt as active' })
  @IsOptional()
  @IsBoolean()
  activate?: boolean;
}

