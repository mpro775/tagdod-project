import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';
import { OrderService } from '../services/order.service';
import {
  CheckoutPreviewDto,
  CheckoutConfirmDto,
  ListOrdersDto,
  CancelOrderDto,
  RateOrderDto,
  AddOrderNotesDto,
  OrderResponseDto,
  OrderTrackingDto,
} from '../dto/order.dto';

/**
 * Controller للطلبات - للعملاء
 */
@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  private getUserId(req: ExpressRequest): string {
    return (req as unknown as { user: { sub: string } }).user.sub;
  }

  // ===== Checkout =====

  @Post('checkout/preview')
  @ApiOperation({
    summary: 'معاينة الطلب',
    description: 'معاينة تفاصيل الطلب والأسعار قبل التأكيد',
  })
  @ApiResponse({ status: 200, description: 'تم إنشاء معاينة الطلب بنجاح' })
  @ApiResponse({ status: 400, description: 'بيانات غير صحيحة' })
  async previewCheckout(
    @Req() req: ExpressRequest,
    @Body() dto: CheckoutPreviewDto,
  ): Promise<OrderResponseDto> {
    const result = await this.orderService.previewCheckout(
      this.getUserId(req),
      dto.currency,
      dto.couponCode,
    );

    return {
      success: true,
      message: 'تم إنشاء معاينة الطلب بنجاح',
      data: result.data,
    };
  }

  @Post('checkout/confirm')
  @ApiOperation({
    summary: 'تأكيد الطلب',
    description: 'تأكيد الطلب وإنشاؤه في النظام',
  })
  @ApiResponse({ status: 201, description: 'تم إنشاء الطلب بنجاح' })
  @ApiResponse({ status: 400, description: 'فشل في إنشاء الطلب' })
  async confirmCheckout(
    @Req() req: ExpressRequest,
    @Body() dto: CheckoutConfirmDto,
  ): Promise<OrderResponseDto> {
    const result = await this.orderService.confirmCheckout(this.getUserId(req), dto);

    return {
      success: true,
      message: 'تم إنشاء الطلب بنجاح',
      data: result,
    };
  }

  // ===== Order Management =====

  @Get()
  @ApiOperation({
    summary: 'الحصول على طلبات المستخدم',
    description: 'قائمة بجميع طلبات المستخدم مع إمكانية الفلترة والترقيم',
  })
  @ApiResponse({ status: 200, description: 'تم الحصول على الطلبات بنجاح' })
  async getUserOrders(
    @Req() req: ExpressRequest,
    @Query() query: ListOrdersDto,
  ): Promise<OrderResponseDto> {
    const result = await this.orderService.getUserOrders(this.getUserId(req), query);

    return {
      success: true,
      message: 'تم الحصول على الطلبات بنجاح',
      data: result.orders,
      pagination: result.pagination,
    };
  }

  @Get('recent')
  @ApiOperation({
    summary: 'الطلبات الأخيرة',
    description: 'الحصول على أحدث الطلبات للمستخدم',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'عدد الطلبات المطلوبة' })
  @ApiResponse({ status: 200, description: 'تم الحصول على الطلبات الأخيرة' })
  async getRecentOrders(
    @Req() req: ExpressRequest,
    @Query('limit') limit?: number,
  ): Promise<OrderResponseDto> {
    const query: ListOrdersDto = {
      page: 1,
      limit: limit || 5,
    };

    const result = await this.orderService.getUserOrders(this.getUserId(req), query);

    return {
      success: true,
      message: 'تم الحصول على الطلبات الأخيرة',
      data: result.orders,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'تفاصيل الطلب',
    description: 'الحصول على تفاصيل طلب محدد',
  })
  @ApiParam({ name: 'id', description: 'معرف الطلب' })
  @ApiResponse({ status: 200, description: 'تم الحصول على تفاصيل الطلب' })
  @ApiResponse({ status: 404, description: 'الطلب غير موجود' })
  async getOrderDetails(
    @Req() req: ExpressRequest,
    @Param('id') orderId: string,
  ): Promise<OrderResponseDto> {
    const order = await this.orderService.getOrderDetails(orderId, this.getUserId(req));

    return {
      success: true,
      message: 'تم الحصول على تفاصيل الطلب',
      data: order,
    };
  }

  @Get(':id/track')
  @ApiOperation({
    summary: 'تتبع الطلب',
    description: 'الحصول على معلومات تتبع الطلب والخط الزمني',
  })
  @ApiParam({ name: 'id', description: 'معرف الطلب' })
  @ApiResponse({ status: 200, description: 'تم الحصول على معلومات التتبع' })
  async trackOrder(
    @Req() req: ExpressRequest,
    @Param('id') orderId: string,
  ): Promise<OrderResponseDto> {
    const order = await this.orderService.getOrderDetails(orderId, this.getUserId(req));

    // بناء معلومات التتبع
    const tracking: OrderTrackingDto = {
      orderNumber: order.orderNumber,
      currentStatus: order.status,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      estimatedDelivery: order.estimatedDeliveryDate,
      actualDelivery: order.deliveredAt,
      timeline: order.statusHistory.map((entry) => ({
        status: entry.status,
        title: this.getStatusTitle(entry.status),
        icon: this.getStatusIcon(entry.status),
        completed: true,
        timestamp: entry.changedAt,
        notes: entry.notes,
      })),
    };

    return {
      success: true,
      message: 'تم الحصول على معلومات التتبع',
      data: tracking,
    };
  }

  @Post(':id/cancel')
  @ApiOperation({
    summary: 'إلغاء الطلب',
    description: 'إلغاء طلب محدد من قبل العميل',
  })
  @ApiParam({ name: 'id', description: 'معرف الطلب' })
  @ApiResponse({ status: 200, description: 'تم إلغاء الطلب بنجاح' })
  @ApiResponse({ status: 400, description: 'لا يمكن إلغاء الطلب' })
  async cancelOrder(
    @Req() req: ExpressRequest,
    @Param('id') orderId: string,
    @Body() dto: CancelOrderDto,
  ): Promise<OrderResponseDto> {
    const order = await this.orderService.cancelOrder(orderId, this.getUserId(req), dto);

    return {
      success: true,
      message: 'تم إلغاء الطلب بنجاح',
      data: order,
    };
  }

  @Post(':id/rate')
  @ApiOperation({
    summary: 'تقييم الطلب',
    description: 'تقييم طلب محدد بعد التسليم',
  })
  @ApiParam({ name: 'id', description: 'معرف الطلب' })
  @ApiResponse({ status: 200, description: 'تم تقييم الطلب بنجاح' })
  @ApiResponse({ status: 400, description: 'لا يمكن تقييم الطلب في هذه المرحلة' })
  async rateOrder(
    @Req() req: ExpressRequest,
    @Param('id') orderId: string,
    @Body() dto: RateOrderDto,
  ): Promise<OrderResponseDto> {
    const order = await this.orderService.rateOrder(orderId, this.getUserId(req), dto);

    return {
      success: true,
      message: 'شكراً لتقييمك!',
      data: order,
    };
  }

  @Post(':id/notes')
  @ApiOperation({
    summary: 'إضافة ملاحظات للطلب',
    description: 'إضافة ملاحظات شخصية للطلب',
  })
  @ApiParam({ name: 'id', description: 'معرف الطلب' })
  @ApiResponse({ status: 200, description: 'تم إضافة الملاحظات بنجاح' })
  async addOrderNotes(
    @Req() req: ExpressRequest,
    @Param('id') orderId: string,
    @Body() dto: AddOrderNotesDto,
  ): Promise<OrderResponseDto> {
    const order = await this.orderService.addOrderNotes(orderId, dto, this.getUserId(req));

    return {
      success: true,
      message: 'تم إضافة الملاحظات بنجاح',
      data: order,
    };
  }

  // ===== Statistics =====

  @Get('stats/summary')
  @ApiOperation({
    summary: 'إحصائيات الطلبات',
    description: 'الحصول على إحصائيات طلبات المستخدم',
  })
  @ApiResponse({ status: 200, description: 'تم الحصول على الإحصائيات' })
  async getOrderStatistics(@Req() req: ExpressRequest): Promise<OrderResponseDto> {
    const stats = await this.orderService.getUserOrderStatistics(this.getUserId(req));

    return {
      success: true,
      message: 'تم الحصول على الإحصائيات',
      data: stats,
    };
  }

  // ===== Helper Methods =====

  private getStatusTitle(status: string): string {
    const titles: Record<string, string> = {
      draft: 'مسودة',
      pending_payment: 'في انتظار الدفع',
      confirmed: 'مؤكد',
      processing: 'قيد المعالجة',
      ready_to_ship: 'جاهز للشحن',
      shipped: 'تم الشحن',
      out_for_delivery: 'جاري التوصيل',
      delivered: 'تم التسليم',
      completed: 'مكتمل',
      cancelled: 'ملغي',
      refunded: 'مسترد',
      returned: 'مرتجع',
    };
    return titles[status] || status;
  }

  private getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      draft: '📝',
      pending_payment: '⏳',
      confirmed: '✅',
      processing: '📦',
      ready_to_ship: '🎁',
      shipped: '🚚',
      out_for_delivery: '🏃',
      delivered: '🎉',
      completed: '✨',
      cancelled: '❌',
      refunded: '💰',
      returned: '↩️',
    };
    return icons[status] || '📋';
  }
}
