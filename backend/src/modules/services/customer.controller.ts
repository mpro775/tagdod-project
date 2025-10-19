import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ServicesService } from './services.service';
import { AcceptOfferDto, CreateServiceRequestDto, RateServiceDto } from './dto/requests.dto';
import { ServicesPermissionGuard, ServicePermission } from './guards/services-permission.guard';
import { RequireServicePermission } from './decorators/service-permission.decorator';

@ApiTags('services-customer')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ServicesPermissionGuard)
@Controller('services/customer')
export class CustomerServicesController {
  constructor(private svc: ServicesService) {}

  @Post()
  @RequireServicePermission(ServicePermission.CUSTOMER)
  async create(@Req() req: Request, @Body() dto: CreateServiceRequestDto) {
    const data = await this.svc.createRequest(req.user!.sub, dto);
    return { data };
  }

  @Get('my')
  async my(@Req() req: Request) {
    const data = await this.svc.myRequests(req.user!.sub);
    return { data };
  }

  @Get(':id')
  async get(@Req() req: Request, @Param('id') id: string) {
    const data = await this.svc.getRequest(req.user!.sub, id);
    return { data };
  }

  @Post(':id/cancel')
  async cancel(@Req() req: Request, @Param('id') id: string) {
    const data = await this.svc.cancel(req.user!.sub, id);
    return { data };
  }

  @Post(':id/accept-offer')
  async accept(@Req() req: Request, @Param('id') id: string, @Body() dto: AcceptOfferDto) {
    const data = await this.svc.acceptOffer(req.user!.sub, id, dto.offerId);
    return { data };
  }

  @Post(':id/rate')
  async rate(@Req() req: Request, @Param('id') id: string, @Body() dto: RateServiceDto) {
    const data = await this.svc.rate(req.user!.sub, id, dto.score, dto.comment);
    return { data };
  }

  @Get(':id/offers')
  async getOffers(@Req() req: Request, @Param('id') id: string) {
    const data = await this.svc.getOffersForRequest(req.user!.sub, id);
    return { data };
  }
}
