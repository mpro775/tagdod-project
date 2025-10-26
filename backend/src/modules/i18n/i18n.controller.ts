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
import { I18nService } from './i18n.service';
import {
  CreateTranslationDto,
  UpdateTranslationDto,
  TranslationsQueryDto,
  TranslationDto,
  TranslationStatsDto,
  BulkImportDto,
  ExportTranslationsDto,
  Language,
  TranslationNamespace,
} from './dto/i18n.dto';

@ApiTags('إدارة نصوص التعريب')
@Controller('i18n')
export class I18nController {
  constructor(private readonly i18nService: I18nService) {}

  // ==================== Public Endpoints ====================

  @Get('public/translations/:lang')
  @ApiOperation({
    summary: 'الحصول على جميع الترجمات للغة معينة (عام)',
    description: 'يستخدم من قبل Frontend لتحميل الترجمات',
  })
  @ApiParam({ name: 'lang', enum: Language, description: 'اللغة' })
  @ApiQuery({ 
    name: 'namespace', 
    enum: TranslationNamespace, 
    required: false,
    description: 'تحديد مساحة معينة (اختياري)'
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد الترجمات بنجاح',
  })
  async getPublicTranslations(
    @Param('lang') lang: Language,
    @Query('namespace') namespace?: TranslationNamespace,
  ): Promise<Record<string, string>> {
    return this.i18nService.getTranslationsForLanguage(lang, namespace);
  }

  @Get('public/all')
  @ApiOperation({
    summary: 'الحصول على جميع الترجمات مجمعة (عام)',
    description: 'جميع الترجمات مجمعة حسب المساحة واللغة',
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد الترجمات بنجاح',
  })
  async getAllPublicTranslations(): Promise<Record<string, { ar: Record<string, string>; en: Record<string, string> }>> {
    return this.i18nService.getAllTranslationsGrouped();
  }

  // ==================== Admin Endpoints ====================

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: 'إنشاء ترجمة جديدة',
    description: 'إضافة ترجمة جديدة للنظام',
  })
  @ApiBody({ type: CreateTranslationDto })
  @ApiResponse({
    status: 201,
    description: 'تم إنشاء الترجمة بنجاح',
    type: TranslationDto,
  })
  async createTranslation(
    @Body() dto: CreateTranslationDto,
    @Request() req: Express.Request & { user: { userId: string } },
  ): Promise<TranslationDto> {
    const userId = req.user.userId;
    return this.i18nService.createTranslation(dto, userId);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: 'الحصول على قائمة الترجمات',
    description: 'استرداد الترجمات مع التصفية',
  })
  @ApiQuery({ name: 'namespace', enum: TranslationNamespace, required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'missingOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'missingLanguage', enum: Language, required: false })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد الترجمات بنجاح',
    type: [TranslationDto],
  })
  async getTranslations(
    @Query() query: TranslationsQueryDto,
  ): Promise<TranslationDto[]> {
    return this.i18nService.getTranslations(query);
  }

  @Get('statistics')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: 'الحصول على إحصائيات الترجمات',
    description: 'تحليلات شاملة عن الترجمات ونسبة الاكتمال',
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد الإحصائيات بنجاح',
    type: TranslationStatsDto,
  })
  async getStatistics(): Promise<TranslationStatsDto> {
    return this.i18nService.getStatistics();
  }

  @Post('bulk-import')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: 'استيراد ترجمات بالجملة',
    description: 'استيراد ملف JSON يحتوي على ترجمات متعددة',
  })
  @ApiBody({ type: BulkImportDto })
  @ApiResponse({
    status: 200,
    description: 'تم الاستيراد بنجاح',
  })
  async bulkImport(
    @Body() dto: BulkImportDto,
    @Request() req: Express.Request & { user: { userId: string } },
  ) {
    const userId = req.user.userId;
    const result = await this.i18nService.bulkImport(dto, userId);
    return {
      message: 'تم الاستيراد بنجاح',
      ...result,
    };
  }

  @Get('export')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: 'تصدير الترجمات',
    description: 'تصدير الترجمات بصيغ مختلفة (JSON, CSV)',
  })
  @ApiQuery({ name: 'namespace', enum: TranslationNamespace, required: false })
  @ApiQuery({ name: 'format', enum: ['json', 'csv'], required: false })
  @ApiQuery({ name: 'language', enum: [...Object.values(Language), 'both'], required: false })
  @ApiResponse({
    status: 200,
    description: 'تم التصدير بنجاح',
  })
  async exportTranslations(@Query() dto: ExportTranslationsDto) {
    const data = await this.i18nService.exportTranslations(dto);
    return {
      data,
      format: dto.format || 'json',
      message: 'تم التصدير بنجاح',
    };
  }

  @Get(':key')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: 'الحصول على ترجمة بالمفتاح',
    description: 'استرداد تفاصيل ترجمة معينة',
  })
  @ApiParam({ name: 'key', description: 'مفتاح الترجمة' })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد الترجمة بنجاح',
    type: TranslationDto,
  })
  async getTranslationByKey(@Param('key') key: string): Promise<TranslationDto> {
    return this.i18nService.getTranslationByKey(key);
  }

  @Put(':key')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: 'تحديث ترجمة',
    description: 'تعديل ترجمة موجودة',
  })
  @ApiParam({ name: 'key', description: 'مفتاح الترجمة' })
  @ApiBody({ type: UpdateTranslationDto })
  @ApiResponse({
    status: 200,
    description: 'تم تحديث الترجمة بنجاح',
    type: TranslationDto,
  })
  async updateTranslation(
    @Param('key') key: string,
    @Body() dto: UpdateTranslationDto,
    @Request() req: Express.Request & { user: { userId: string } },
  ): Promise<TranslationDto> {
    const userId = req.user.userId;
    return this.i18nService.updateTranslation(key, dto, userId);
  }

  @Delete(':key')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: 'حذف ترجمة',
    description: 'حذف ترجمة من النظام',
  })
  @ApiParam({ name: 'key', description: 'مفتاح الترجمة' })
  @ApiResponse({
    status: 200,
    description: 'تم حذف الترجمة بنجاح',
  })
  async deleteTranslation(@Param('key') key: string) {
    await this.i18nService.deleteTranslation(key);
    return { message: 'تم حذف الترجمة بنجاح' };
  }
}

