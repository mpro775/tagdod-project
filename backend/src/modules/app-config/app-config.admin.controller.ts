import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { AppConfigService } from './app-config.service';
import {
  AppVersionPolicyDto,
  UpdateAppVersionPolicyDto,
} from './dto/app-config.dto';

interface JwtUser {
  sub: string;
  userId?: string;
  phone?: string;
  isAdmin?: boolean;
  roles?: string[];
}

interface RequestWithUser {
  user: JwtUser;
}

@ApiTags('إدارة-إعداد-التطبيق')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/app-config')
export class AppConfigAdminController {
  constructor(private readonly appConfigService: AppConfigService) {}

  @Get()
  @ApiOperation({
    summary: 'جلب سياسة إصدار التطبيق',
    description: 'الحصول على سياسة النسخ (للأدمن)',
  })
  @ApiResponse({
    status: 200,
    description: 'تم جلب السياسة بنجاح',
    type: AppVersionPolicyDto,
  })
  async get(): Promise<AppVersionPolicyDto> {
    return this.appConfigService.getPolicy();
  }

  @Put()
  @ApiOperation({
    summary: 'تحديث سياسة إصدار التطبيق',
    description: 'تحديث minVersion, blockedVersions, maintenanceMode, updateUrl، إلخ',
  })
  @ApiBody({ type: UpdateAppVersionPolicyDto })
  @ApiResponse({
    status: 200,
    description: 'تم تحديث السياسة بنجاح',
    type: AppVersionPolicyDto,
  })
  async update(
    @Body() dto: UpdateAppVersionPolicyDto,
    @Req() req: RequestWithUser,
  ): Promise<AppVersionPolicyDto> {
    const userId = req.user?.userId ?? req.user?.sub ?? 'admin';
    return this.appConfigService.updatePolicy(dto, userId);
  }
}
