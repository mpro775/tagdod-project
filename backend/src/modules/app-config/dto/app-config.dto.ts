import {
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const POLICY_ID = 'default';

export class PlatformPolicyDto {
  @ApiProperty({ description: 'أقل نسخة مسموح بها', example: '1.0.5' })
  minVersion!: string;

  @ApiProperty({ description: 'أحدث نسخة', example: '1.0.6' })
  latestVersion!: string;

  @ApiProperty({
    description: 'نسخ محظورة',
    type: [String],
    example: ['1.0.3', '1.0.4'],
  })
  blockedVersions!: string[];

  @ApiProperty({ description: 'رابط التحديث (متجر)', example: 'https://...' })
  updateUrl!: string;
}

export class AppVersionPolicyDto {
  @ApiProperty({ description: 'أقل نسخة مسموح بها', example: '1.0.5' })
  minVersion!: string;

  @ApiProperty({ description: 'أحدث نسخة', example: '1.0.6' })
  latestVersion!: string;

  @ApiProperty({
    description: 'نسخ محظورة',
    type: [String],
    example: ['1.0.3', '1.0.4'],
  })
  blockedVersions!: string[];

  @ApiProperty({ description: 'إجبار التحديث', example: false })
  forceUpdate!: boolean;

  @ApiProperty({ description: 'وضع الصيانة', example: false })
  maintenanceMode!: boolean;

  @ApiProperty({ description: 'رابط التحديث (متجر)', example: 'https://...' })
  updateUrl!: string;

  @ApiPropertyOptional({ description: 'إعداد أندرويد', type: PlatformPolicyDto })
  android?: PlatformPolicyDto;

  @ApiPropertyOptional({ description: 'إعداد آيفون', type: PlatformPolicyDto })
  ios?: PlatformPolicyDto;
}

export class AppConfigClientResponseDto extends AppVersionPolicyDto {
  @ApiPropertyOptional({
    description: 'يجب تحديث التطبيق (نسخة قديمة أو محظورة)',
    example: false,
  })
  shouldUpdate?: boolean;

  @ApiPropertyOptional({
    description: 'يمكن استخدام التطبيق (لا حظر ولا صيانة)',
    example: true,
  })
  canUse?: boolean;
}

class UpdatePlatformPolicyDto {
  @ApiPropertyOptional({ description: 'أقل نسخة مسموح بها', example: '1.0.5' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  minVersion?: string;

  @ApiPropertyOptional({ description: 'أحدث نسخة', example: '1.0.6' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  latestVersion?: string;

  @ApiPropertyOptional({
    description: 'نسخ محظورة',
    type: [String],
    example: ['1.0.3', '1.0.4'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  blockedVersions?: string[];

  @ApiPropertyOptional({ description: 'رابط التحديث (متجر)' })
  @IsOptional()
  @IsString()
  updateUrl?: string;
}

export class UpdateAppVersionPolicyDto {
  @ApiPropertyOptional({ description: 'أقل نسخة مسموح بها', example: '1.0.5' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  minVersion?: string;

  @ApiPropertyOptional({ description: 'أحدث نسخة', example: '1.0.6' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  latestVersion?: string;

  @ApiPropertyOptional({
    description: 'نسخ محظورة',
    type: [String],
    example: ['1.0.3', '1.0.4'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  blockedVersions?: string[];

  @ApiPropertyOptional({ description: 'إجبار التحديث' })
  @IsOptional()
  @IsBoolean()
  forceUpdate?: boolean;

  @ApiPropertyOptional({ description: 'وضع الصيانة' })
  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;

  @ApiPropertyOptional({ description: 'رابط التحديث (متجر)' })
  @IsOptional()
  @IsString()
  updateUrl?: string;

  @ApiPropertyOptional({ description: 'إعداد أندرويد', type: UpdatePlatformPolicyDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePlatformPolicyDto)
  android?: UpdatePlatformPolicyDto;

  @ApiPropertyOptional({ description: 'إعداد آيفون', type: UpdatePlatformPolicyDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePlatformPolicyDto)
  ios?: UpdatePlatformPolicyDto;
}

export { POLICY_ID };
