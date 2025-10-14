import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { ServicesService } from './services.service';

@ApiTags('services-admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/services')
export class AdminServicesController {
  constructor(private svc: ServicesService) {}

  @Get('requests')
  async list(@Query('status') status?: string, @Query('page') page = '1', @Query('limit') limit = '20') {
    const data = await this.svc.adminList(status, Number(page), Number(limit));
    return { data: data.items, meta: data.meta };
  }

  @Post('requests/:id/cancel')
  async cancel(@Param('id') id: string) {
    const data = await this.svc.adminCancel(id);
    return { data };
  }
}
