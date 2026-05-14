import { Controller, Get, Put, Patch, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { LandingService } from './landing.service';
import {
  CreateLandingSettingsDto,
  UpdateLandingSettingsDto,
  LandingSettingsResponseDto,
} from './dto/landing.dto';

interface JwtUser {
  sub: string;
  phone: string;
  isAdmin: boolean;
  roles?: string[];
  permissions?: string[];
}

interface RequestWithUser {
  user: JwtUser;
}

@ApiTags('إدارة-الصفحة-الرئيسية')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/landing')
export class LandingAdminController {
  constructor(private readonly landingService: LandingService) {}

  @Get('settings')
  @ApiOperation({
    summary: 'جلب إعدادات الصفحة الرئيسية',
    description: 'الحصول على إعدادات الصفحة الرئيسية (للأدمن)',
  })
  @ApiResponse({
    status: 200,
    description: 'تم جلب الإعدادات بنجاح',
    type: LandingSettingsResponseDto,
  })
  async get(): Promise<LandingSettingsResponseDto | null> {
    return this.landingService.getForAdmin();
  }

  @Post('settings')
  @ApiOperation({
    summary: 'إنشاء إعدادات الصفحة الرئيسية',
    description: 'إنشاء إعدادات الصفحة الرئيسية الجديدة (مرة واحدة فقط)',
  })
  @ApiBody({ type: CreateLandingSettingsDto })
  @ApiResponse({
    status: 201,
    description: 'تم إنشاء الإعدادات بنجاح',
    type: LandingSettingsResponseDto,
  })
  @ApiResponse({ status: 409, description: 'الإعدادات موجودة بالفعل' })
  async create(
    @Body() dto: CreateLandingSettingsDto,
    @Req() req: RequestWithUser,
  ): Promise<LandingSettingsResponseDto> {
    return this.landingService.create(dto, req.user.sub);
  }

  @Patch('settings')
  @ApiOperation({
    summary: 'تحديث إعدادات الصفحة الرئيسية',
    description: 'تحديث إعدادات الصفحة الرئيسية',
  })
  @ApiBody({ type: UpdateLandingSettingsDto })
  @ApiResponse({
    status: 200,
    description: 'تم تحديث الإعدادات بنجاح',
    type: LandingSettingsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'الإعدادات غير موجودة' })
  async update(
    @Body() dto: UpdateLandingSettingsDto,
    @Req() req: RequestWithUser,
  ): Promise<LandingSettingsResponseDto> {
    return this.landingService.update(dto, req.user.sub);
  }

  @Post('settings/toggle')
  @ApiOperation({
    summary: 'تفعيل/تعطيل الصفحة الرئيسية',
    description: 'تفعيل أو تعطيل عرض إعدادات الصفحة الرئيسية للعامة',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isPublished: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'تم تحديث الحالة بنجاح',
    type: LandingSettingsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'الإعدادات غير موجودة' })
  async toggle(
    @Body() dto: { isPublished: boolean },
    @Req() req: RequestWithUser,
  ): Promise<LandingSettingsResponseDto> {
    return this.landingService.toggle(dto.isPublished, req.user.sub);
  }

  @Patch('settings/toggle-publish')
  @ApiOperation({
    summary: 'تبديل حالة النشر',
    description: 'تبديل حالة نشر إعدادات الصفحة الرئيسية',
  })
  @ApiResponse({
    status: 200,
    description: 'تم تحديث الحالة بنجاح',
    type: LandingSettingsResponseDto,
  })
  async togglePublish(@Req() req: RequestWithUser): Promise<LandingSettingsResponseDto> {
    const current = await this.landingService.getForAdmin();
    return this.landingService.toggle(!current?.isPublished, req.user.sub);
  }
}
