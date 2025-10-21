import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ServicesService } from './services.service';
import { CreateOfferDto, UpdateOfferDto } from './dto/offers.dto';
import { NearbyQueryDto } from './dto/requests.dto';
import { ServicesPermissionGuard, ServicePermission } from './guards/services-permission.guard';
import { RequireServicePermission } from './decorators/service-permission.decorator';

// JWT Payload interface
interface JwtUser {
  sub: string;
  phone: string;
  isAdmin: boolean;
  roles?: string[];
  permissions?: string[];
  preferredCurrency?: string;
}

// Request with JWT user
interface RequestWithUser {
  user: JwtUser;
}

@ApiTags('services-engineer')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ServicesPermissionGuard)
@Controller('services/engineer')
export class EngineerServicesController {
  constructor(private svc: ServicesService) {}

  @Get('requests/nearby')
  @RequireServicePermission(ServicePermission.ENGINEER)
  async nearby(@Req() req: RequestWithUser, @Query() q: NearbyQueryDto) {
    const data = await this.svc.nearby(req.user!.sub, q.lat, q.lng, q.radiusKm);
    return { data };
  }

  @Post('offers')
  async offer(@Req() req: RequestWithUser, @Body() dto: CreateOfferDto) {
    const data = await this.svc.offer(req.user!.sub, dto);
    return { data };
  }

  @Patch('offers/:id')
  async updateOffer(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: UpdateOfferDto) {
    const data = await this.svc.updateOffer(req.user!.sub, id, dto);
    return { data };
  }

  @Post('requests/:id/start')
  async start(@Req() req: RequestWithUser, @Param('id') id: string) {
    const data = await this.svc.start(req.user!.sub, id);
    return { data };
  }

  @Post('requests/:id/complete')
  async complete(@Req() req: RequestWithUser, @Param('id') id: string) {
    const data = await this.svc.complete(req.user!.sub, id);
    return { data };
  }

  @Get('offers/my')
  async myOffers(@Req() req: RequestWithUser) {
    const data = await this.svc.myOffers(req.user!.sub);
    return { data };
  }
}
