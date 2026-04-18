import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateTejoSettingsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  webPilotEnabled?: boolean;

  @ApiProperty({ required: false, type: [String], description: 'Ordered provider names' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  providerOrder?: string[];

  @ApiProperty({ required: false, description: 'Confidence threshold for human handoff' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  threshold?: number;

  @ApiProperty({ required: false, description: 'Gemini API key (kept server-side)' })
  @IsOptional()
  @IsString()
  geminiApiKey?: string;

  @ApiProperty({ required: false, description: 'Gemini chat model', example: 'gemini-2.5-pro' })
  @IsOptional()
  @IsString()
  geminiChatModel?: string;

  @ApiProperty({
    required: false,
    description: 'Gemini embedding model',
    example: 'gemini-embedding-001',
  })
  @IsOptional()
  @IsString()
  geminiEmbeddingModel?: string;

  @ApiProperty({ required: false, description: 'Gemini base URL override' })
  @IsOptional()
  @IsString()
  geminiBaseUrl?: string;
}

