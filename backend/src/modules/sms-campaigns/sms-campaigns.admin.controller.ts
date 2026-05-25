import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { RequirePermissions } from '../../shared/decorators/permissions.decorator';
import { CreateSmsCampaignDto } from './dto/create-sms-campaign.dto';
import { ListSmsCampaignRecipientsDto } from './dto/list-sms-campaign-recipients.dto';
import { ListSmsCampaignsDto } from './dto/list-sms-campaigns.dto';
import { PreviewSmsCampaignDto } from './dto/preview-sms-campaign.dto';
import { SendTestSmsDto } from './dto/send-test-sms.dto';
import { SmsCampaignsService } from './sms-campaigns.service';

type AuthenticatedRequest = {
  user: {
    sub: string;
    id?: string;
    userId?: string;
  };
};

@ApiTags('sms-campaigns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('sms-campaigns/admin')
export class SmsCampaignsAdminController {
  constructor(private readonly smsCampaignsService: SmsCampaignsService) {}

  @Post('preview')
  @RequirePermissions('sms_campaigns.read', 'admin.access')
  @ApiOperation({ summary: 'Preview SMS campaign recipients' })
  preview(@Body() dto: PreviewSmsCampaignDto): Promise<unknown> {
    return this.smsCampaignsService.preview(dto);
  }

  @Post('test')
  @RequirePermissions('sms_campaigns.create', 'admin.access')
  @ApiOperation({ summary: 'Send test SMS' })
  sendTest(@Body() dto: SendTestSmsDto, @Req() req: AuthenticatedRequest): Promise<unknown> {
    return this.smsCampaignsService.sendTest(dto, req.user.sub || req.user.id || req.user.userId!);
  }

  @Post()
  @RequirePermissions('sms_campaigns.create', 'admin.access')
  @ApiOperation({ summary: 'Create SMS campaign and queue delivery' })
  create(@Body() dto: CreateSmsCampaignDto, @Req() req: AuthenticatedRequest): Promise<unknown> {
    return this.smsCampaignsService.create(dto, req.user.sub || req.user.id || req.user.userId!);
  }

  @Get()
  @RequirePermissions('sms_campaigns.read', 'admin.access')
  @ApiOperation({ summary: 'List SMS campaigns' })
  list(@Query() dto: ListSmsCampaignsDto): Promise<unknown> {
    return this.smsCampaignsService.list(dto);
  }

  @Get(':id')
  @RequirePermissions('sms_campaigns.read', 'admin.access')
  @ApiOperation({ summary: 'Get SMS campaign details' })
  findOne(@Param('id') id: string): Promise<unknown> {
    return this.smsCampaignsService.findOne(id);
  }

  @Get(':id/recipients')
  @RequirePermissions('sms_campaigns.read', 'admin.access')
  @ApiOperation({ summary: 'List SMS campaign recipients' })
  listRecipients(@Param('id') id: string, @Query() dto: ListSmsCampaignRecipientsDto): Promise<unknown> {
    return this.smsCampaignsService.listRecipients(id, dto);
  }

  @Patch(':id/pause')
  @RequirePermissions('sms_campaigns.control', 'admin.access')
  @ApiOperation({ summary: 'Pause SMS campaign' })
  pause(@Param('id') id: string): Promise<unknown> {
    return this.smsCampaignsService.pause(id);
  }

  @Patch(':id/resume')
  @RequirePermissions('sms_campaigns.control', 'admin.access')
  @ApiOperation({ summary: 'Resume SMS campaign' })
  resume(@Param('id') id: string): Promise<unknown> {
    return this.smsCampaignsService.resume(id);
  }

  @Patch(':id/cancel')
  @RequirePermissions('sms_campaigns.control', 'admin.access')
  @ApiOperation({ summary: 'Cancel SMS campaign' })
  cancel(@Param('id') id: string): Promise<unknown> {
    return this.smsCampaignsService.cancel(id);
  }

  @Post(':id/retry-failed')
  @RequirePermissions('sms_campaigns.control', 'admin.access')
  @ApiOperation({ summary: 'Retry failed SMS recipients only' })
  retryFailed(@Param('id') id: string): Promise<unknown> {
    return this.smsCampaignsService.retryFailed(id);
  }

  @Get(':id/export.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @RequirePermissions('sms_campaigns.export', 'admin.access')
  @ApiOperation({ summary: 'Export SMS campaign recipients as CSV' })
  async exportCsv(@Param('id') id: string, @Res() res: Response) {
    const csv = await this.smsCampaignsService.exportCsv(id);
    res.setHeader('Content-Disposition', `attachment; filename="sms-campaign-${id}.csv"`);
    res.send(`\uFEFF${csv}`);
  }
}
