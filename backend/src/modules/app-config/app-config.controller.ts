import { Controller, Get, Headers } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
} from '@nestjs/swagger';
import { AppConfigService } from './app-config.service';
import { AppConfigClientResponseDto } from './dto/app-config.dto';

@ApiTags('إعداد التطبيق (عام)')
@Controller('app')
export class AppConfigController {
  constructor(private readonly appConfigService: AppConfigService) {}

  @Get('config')
  @ApiOperation({
    summary: 'سياسة إصدار التطبيق',
    description:
      'إرجاع سياسة النسخ (minVersion, blockedVersions, maintenanceMode, updateUrl) مع shouldUpdate و canUse عند إرسال X-App-Version. عند إرسال X-Platform: android أو ios يُرجَع إعداد تلك المنصة.',
  })
  @ApiHeader({
    name: 'X-App-Version',
    required: false,
    description: 'نسخة التطبيق الحالية (مثلاً 1.0.5) لمقارنة semver',
  })
  @ApiHeader({
    name: 'X-Platform',
    required: false,
    description: 'منصة التطبيق: android أو ios (لإرجاع إعداد المنصة المناسب)',
  })
  @ApiResponse({
    status: 200,
    description: 'سياسة النسخ مع الحقول المحسوبة عند توفر النسخة',
    type: AppConfigClientResponseDto,
  })
  async getConfig(
    @Headers('x-app-version') appVersion?: string,
    @Headers('x-platform') platform?: string,
  ): Promise<AppConfigClientResponseDto> {
    const platformValue =
      platform?.toLowerCase() === 'android' || platform?.toLowerCase() === 'ios'
        ? (platform.toLowerCase() as 'android' | 'ios')
        : undefined;
    return this.appConfigService.getConfigForClient(appVersion, platformValue);
  }
}
