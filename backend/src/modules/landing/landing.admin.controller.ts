import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { LandingService } from './landing.service';
import { UpdateLandingSettingsDto } from './dto/landing.dto';

@ApiTags('إعدادات-صفحة-الهبوط')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/landing/settings')
export class LandingAdminController {
  constructor(private readonly landingService: LandingService) {}

  @Get()
  @ApiOperation({
    summary: 'جلب إعدادات صفحة الهبوط',
    description: 'الحصول على إعدادات صفحة الهبوط الحالية',
  })
  @ApiResponse({ status: 200, description: 'تم جلب الإعدادات بنجاح' })
  async getSettings() {
    return this.landingService.getSettings();
  }

  @Put()
  @ApiOperation({
    summary: 'تحديث إعدادات صفحة الهبوط',
    description: 'تحديث إعدادات صفحة الهبوط',
  })
  @ApiBody({ type: UpdateLandingSettingsDto })
  @ApiResponse({ status: 200, description: 'تم تحديث الإعدادات بنجاح' })
  async updateSettings(@Body() dto: UpdateLandingSettingsDto) {
    return this.landingService.updateSettings(dto);
  }
}
