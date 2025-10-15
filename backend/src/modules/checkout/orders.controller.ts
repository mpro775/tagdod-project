import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';
import { CheckoutService } from './checkout.service';
import { OrdersService } from './orders.service';
import {
  CheckoutConfirmDto,
  CancelOrderDto,
  RateOrderDto,
  ListOrdersDto,
} from './dto/checkout.dto';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly checkoutService: CheckoutService,
    private readonly ordersService: OrdersService,
  ) {}

  @Post('create')
  @ApiOperation({ summary: 'Create order from cart' })
  async createOrder(@Req() req: ExpressRequest, @Body() dto: CheckoutConfirmDto) {
    const order = await this.checkoutService.createOrder(
      dto,
      (req as unknown as { user: { userId: string } }).user.userId,
    );
    if (!order) {
      return { success: false, message: 'Order creation failed' };
    }

    return {
      success: true,
      message: 'تم إنشاء الطلب بنجاح',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        estimatedDelivery: order.estimatedDeliveryDate,
      },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get user orders' })
  async getMyOrders(@Req() req: ExpressRequest, @Query() dto: ListOrdersDto) {
    const result = await this.checkoutService.getUserOrders(
      (req as unknown as { user: { userId: string } }).user.userId,
      dto.page,
      dto.limit,
      dto.status,
    );

    return {
      success: true,
      data: result.orders,
      pagination: result.pagination,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details' })
  async getOrderDetails(@Req() req: ExpressRequest, @Param('id') orderId: string) {
    const order = await this.checkoutService.getOrderDetails(
      orderId,
      (req as unknown as { user: { userId: string } }).user.userId,
    );

    return {
      success: true,
      data: order,
    };
  }

  @Get(':id/track')
  @ApiOperation({ summary: 'Track order' })
  async trackOrder(@Req() req: ExpressRequest, @Param('id') orderId: string) {
    const tracking = await this.ordersService.getOrderTracking(
      orderId,
      (req as unknown as { user: { userId: string } }).user.userId,
    );

    return {
      success: true,
      data: tracking,
    };
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel order' })
  async cancelOrder(
    @Req() req: ExpressRequest,
    @Param('id') orderId: string,
    @Body() dto: CancelOrderDto,
  ) {
    const order = await this.checkoutService.cancelOrder(
      orderId,
      (req as unknown as { user: { userId: string } }).user.userId,
      dto.reason,
    );

    return {
      success: true,
      message: 'تم إلغاء الطلب بنجاح',
      data: order,
    };
  }

  @Post(':id/rate')
  @ApiOperation({ summary: 'Rate order' })
  async rateOrder(
    @Req() req: ExpressRequest,
    @Param('id') orderId: string,
    @Body() dto: RateOrderDto,
  ) {
    const order = await this.ordersService.rateOrder(
      orderId,
      (req as unknown as { user: { userId: string } }).user.userId,
      dto,
    );

    return {
      success: true,
      message: 'شكراً لتقييمك!',
      data: order,
    };
  }

  @Get('stats/summary')
  @ApiOperation({ summary: 'Get user order statistics' })
  async getMyStatistics(@Req() req: ExpressRequest) {
    const stats = await this.ordersService.getOrderStatistics(
      (req as unknown as { user: { userId: string } }).user.userId,
    );

    return {
      success: true,
      data: stats,
    };
  }
}
