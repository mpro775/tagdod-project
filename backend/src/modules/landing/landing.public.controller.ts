import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LandingService } from './landing.service';
import { LandingSettingsResponseDto } from './dto/landing.dto';

@ApiTags('الصفحة-الرئيسية-العام')
@Controller('landing')
export class LandingPublicController {
  constructor(private readonly landingService: LandingService) {}

  @Get('settings')
  @ApiOperation({
    summary: 'جلب إعدادات الصفحة الرئيسية',
    description: 'الحصول على إعدادات الصفحة الرئيسية النشطة (عام - بدون مصادقة)',
  })
  @ApiResponse({
    status: 200,
    description: 'تم جلب الإعدادات بنجاح',
    type: LandingSettingsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'الإعدادات غير متوفرة' })
  async get(): Promise<LandingSettingsResponseDto> {
    return this.landingService.getPublic();
  }

  @Get('home')
  @ApiOperation({
    summary: 'بيانات الصفحة الرئيسية',
    description: 'الحصول على جميع بيانات الصفحة الرئيسية دفعة واحدة',
  })
  @ApiResponse({ status: 200, description: 'تم جلب البيانات بنجاح' })
  async getHome(): Promise<LandingSettingsResponseDto> {
    return this.landingService.getPublic();
  }
}
