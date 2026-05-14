import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AdminGuard } from '../../../shared/guards/admin.guard';
import { ReportTemplatesService } from '../services/report-templates.service';
import { CreateReportTemplateDto, UpdateReportTemplateDto } from '../dto/report-builder.dto';

@ApiTags('Analytics - Report Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('analytics/report-templates')
export class ReportTemplatesController {
  constructor(private readonly reportTemplatesService: ReportTemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all report templates' })
  @ApiQuery({ name: 'category', required: false })
  async findAll(@Query('category') category?: string) {
    const templates = await this.reportTemplatesService.findAll(category);
    return { success: true, data: templates, total: templates.length };
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get report template by key' })
  @ApiParam({ name: 'key', description: 'Template key' })
  async findByKey(@Param('key') key: string) {
    const template = await this.reportTemplatesService.findByKey(key);
    return { success: true, data: template };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new report template' })
  @ApiBody({ type: CreateReportTemplateDto })
  async create(@Body() dto: CreateReportTemplateDto) {
    const template = await this.reportTemplatesService.create(dto);
    return { success: true, data: template, message: 'Template created successfully' };
  }

  @Patch(':key')
  @ApiOperation({ summary: 'Update a report template' })
  @ApiParam({ name: 'key', description: 'Template key' })
  @ApiBody({ type: UpdateReportTemplateDto })
  async update(@Param('key') key: string, @Body() dto: UpdateReportTemplateDto) {
    const template = await this.reportTemplatesService.update(key, dto);
    return { success: true, data: template, message: 'Template updated successfully' };
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete a report template' })
  @ApiParam({ name: 'key', description: 'Template key' })
  async delete(@Param('key') key: string) {
    await this.reportTemplatesService.delete(key);
    return { success: true, message: 'Template deleted successfully' };
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed default report templates' })
  async seed() {
    await this.reportTemplatesService.seedDefaultTemplates();
    return { success: true, message: 'Default templates seeded successfully' };
  }
}
