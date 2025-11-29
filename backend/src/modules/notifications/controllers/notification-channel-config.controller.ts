import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { NotificationChannelConfigService } from '../services/notification-channel-config.service';
import {
  CreateChannelConfigDto,
  UpdateChannelConfigDto,
} from '../dto/unified-notification.dto';
import { NotificationType } from '../enums/notification.enums';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { UserRole } from '../../users/schemas/user.schema';
import { AdminGuard } from '../../../shared/guards/admin.guard';

interface RequestUser {
  id: string;
  sub: string;
  userId: string;
  phone: string;
  isAdmin: boolean;
  role?: string;
  isEngineer?: boolean;
  roles?: string[];
  permissions?: string[];
  preferredCurrency?: string;
}

interface AuthenticatedRequest extends ExpressRequest {
  user: RequestUser;
}

@ApiTags('إعدادات قنوات الإشعارات')
@Controller('notifications/admin/channel-configs')
@UseGuards(JwtAuthGuard, AdminGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@ApiBearerAuth()
export class NotificationChannelConfigController {
  constructor(
    private readonly channelConfigService: NotificationChannelConfigService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'الإدارة: قائمة جميع إعدادات القنوات',
    description: 'استرداد قائمة بجميع إعدادات القنوات لأنواع الإشعارات (للإداريين فقط)',
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد الإعدادات بنجاح',
  })
  async getAllConfigs() {
    const configs = await this.channelConfigService.getAllConfigs();
    return {
      success: true,
      data: configs,
    };
  }

  @Get(':type')
  @ApiOperation({
    summary: 'الإدارة: إعدادات قناة لنوع محدد',
    description: 'استرداد إعدادات القناة لنوع إشعار محدد (للإداريين فقط)',
  })
  @ApiParam({
    name: 'type',
    description: 'نوع الإشعار',
    enum: NotificationType,
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد الإعدادات بنجاح',
  })
  @ApiResponse({
    status: 404,
    description: 'الإعدادات غير موجودة',
  })
  async getConfigByType(@Param('type') type: NotificationType) {
    const config = await this.channelConfigService.getConfigByType(type);
    if (!config) {
      return {
        success: false,
        message: 'Configuration not found',
        data: null,
      };
    }
    return {
      success: true,
      data: config,
    };
  }

  @Post()
  @ApiOperation({
    summary: 'الإدارة: إنشاء إعدادات قناة جديدة',
    description: 'إنشاء إعدادات قناة جديدة لنوع إشعار (للإداريين فقط)',
  })
  @ApiBody({ type: CreateChannelConfigDto })
  @ApiResponse({
    status: 201,
    description: 'تم إنشاء الإعدادات بنجاح',
  })
  @ApiResponse({
    status: 400,
    description: 'بيانات غير صحيحة أو الإعدادات موجودة بالفعل',
  })
  async createConfig(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateChannelConfigDto,
  ) {
    const userId = req.user.id;
    const config = await this.channelConfigService.createConfig(dto, userId);
    return {
      success: true,
      data: config,
      message: 'Channel configuration created successfully',
    };
  }

  @Put(':type')
  @ApiOperation({
    summary: 'الإدارة: تحديث إعدادات قناة',
    description: 'تحديث إعدادات القناة لنوع إشعار محدد (للإداريين فقط)',
  })
  @ApiParam({
    name: 'type',
    description: 'نوع الإشعار',
    enum: NotificationType,
  })
  @ApiBody({ type: UpdateChannelConfigDto })
  @ApiResponse({
    status: 200,
    description: 'تم تحديث الإعدادات بنجاح',
  })
  @ApiResponse({
    status: 404,
    description: 'الإعدادات غير موجودة',
  })
  async updateConfig(
    @Request() req: AuthenticatedRequest,
    @Param('type') type: NotificationType,
    @Body() dto: UpdateChannelConfigDto,
  ) {
    const userId = req.user.id;
    const config = await this.channelConfigService.updateConfig(type, dto, userId);
    return {
      success: true,
      data: config,
      message: 'Channel configuration updated successfully',
    };
  }

  @Delete(':type')
  @ApiOperation({
    summary: 'الإدارة: حذف إعدادات قناة',
    description: 'حذف إعدادات القناة لنوع إشعار محدد (للإداريين فقط)',
  })
  @ApiParam({
    name: 'type',
    description: 'نوع الإشعار',
    enum: NotificationType,
  })
  @ApiResponse({
    status: 200,
    description: 'تم حذف الإعدادات بنجاح',
  })
  @ApiResponse({
    status: 404,
    description: 'الإعدادات غير موجودة',
  })
  async deleteConfig(@Param('type') type: NotificationType) {
    const deleted = await this.channelConfigService.deleteConfig(type);
    return {
      success: deleted,
      message: deleted
        ? 'Channel configuration deleted successfully'
        : 'Channel configuration not found',
    };
  }

  @Post('initialize')
  @ApiOperation({
    summary: 'الإدارة: تهيئة القيم الافتراضية',
    description:
      'تهيئة جميع إعدادات القنوات بالقيم الافتراضية من notification-rules.ts (للإداريين فقط)',
  })
  @ApiResponse({
    status: 200,
    description: 'تم تهيئة القيم الافتراضية بنجاح',
  })
  async initializeDefaults(@Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    const result = await this.channelConfigService.initializeDefaults(userId);
    return {
      success: true,
      data: result,
      message: `Initialized ${result.created} new configurations and updated ${result.updated} existing ones`,
    };
  }
}

