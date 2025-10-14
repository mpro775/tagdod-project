import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { ListQueryDto, MarkReadDto, ReadAllDto, RegisterDeviceDto } from './dto/notifications.dto';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class NotificationsController {
  constructor(private svc: NotificationsService) {}

  @Get('notifications')
  async list(@Req() req: { user: { sub: string } }, @Query() q: ListQueryDto) {
    const data = await this.svc.list(req.user.sub, q.page, q.limit, q.channel);
    return { data: data.items, meta: data.meta };
  }

  @Get('notifications/unread-count')
  async unread(@Req() req: { user: { sub: string } }) {
    const data = await this.svc.unreadCount(req.user.sub);
    return { data };
  }

  @Post('notifications/read')
  async read(@Req() req: { user: { sub: string } }, @Body() body: MarkReadDto) {
    const data = await this.svc.markRead(req.user.sub, body.ids);
    return { data };
  }

  @Post('notifications/read-all')
  async readAll(@Req() req: { user: { sub: string } }, @Body() body: ReadAllDto) {
    const data = await this.svc.markReadAll(req.user.sub, body.channel);
    return { data };
  }

  @Post('devices/register')
  async register(@Req() req: { user: { sub: string } }, @Body() dto: RegisterDeviceDto) {
    const doc = await this.svc.registerDevice(req.user.sub, dto);
    return { data: { id: String(doc._id) } };
  }

  @Delete('devices/:id')
  async del(@Req() req: { user: { sub: string } }, @Param('id') id: string) {
    const data = await this.svc.deleteDevice(req.user.sub, id);
    return { data };
  }
}
