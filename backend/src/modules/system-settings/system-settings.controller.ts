import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { SystemSettingsService } from './system-settings.service';
import {
  CreateSettingDto,
  UpdateSettingDto,
  SettingDto,
  BulkUpdateSettingsDto,
  SettingCategory,
} from './dto/system-settings.dto';

@ApiTags('إعدادات النظام')
@Controller('system-settings')
export class SystemSettingsController {
  constructor(private readonly systemSettingsService: SystemSettingsService) {}

  // ==================== Public Endpoints ====================

  @Get('public')
  @ApiOperation({
    summary: 'الحصول على الإعدادات العامة (عام)',
    description: 'إعدادات النظام المتاحة للعموم',
  })
  @ApiQuery({ name: 'category', enum: SettingCategory, required: false })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد الإعدادات العامة بنجاح',
  })
  async getPublicSettings(
    @Query('category') category?: SettingCategory,
  ): Promise<Record<string, any>> {
    return this.systemSettingsService.getPublicSettings(category);
  }

  // ==================== Admin Endpoints ====================

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: 'إنشاء إعداد جديد',
    description: 'إضافة إعداد جديد للنظام',
  })
  @ApiBody({ type: CreateSettingDto })
  @ApiResponse({
    status: 201,
    description: 'تم إنشاء الإعداد بنجاح',
    type: SettingDto,
  })
  async createSetting(
    @Body() dto: CreateSettingDto,
    @Request() req: any,
  ): Promise<SettingDto> {
    const userId = req.user.userId;
    return this.systemSettingsService.createSetting(dto, userId);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: 'الحصول على جميع الإعدادات',
    description: 'استرداد جميع إعدادات النظام',
  })
  @ApiQuery({ name: 'category', enum: SettingCategory, required: false })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد الإعدادات بنجاح',
    type: [SettingDto],
  })
  async getAllSettings(
    @Query('category') category?: SettingCategory,
  ): Promise<SettingDto[]> {
    return this.systemSettingsService.getAllSettings(category);
  }

  @Get('category/:category')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: 'الحصول على إعدادات فئة معينة',
    description: 'استرداد الإعدادات حسب الفئة كـ key-value pairs',
  })
  @ApiParam({ name: 'category', enum: SettingCategory })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد إعدادات الفئة بنجاح',
  })
  async getSettingsByCategory(
    @Param('category') category: SettingCategory,
  ): Promise<Record<string, any>> {
    return this.systemSettingsService.getSettingsByCategory(category);
  }

  @Put('bulk')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: 'تحديث عدة إعدادات',
    description: 'تحديث إعدادات متعددة دفعة واحدة',
  })
  @ApiBody({ type: BulkUpdateSettingsDto })
  @ApiResponse({
    status: 200,
    description: 'تم تحديث الإعدادات بنجاح',
  })
  async bulkUpdate(
    @Body() dto: BulkUpdateSettingsDto,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    const result = await this.systemSettingsService.bulkUpdate(dto, userId);
    return {
      message: 'تم تحديث الإعدادات بنجاح',
      ...result,
    };
  }

  @Get(':key')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: 'الحصول على إعداد بالمفتاح',
    description: 'استرداد إعداد معين',
  })
  @ApiParam({ name: 'key', description: 'مفتاح الإعداد' })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد الإعداد بنجاح',
    type: SettingDto,
  })
  async getSetting(@Param('key') key: string): Promise<SettingDto> {
    return this.systemSettingsService.getSetting(key);
  }

  @Put(':key')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: 'تحديث إعداد',
    description: 'تعديل قيمة إعداد موجود',
  })
  @ApiParam({ name: 'key', description: 'مفتاح الإعداد' })
  @ApiBody({ type: UpdateSettingDto })
  @ApiResponse({
    status: 200,
    description: 'تم تحديث الإعداد بنجاح',
    type: SettingDto,
  })
  async updateSetting(
    @Param('key') key: string,
    @Body() dto: UpdateSettingDto,
    @Request() req: any,
  ): Promise<SettingDto> {
    const userId = req.user.userId;
    return this.systemSettingsService.updateSetting(key, dto, userId);
  }

  @Delete(':key')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: 'حذف إعداد',
    description: 'حذف إعداد من النظام',
  })
  @ApiParam({ name: 'key', description: 'مفتاح الإعداد' })
  @ApiResponse({
    status: 200,
    description: 'تم حذف الإعداد بنجاح',
  })
  async deleteSetting(@Param('key') key: string) {
    await this.systemSettingsService.deleteSetting(key);
    return { message: 'تم حذف الإعداد بنجاح' };
  }
}

