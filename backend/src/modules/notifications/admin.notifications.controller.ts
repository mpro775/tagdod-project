import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { NotificationsService } from './notifications.service';
import { AdminTestDto } from './dto/notifications.dto';

@ApiTags('notifications-admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/notifications')
export class AdminNotificationsController {
  constructor(private svc: NotificationsService) {}

  @Post('test')
  async test(@Body() dto: AdminTestDto) {
    await this.svc.emit(dto.userId, dto.templateKey, dto.payload || {});
    return { ok: true };
  }
}
