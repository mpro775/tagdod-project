import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AboutService } from './about.service';
import { AboutResponseDto } from './dto/about.dto';

@ApiTags('من-نحن-العام')
@Controller('about/public')
export class AboutPublicController {
  constructor(private readonly aboutService: AboutService) {}

  @Get()
  @ApiOperation({
    summary: 'جلب صفحة من نحن',
    description: 'الحصول على بيانات صفحة من نحن النشطة (عام - بدون مصادقة)',
  })
  @ApiResponse({
    status: 200,
    description: 'تم جلب البيانات بنجاح',
    type: AboutResponseDto,
  })
  @ApiResponse({ status: 404, description: 'صفحة من نحن غير متوفرة' })
  async get(): Promise<AboutResponseDto> {
    return this.aboutService.getPublic();
  }

  @Get('phone')
  @ApiOperation({
    summary: 'جلب رقم الهاتف',
    description: 'الحصول على رقم الهاتف من صفحة من نحن',
  })
  @ApiResponse({
    status: 200,
    description: 'تم جلب رقم الهاتف بنجاح',
    type: String,
  })
  @ApiResponse({ status: 404, description: 'صفحة من نحن غير متوفرة' })
  async getPhone(): Promise<string> {
    return this.aboutService.getPhone();
  }
}

