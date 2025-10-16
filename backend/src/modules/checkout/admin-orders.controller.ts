import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { CheckoutService } from './checkout.service';
import { OrdersService } from './orders.service';
import {
  UpdateOrderStatusDto,
  ShipOrderDto,
  RefundOrderDto,
  ListOrdersDto,
} from './dto/checkout.dto';

@ApiTags('admin-orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(
    private readonly checkoutService: CheckoutService,
    private readonly ordersService: OrdersService,
  ) {}

  private getUserId(req: ExpressRequest): string {
    return (req as unknown as { user: { sub: string } }).user.sub;
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders (Admin)' })
  async getAllOrders(@Query() dto: ListOrdersDto) {
    const result = await this.checkoutService.getAllOrders(
      dto.page,
      dto.limit,
      dto.status,
      dto.search,
    );

    return {
      success: true,
      data: result.orders,
      pagination: result.pagination,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details (Admin)' })
  async getOrderDetails(@Param('id') orderId: string) {
    const order = await this.checkoutService.getOrderDetails(orderId, ''); // Admin can view any

    return {
      success: true,
      data: order,
    };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  async updateStatus(
    @Req() req: ExpressRequest,
    @Param('id') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const order = await this.checkoutService.updateOrderStatus(
      orderId,
      dto.status,
      this.getUserId(req),
      dto.notes,
    );

    return {
      success: true,
      message: `تم تحديث حالة الطلب إلى ${dto.status}`,
      data: order,
    };
  }

  @Post(':id/ship')
  @ApiOperation({ summary: 'Ship order' })
  async shipOrder(
    @Req() req: ExpressRequest,
    @Param('id') orderId: string,
    @Body() dto: ShipOrderDto,
  ) {
    const order = await this.checkoutService.shipOrder(orderId, dto, this.getUserId(req));
    if (!order) {
      return {
        success: false,
        message: 'Order not found or not ready to ship',
      };
    }

    return {
      success: true,
      message: 'تم شحن الطلب بنجاح',
      data: {
        orderNumber: order.orderNumber,
        trackingNumber: order.trackingNumber,
        trackingUrl: order.trackingUrl,
        estimatedDelivery: order.estimatedDeliveryDate,
      },
    };
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Process refund' })
  async processRefund(
    @Req() req: ExpressRequest,
    @Param('id') orderId: string,
    @Body() dto: RefundOrderDto,
  ) {
    const order = await this.checkoutService.processRefund(orderId, dto, this.getUserId(req));
    if (!order) {
      return {
        success: false,
        message: 'Order not found or not eligible for refund',
      };
    }

    return {
      success: true,
      message: `تم استرداد ${dto.amount} بنجاح`,
      data: {
        orderNumber: order.orderNumber,
        refundAmount: order.refundAmount,
        refundReason: order.refundReason,
        refundedAt: order.refundedAt,
      },
    };
  }

  @Post(':id/notes')
  @ApiOperation({ summary: 'Add admin notes' })
  async addNotes(
    @Req() req: ExpressRequest,
    @Param('id') orderId: string,
    @Body() body: { notes: string },
  ) {
    const order = await this.ordersService.addAdminNotes(
      orderId,
      body.notes,
      this.getUserId(req),
    );

    return {
      success: true,
      message: 'تم إضافة الملاحظات',
      data: order,
    };
  }

  @Get('analytics/summary')
  @ApiOperation({ summary: 'Get admin analytics' })
  async getAnalytics(@Query('days') days: string = '7') {
    const analytics = await this.ordersService.getAdminAnalytics(parseInt(days));

    return {
      success: true,
      data: analytics,
    };
  }
}

