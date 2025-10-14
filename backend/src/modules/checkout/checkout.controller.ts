import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CheckoutService } from './checkout.service';
import { CheckoutConfirmDto, CheckoutPreviewDto, WebhookDto } from './dto/checkout.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';

@ApiTags('checkout')
@Controller()
export class CheckoutController {
  constructor(private svc: CheckoutService) {}

  @ApiBearerAuth() @UseGuards(JwtAuthGuard)
  @Post('checkout/preview')
  async preview(@Req() req: { user: { sub: string } }, @Body() dto: CheckoutPreviewDto) {
    const data = await this.svc.preview(req.user.sub, dto.currency);
    return { data };
  }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard)
  @Post('checkout/confirm')
  async confirm(@Req() req: { user: { sub: string } }, @Body() dto: CheckoutConfirmDto) {
    const data = await this.svc.confirm(req.user.sub, dto.currency, dto.method, dto.provider, dto.addressId);
    return { data };
  }

  // Public webhook
  @Post('payments/webhook')
  async webhook(@Body() dto: WebhookDto) {
    const res = await this.svc.handleWebhook(dto.intentId, dto.status, dto.amount, dto.signature);
    return res;
  }

  // Orders (user)
  @ApiBearerAuth() @UseGuards(JwtAuthGuard)
  @Get('orders')
  async myOrders(@Req() req: { user: { sub: string } }) {
    const items = await this.svc.listMy(req.user.sub);
    return { data: items };
  }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard)
  @Get('orders/:id')
  async myOrder(@Req() req: { user: { sub: string } }, @Param('id') id: string) {
    const item = await this.svc.getMy(req.user.sub, id);
    return { data: item };
  }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard)
  @Post('orders/:id/cancel')
  async cancel(@Req() req: { user: { sub: string } }, @Param('id') id: string) {
    const res = await this.svc.userCancel(req.user.sub, id);
    return { data: res };
  }

  // Admin
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/orders')
  async adminList() {
    const items = await this.svc.adminList();
    return { data: items };
  }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('admin/orders/:id/status')
  async adminSet(@Param('id') id: string, @Body() body: { status: 'PROCESSING'|'SHIPPED'|'DELIVERED'|'COMPLETED' }) {
    const res = await this.svc.adminSetStatus(id, body.status);
    return { data: res };
  }
}
