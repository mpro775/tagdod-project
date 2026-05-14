import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LandingService } from './landing.service';
import { UpdateLandingSettingsDto, LandingHomeQueryDto } from './dto/landing.dto';

@ApiTags('الصفحة-الرئيسية-العام')
@Controller('landing')
export class LandingPublicController {
  constructor(private readonly landingService: LandingService) {}

  @Get('home')
  @ApiOperation({
    summary: 'بيانات الصفحة الرئيسية',
    description: 'الحصول على جميع بيانات الصفحة الرئيسية دفعة واحدة',
  })
  @ApiResponse({ status: 200, description: 'تم جلب البيانات بنجاح' })
  async getHome() {
    return this.landingService.getHomeData();
  }

  @Post('contact')
  @ApiOperation({
    summary: 'إرسال طلب تواصل',
    description: 'إرسال طلب تواصل جديد من الصفحة الرئيسية',
  })
  @ApiBody({ type: UpdateLandingSettingsDto })
  @ApiResponse({ status: 201, description: 'تم إرسال طلب التواصل بنجاح' })
  async submitContact(@Body() dto: UpdateLandingSettingsDto) {
    return dto;
  }
}
