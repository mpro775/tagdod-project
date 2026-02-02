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
      'إرجاع سياسة النسخ (minVersion, blockedVersions, maintenanceMode, updateUrl) مع shouldUpdate و canUse عند إرسال X-App-Version',
  })
  @ApiHeader({
    name: 'X-App-Version',
    required: false,
    description: 'نسخة التطبيق الحالية (مثلاً 1.0.5) لمقارنة semver',
  })
  @ApiResponse({
    status: 200,
    description: 'سياسة النسخ مع الحقول المحسوبة عند توفر النسخة',
    type: AppConfigClientResponseDto,
  })
  async getConfig(
    @Headers('x-app-version') appVersion?: string,
  ): Promise<AppConfigClientResponseDto> {
    return this.appConfigService.getConfigForClient(appVersion);
  }
}
