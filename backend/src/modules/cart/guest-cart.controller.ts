import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { GuestAddItemDto, GuestPreviewDto, GuestUpdateItemDto, DeviceDto } from './dto/cart.dto';

@ApiTags('cart-guest')
@Controller('cart/guest')
export class GuestCartController {
  constructor(private svc: CartService) {}

  @Get()
  async get(@Query('deviceId') deviceId: string) {
    const data = await this.svc.getGuestCart(deviceId);
    return { data };
  }

  @Post('items')
  async add(@Body() dto: GuestAddItemDto) {
    const data = await this.svc.addGuestItem(dto.deviceId, dto.variantId, dto.qty);
    return { data };
  }

  @Patch('items/:itemId')
  async update(@Param('itemId') itemId: string, @Body() dto: GuestUpdateItemDto) {
    const data = await this.svc.updateGuestItem(dto.deviceId, itemId, dto.qty);
    return { data };
  }

  @Delete('items/:itemId')
  async remove(@Param('itemId') itemId: string, @Body() dto: DeviceDto) {
    const data = await this.svc.removeGuestItem(dto.deviceId, itemId);
    return { data };
  }

  @Post('clear')
  async clear(@Body() dto: DeviceDto) {
    const data = await this.svc.clearGuestCart(dto.deviceId);
    return { data };
  }

  @Post('preview')
  async preview(@Body() dto: GuestPreviewDto) {
    const data = await this.svc.previewGuest(dto.deviceId, dto.currency, 'any');
    return { data };
  }
}
