import { IsString, IsOptional, IsEnum, IsArray, IsBoolean } from 'class-validator';
import { SupportCategory } from '../schemas/support-ticket.schema';

export class CreateCannedResponseDto {
  @IsString()
  title!: string;

  @IsString()
  content!: string;

  @IsString()
  contentEn!: string;

  @IsOptional()
  @IsEnum(SupportCategory)
  category?: SupportCategory;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  shortcut?: string; // مثل: /welcome
}

export class UpdateCannedResponseDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  contentEn?: string;

  @IsOptional()
  @IsEnum(SupportCategory)
  category?: SupportCategory;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  shortcut?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

