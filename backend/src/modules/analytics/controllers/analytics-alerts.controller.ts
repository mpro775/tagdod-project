import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AdminGuard } from '../../../shared/guards/admin.guard';
import { AnalyticsAlertsService } from '../services/analytics-alerts.service';
import { UpdateAlertStatusDto, ListAlertsQueryDto } from '../dto/report-builder.dto';

@ApiTags('Analytics - Alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('analytics/alerts')
export class AnalyticsAlertsController {
  constructor(private readonly alertsService: AnalyticsAlertsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all analytics alerts' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'severity', required: false })
  @ApiQuery({ name: 'source', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query() query: ListAlertsQueryDto) {
    const result = await this.alertsService.findAll(query);
    return { success: true, ...result };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get alert statistics' })
  async getStats() {
    const stats = await this.alertsService.getStats();
    return { success: true, data: stats };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get alert by ID' })
  @ApiParam({ name: 'id', description: 'Alert ID' })
  async findById(@Param('id') id: string) {
    const alert = await this.alertsService.findById(id);
    return { success: true, data: alert };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update alert status' })
  @ApiParam({ name: 'id', description: 'Alert ID' })
  @ApiBody({ type: UpdateAlertStatusDto })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateAlertStatusDto) {
    const alert = await this.alertsService.updateStatus(id, dto);
    return { success: true, data: alert, message: 'Alert status updated' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an alert' })
  @ApiParam({ name: 'id', description: 'Alert ID' })
  async delete(@Param('id') id: string) {
    await this.alertsService.delete(id);
    return { success: true, message: 'Alert deleted successfully' };
  }

  @Post('scan')
  @ApiOperation({ summary: 'Scan and generate new alerts' })
  async scanAndGenerate() {
    const alerts = await this.alertsService.scanAndGenerateAlerts();
    return { success: true, data: alerts, count: alerts.length, message: `Found ${alerts.length} alerts` };
  }
}
