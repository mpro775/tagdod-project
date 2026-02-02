import {
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const POLICY_ID = 'default';

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
}

export { POLICY_ID };
