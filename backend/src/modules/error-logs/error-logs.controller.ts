import {
  Controller,
  Get,
  Post,
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
import { ErrorLogsService } from './error-logs.service';
import {
  ErrorLogsQueryDto,
  CreateErrorLogDto,
  ErrorStatisticsDto,
  ErrorTrendDto,
  ErrorLogDto,
  LogsExportDto,
  ErrorLevel,
  ErrorCategory,
} from './dto/error-logs.dto';

@ApiTags('إدارة الأخطاء والسجلات')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('error-logs')
export class ErrorLogsController {
  constructor(private readonly errorLogsService: ErrorLogsService) {}

  @Post()
  @ApiOperation({
    summary: 'إنشاء سجل خطأ جديد',
    description: 'تسجيل خطأ جديد في النظام',
  })
  @ApiBody({ type: CreateErrorLogDto })
  @ApiResponse({
    status: 201,
    description: 'تم إنشاء سجل الخطأ بنجاح',
    type: ErrorLogDto,
  })
  async createErrorLog(@Body() dto: CreateErrorLogDto): Promise<ErrorLogDto> {
    return this.errorLogsService.createErrorLog(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'الحصول على قائمة الأخطاء',
    description: 'استرداد سجلات الأخطاء مع التصفية والترتيب',
  })
  @ApiQuery({ name: 'level', enum: ErrorLevel, required: false })
  @ApiQuery({ name: 'category', enum: ErrorCategory, required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد سجلات الأخطاء بنجاح',
  })
  async getErrorLogs(@Query() query: ErrorLogsQueryDto) {
    return this.errorLogsService.getErrorLogs(query);
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'الحصول على إحصائيات الأخطاء',
    description: 'استرداد تحليلات شاملة للأخطاء',
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد الإحصائيات بنجاح',
    type: ErrorStatisticsDto,
  })
  async getStatistics(): Promise<ErrorStatisticsDto> {
    return this.errorLogsService.getErrorStatistics();
  }

  @Get('trends')
  @ApiOperation({
    summary: 'الحصول على اتجاهات الأخطاء',
    description: 'تحليل اتجاه الأخطاء عبر الزمن',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'عدد الأيام للتحليل',
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد اتجاهات الأخطاء بنجاح',
    type: ErrorTrendDto,
  })
  async getErrorTrend(@Query('days') days?: number): Promise<ErrorTrendDto> {
    return this.errorLogsService.getErrorTrend(days ? Number(days) : 7);
  }

  @Get('export')
  @ApiOperation({
    summary: 'تصدير سجلات الأخطاء',
    description: 'تصدير السجلات بصيغ مختلفة (JSON, CSV, TXT)',
  })
  @ApiQuery({ name: 'format', enum: ['json', 'csv', 'txt'], required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'level', enum: ErrorLevel, required: false })
  @ApiResponse({
    status: 200,
    description: 'تم إنشاء رابط التصدير بنجاح',
  })
  async exportLogs(@Query() dto: LogsExportDto) {
    const fileUrl = await this.errorLogsService.exportLogs(dto);
    return {
      fileUrl,
      message: 'تم تصدير السجلات بنجاح',
    };
  }

  @Get('system-logs')
  @ApiOperation({
    summary: 'الحصول على سجلات النظام',
    description: 'استرداد سجلات النظام العامة',
  })
  @ApiQuery({ name: 'level', required: false })
  @ApiQuery({ name: 'context', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد سجلات النظام بنجاح',
  })
  async getSystemLogs(
    @Query('level') level?: string,
    @Query('context') context?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.errorLogsService.getSystemLogs(
      level,
      context,
      page ? Number(page) : 1,
      limit ? Number(limit) : 50,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'الحصول على تفاصيل خطأ',
    description: 'استرداد معلومات مفصلة عن خطأ معين',
  })
  @ApiParam({ name: 'id', description: 'معرف سجل الخطأ' })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد تفاصيل الخطأ بنجاح',
    type: ErrorLogDto,
  })
  async getErrorById(@Param('id') id: string): Promise<ErrorLogDto> {
    return this.errorLogsService.getErrorById(id);
  }

  @Post(':id/resolve')
  @ApiOperation({
    summary: 'حل خطأ',
    description: 'وضع علامة على خطأ كمحلول',
  })
  @ApiParam({ name: 'id', description: 'معرف سجل الخطأ' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        notes: { type: 'string', description: 'ملاحظات الحل' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'تم حل الخطأ بنجاح',
  })
  async resolveError(
    @Param('id') id: string,
    @Request() req: Express.Request & { user: { userId: string } },
    @Body('notes') notes?: string,
  ) {
    const userId = req.user.userId;
    await this.errorLogsService.resolveError(id, userId, notes);
    return { message: 'تم حل الخطأ بنجاح' };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'حذف خطأ',
    description: 'حذف سجل خطأ من قاعدة البيانات',
  })
  @ApiParam({ name: 'id', description: 'معرف سجل الخطأ' })
  @ApiResponse({
    status: 200,
    description: 'تم حذف الخطأ بنجاح',
  })
  async deleteError(@Param('id') id: string) {
    await this.errorLogsService.deleteError(id);
    return { message: 'تم حذف الخطأ بنجاح' };
  }

  @Post('cleanup')
  @ApiOperation({
    summary: 'تنظيف السجلات القديمة',
    description: 'حذف سجلات الأخطاء الأقدم من عدد معين من الأيام',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        days: { type: 'number', description: 'عدد الأيام', default: 30 },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'تم تنظيف السجلات بنجاح',
  })
  async cleanupOldErrors(@Body('days') days: number = 30) {
    const deletedCount = await this.errorLogsService.clearOldErrors(days);
    return {
      message: 'تم تنظيف السجلات بنجاح',
      deletedCount,
    };
  }
}

