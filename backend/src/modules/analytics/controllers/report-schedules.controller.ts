import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
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
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AdminGuard } from '../../../shared/guards/admin.guard';
import { ReportSchedulesService } from '../services/report-schedules.service';
import {
  CreateReportScheduleDto,
  UpdateReportScheduleDto,
  ToggleScheduleDto,
  RunNowDto,
  ScheduleFiltersDto,
} from '../dto/report-schedules.dto';

@ApiTags('Report Schedules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('analytics/report-schedules')
export class ReportSchedulesController {
  constructor(private readonly reportSchedulesService: ReportSchedulesService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء جدولة تقرير جديدة' })
  @ApiResponse({ status: 201, description: 'تم إنشاء الجدولة بنجاح' })
  @ApiBody({ type: CreateReportScheduleDto })
  async create(@Body() dto: CreateReportScheduleDto, @Request() req: any) {
    const schedule = await this.reportSchedulesService.create(dto, req.user.sub);
    return { success: true, data: schedule, requestId: '' };
  }

  @Get()
  @ApiOperation({ summary: 'قائمة الجداول' })
  @ApiQuery({ type: ScheduleFiltersDto })
  async findAll(
    @Query() filters: ScheduleFiltersDto,
    @Query() pagination: { page?: string; limit?: string },
    @Request() req: any,
  ) {
    filters.page = parseInt(pagination.page || '1', 10);
    filters.limit = parseInt(pagination.limit || '20', 10);
    const result = await this.reportSchedulesService.findAll(filters, req.user.sub);
    return { success: true, data: result, requestId: '' };
  }

  @Get('stats')
  @ApiOperation({ summary: 'إحصائيات الجداول' })
  async getStats() {
    const stats = await this.reportSchedulesService.getScheduleStats();
    return { success: true, data: stats, requestId: '' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل جدولة' })
  @ApiParam({ name: 'id', description: 'معرف الجدولة' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    const schedule = await this.reportSchedulesService.findById(id);
    if (req.user.sub !== schedule.createdBy.toString()) {
      throw new ForbiddenException('You do not have permission to access this schedule');
    }
    return { success: true, data: schedule, requestId: '' };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تحديث جدولة' })
  @ApiParam({ name: 'id', description: 'معرف الجدولة' })
  @ApiBody({ type: UpdateReportScheduleDto })
  async update(@Param('id') id: string, @Body() dto: UpdateReportScheduleDto, @Request() req: any) {
    const schedule = await this.reportSchedulesService.findById(id);
    if (req.user.sub !== schedule.createdBy.toString()) {
      throw new ForbiddenException('You do not have permission to access this schedule');
    }
    const updated = await this.reportSchedulesService.update(id, dto, req.user.sub);
    return { success: true, data: updated, requestId: '' };
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'تفعيل/إيقاف جدولة' })
  @ApiParam({ name: 'id', description: 'معرف الجدولة' })
  @ApiBody({ type: ToggleScheduleDto })
  async toggle(@Param('id') id: string, @Body() dto: ToggleScheduleDto, @Request() req: any) {
    const schedule = await this.reportSchedulesService.findById(id);
    if (req.user.sub !== schedule.createdBy.toString()) {
      throw new ForbiddenException('You do not have permission to access this schedule');
    }
    const updated = await this.reportSchedulesService.toggle(id, dto.isActive, req.user.sub);
    return { success: true, data: updated, requestId: '' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف جدولة' })
  @ApiParam({ name: 'id', description: 'معرف الجدولة' })
  async remove(@Param('id') id: string, @Request() req: any) {
    const schedule = await this.reportSchedulesService.findById(id);
    if (req.user.sub !== schedule.createdBy.toString()) {
      throw new ForbiddenException('You do not have permission to access this schedule');
    }
    await this.reportSchedulesService.remove(id, req.user.sub);
    return { success: true, data: { message: 'تم حذف الجدولة بنجاح' }, requestId: '' };
  }

  @Post(':id/run-now')
  @ApiOperation({ summary: 'تشغيل الجدولة الآن' })
  @ApiParam({ name: 'id', description: 'معرف الجدولة' })
  @ApiBody({ type: RunNowDto, required: false })
  async runNow(@Param('id') id: string, @Request() req: any, @Body() dto?: RunNowDto) {
    const schedule = await this.reportSchedulesService.findById(id);
    if (req.user.sub !== schedule.createdBy.toString()) {
      throw new ForbiddenException('You do not have permission to access this schedule');
    }
    const result = await this.reportSchedulesService.runNow(id, dto || {}, req.user.sub);
    return { success: true, data: result, requestId: '' };
  }
}
