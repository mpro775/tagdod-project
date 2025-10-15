import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { NotificationsService } from './notifications.service';
import { 
  AdminTestDto, 
  AdminListNotificationsDto, 
  AdminCreateNotificationDto,
  AdminUpdateNotificationDto,
  AdminSendNotificationDto
} from './dto/notifications.dto';

@ApiTags('notifications-admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/notifications')
export class AdminNotificationsController {
  constructor(private svc: NotificationsService) {}

  @Get()
  async list(@Query() query: AdminListNotificationsDto) {
    const data = await this.svc.adminList(query);
    return { data: data.items, meta: data.meta };
  }

  @Get('templates')
  async getTemplates() {
    const templates = await this.svc.getAvailableTemplates();
    return { data: templates };
  }

  @Post()
  async create(@Body() dto: AdminCreateNotificationDto) {
    const notification = await this.svc.adminCreate(dto);
    return { data: notification };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const notification = await this.svc.adminGetById(id);
    return { data: notification };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: AdminUpdateNotificationDto) {
    const notification = await this.svc.adminUpdate(id, dto);
    return { data: notification };
  }

  @Post(':id/send')
  async send(@Param('id') id: string, @Body() dto: AdminSendNotificationDto) {
    const result = await this.svc.adminSend(id, dto);
    return { data: result };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.svc.adminDelete(id);
    return { data: { deleted: true } };
  }

  @Get('stats/overview')
  async getStats() {
    const stats = await this.svc.getAdminStats();
    return { data: stats };
  }

  @Post('bulk/send')
  async bulkSend(@Body() dto: AdminCreateNotificationDto & { targetUsers: string[] }) {
    const results = await this.svc.adminBulkSend(dto);
    return { data: results };
  }

  @Post('test')
  async test(@Body() dto: AdminTestDto) {
    await this.svc.emit(dto.userId, dto.templateKey, dto.payload || {});
    return { ok: true };
  }
}
