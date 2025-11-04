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
import { LocalPaymentAccountService } from './services/local-payment-account.service';
import {
  CreateSettingDto,
  UpdateSettingDto,
  SettingDto,
  BulkUpdateSettingsDto,
  SettingCategory,
} from './dto/system-settings.dto';
import {
  CreateLocalPaymentAccountDto,
  UpdateLocalPaymentAccountDto,
  GroupedPaymentAccountDto,
} from './dto/local-payment-account.dto';
import { LocalPaymentAccount } from './schemas/local-payment-account.schema';

@ApiTags('إعدادات النظام')
@Controller('system-settings')
export class SystemSettingsController {
  constructor(
    private readonly systemSettingsService: SystemSettingsService,
    private readonly localPaymentAccountService: LocalPaymentAccountService,
  ) {}

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
  ): Promise<Record<string, unknown>> {
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
      @Request() req: { user: { userId: string } },
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
  ): Promise<Record<string, unknown>> {
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
    @Request() req: { user: { userId: string } },
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
    @Request() req: { user: { userId: string } },
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

  // ==================== Local Payment Accounts Endpoints ====================

  @Get('payment-accounts')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: 'جميع حسابات الدفع المحلية',
    description: 'الحصول على جميع الحسابات المحلية (مفصلة)',
  })
  @ApiQuery({ name: 'activeOnly', required: false, type: String, description: 'عرض الحسابات المفعلة فقط' })
  @ApiResponse({
    status: 200,
    description: 'تم الحصول على الحسابات بنجاح',
    type: [LocalPaymentAccount],
  })
  async getAllPaymentAccounts(
    @Query('activeOnly') activeOnly?: string,
  ): Promise<LocalPaymentAccount[]> {
    return this.localPaymentAccountService.findAll(activeOnly === 'true');
  }

  @Get('payment-accounts/grouped')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: 'حسابات الدفع المحلية مجمعة',
    description: 'الحصول على الحسابات المحلية مجمعة حسب اسم البنك',
  })
  @ApiQuery({ name: 'activeOnly', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'تم الحصول على الحسابات المجمعة بنجاح',
    type: [GroupedPaymentAccountDto],
  })
  async getGroupedPaymentAccounts(
    @Query('activeOnly') activeOnly?: string,
  ): Promise<GroupedPaymentAccountDto[]> {
    return this.localPaymentAccountService.findGrouped(activeOnly === 'true');
  }

  @Get('payment-accounts/public')
  @ApiOperation({
    summary: 'حسابات الدفع المتاحة (عام)',
    description: 'عرض حسابات الدفع المحلية للعملاء - مجمعة حسب البنك',
  })
  @ApiQuery({ name: 'currency', required: false, type: String, description: 'فلترة حسب العملة' })
  @ApiResponse({
    status: 200,
    description: 'تم الحصول على الحسابات العامة بنجاح',
    type: [GroupedPaymentAccountDto],
  })
  async getPublicPaymentAccounts(
    @Query('currency') currency?: string,
  ): Promise<GroupedPaymentAccountDto[]> {
    if (currency) {
      return this.localPaymentAccountService.findByCurrency(currency, true);
    }
    return this.localPaymentAccountService.findGrouped(true);
  }

  @Post('payment-accounts')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: 'إنشاء حساب دفع محلي',
    description: 'إضافة حساب دفع محلي جديد',
  })
  @ApiBody({ type: CreateLocalPaymentAccountDto })
  @ApiResponse({
    status: 201,
    description: 'تم إنشاء الحساب بنجاح',
    type: LocalPaymentAccount,
  })
  async createPaymentAccount(
    @Body() dto: CreateLocalPaymentAccountDto,
    @Request() req: { user: { userId: string } },
  ): Promise<LocalPaymentAccount> {
    return this.localPaymentAccountService.create(dto, req.user.userId);
  }

  @Put('payment-accounts/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: 'تحديث حساب دفع محلي',
    description: 'تعديل حساب دفع محلي موجود',
  })
  @ApiParam({ name: 'id', description: 'معرف الحساب' })
  @ApiBody({ type: UpdateLocalPaymentAccountDto })
  @ApiResponse({
    status: 200,
    description: 'تم تحديث الحساب بنجاح',
    type: LocalPaymentAccount,
  })
  async updatePaymentAccount(
    @Param('id') id: string,
    @Body() dto: UpdateLocalPaymentAccountDto,
    @Request() req: { user: { userId: string } },
  ): Promise<LocalPaymentAccount> {
    return this.localPaymentAccountService.update(id, dto, req.user.userId);
  }

  @Delete('payment-accounts/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: 'حذف حساب دفع محلي',
    description: 'حذف حساب دفع محلي من النظام',
  })
  @ApiParam({ name: 'id', description: 'معرف الحساب' })
  @ApiResponse({
    status: 200,
    description: 'تم حذف الحساب بنجاح',
  })
  async deletePaymentAccount(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.localPaymentAccountService.delete(id);
    return { message: 'تم حذف الحساب بنجاح' };
  }
}

