import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CheckoutService } from './checkout.service';
import { OrdersService } from './orders.service';
import {
  CheckoutConfirmDto,
  CancelOrderDto,
  RateOrderDto,
  ListOrdersDto,
} from './dto/checkout.dto';
import { OrderStatus } from './schemas/order.schema';

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
  async createOrder(@Req() req: any, @Body() dto: CheckoutConfirmDto) {
    const order = await this.checkoutService.createOrder(dto, req.user.userId);

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
  async getMyOrders(@Req() req: any, @Query() dto: ListOrdersDto) {
    const result = await this.checkoutService.getUserOrders(
      req.user.userId,
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
  async getOrderDetails(@Req() req: any, @Param('id') orderId: string) {
    const order = await this.checkoutService.getOrderDetails(orderId, req.user.userId);

    return {
      success: true,
      data: order,
    };
  }

  @Get(':id/track')
  @ApiOperation({ summary: 'Track order' })
  async trackOrder(@Req() req: any, @Param('id') orderId: string) {
    const tracking = await this.ordersService.getOrderTracking(orderId, req.user.userId);

    return {
      success: true,
      data: tracking,
    };
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel order' })
  async cancelOrder(
    @Req() req: any,
    @Param('id') orderId: string,
    @Body() dto: CancelOrderDto,
  ) {
    const order = await this.checkoutService.cancelOrder(
      orderId,
      req.user.userId,
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
    @Req() req: any,
    @Param('id') orderId: string,
    @Body() dto: RateOrderDto,
  ) {
    const order = await this.ordersService.rateOrder(orderId, req.user.userId, dto);

    return {
      success: true,
      message: 'شكراً لتقييمك!',
      data: order,
    };
  }

  @Get('stats/summary')
  @ApiOperation({ summary: 'Get user order statistics' })
  async getMyStatistics(@Req() req: any) {
    const stats = await this.ordersService.getOrderStatistics(req.user.userId);

    return {
      success: true,
      data: stats,
    };
  }
}

