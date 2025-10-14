import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddItemDto, UpdateItemDto, DeviceDto, PreviewDto } from './dto/cart.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private svc: CartService) {}

  @Get()
  async get(@Req() req: { user: { sub: string } }) {
    return { data: await this.svc.getUserCart(req.user.sub) };
  }

  @Post('items')
  async add(@Req() req: { user: { sub: string } }, @Body() dto: AddItemDto) {
    const data = await this.svc.addUserItem(req.user.sub, dto.variantId, dto.qty);
    return { data };
  }

  @Patch('items/:itemId')
  async update(
    @Req() req: { user: { sub: string } },
    @Param('itemId') itemId: string,
    @Body() dto: UpdateItemDto,
  ) {
    const data = await this.svc.updateUserItem(req.user.sub, itemId, dto.qty);
    return { data };
  }

  @Delete('items/:itemId')
  async remove(@Req() req: { user: { sub: string } }, @Param('itemId') itemId: string) {
    const data = await this.svc.removeUserItem(req.user.sub, itemId);
    return { data };
  }

  @Post('merge')
  async merge(@Req() req: { user: { sub: string } }, @Body() body: DeviceDto) {
    const data = await this.svc.merge(body.deviceId, req.user.sub);
    return { data };
  }

  @Post('preview')
  async preview(@Req() req: { user: { sub: string } }, @Body() dto: PreviewDto) {
    const data = await this.svc.previewUser(req.user.sub, dto.currency, 'any');
    return { data };
  }
}
