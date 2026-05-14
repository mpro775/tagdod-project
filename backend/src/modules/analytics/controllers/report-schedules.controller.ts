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
    return this.reportSchedulesService.create(dto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'قائمة الجداول' })
  @ApiQuery({ type: ScheduleFiltersDto })
  async findAll(@Query() filters: ScheduleFiltersDto, @Request() req: any) {
    return this.reportSchedulesService.findAll(filters, req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل جدولة' })
  @ApiParam({ name: 'id', description: 'معرف الجدولة' })
  async findOne(@Param('id') id: string) {
    return this.reportSchedulesService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تحديث جدولة' })
  @ApiParam({ name: 'id', description: 'معرف الجدولة' })
  @ApiBody({ type: UpdateReportScheduleDto })
  async update(@Param('id') id: string, @Body() dto: UpdateReportScheduleDto, @Request() req: any) {
    return this.reportSchedulesService.update(id, dto, req.user.sub);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'تفعيل/إيقاف جدولة' })
  @ApiParam({ name: 'id', description: 'معرف الجدولة' })
  @ApiBody({ type: ToggleScheduleDto })
  async toggle(@Param('id') id: string, @Body() dto: ToggleScheduleDto, @Request() req: any) {
    return this.reportSchedulesService.toggle(id, dto.isActive, req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف جدولة' })
  @ApiParam({ name: 'id', description: 'معرف الجدولة' })
  async remove(@Param('id') id: string, @Request() req: any) {
    await this.reportSchedulesService.remove(id, req.user.sub);
    return { success: true, message: 'تم حذف الجدولة بنجاح' };
  }

  @Post(':id/run-now')
  @ApiOperation({ summary: 'تشغيل الجدولة الآن' })
  @ApiParam({ name: 'id', description: 'معرف الجدولة' })
  @ApiBody({ type: RunNowDto, required: false })
  async runNow(@Param('id') id: string, @Request() req: any, @Body() dto?: RunNowDto) {
    return this.reportSchedulesService.runNow(id, dto || {}, req.user.sub);
  }

  @Get('stats')
  @ApiOperation({ summary: 'إحصائيات الجداول' })
  async getStats() {
    return this.reportSchedulesService.getScheduleStats();
  }
}
