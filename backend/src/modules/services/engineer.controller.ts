import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EngineerGuard } from '../../shared/guards/engineer.guard';
import { ServicesService } from './services.service';
import { CreateOfferDto, UpdateOfferDto } from './dto/offers.dto';
import { NearbyQueryDto } from './dto/requests.dto';

@ApiTags('services-engineer')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, EngineerGuard)
@Controller('services')
export class EngineerServicesController {
  constructor(private svc: ServicesService) {}

  @Get('requests/nearby')
  async nearby(@Req() req: Request, @Query() q: NearbyQueryDto) {
    const data = await this.svc.nearby(req.user!.sub, q.lat, q.lng, q.radiusKm);
    return { data };
  }

  @Post('offers')
  async offer(@Req() req: Request, @Body() dto: CreateOfferDto) {
    const data = await this.svc.offer(req.user!.sub, dto);
    return { data };
  }

  @Patch('offers/:id')
  async updateOffer(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateOfferDto) {
    const data = await this.svc.updateOffer(req.user!.sub, id, dto);
    return { data };
  }

  @Post('requests/:id/start')
  async start(@Req() req: Request, @Param('id') id: string) {
    const data = await this.svc.start(req.user!.sub, id);
    return { data };
  }

  @Post('requests/:id/complete')
  async complete(@Req() req: Request, @Param('id') id: string) {
    const data = await this.svc.complete(req.user!.sub, id);
    return { data };
  }

  @Get('offers/my')
  async myOffers(@Req() req: Request) {
    const data = await this.svc.myOffers(req.user!.sub);
    return { data };
  }
}
