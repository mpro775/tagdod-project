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
  OrderTrackingDto,
  CheckoutPaymentOptionsResponseDto,
  CheckoutSessionResponseDto,
} from '../dto/order.dto';

/**
 * Controller للطلبات - للعملاء
 */
@ApiTags('الطلبات')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  private getUserId(req: ExpressRequest): string {
    return (req as unknown as { user: { sub: string } }).user.sub;
  }

  // ===== Checkout =====

  @Post('checkout/session')
  @ApiOperation({
    summary: 'جلسة الدفع',
    description: 'جمع جميع بيانات جلسة الدفع (السلة، القسائم، العناوين، خيارات الدفع)',
  })
  @ApiResponse({
    status: 200,
    description: 'تم تجهيز جلسة الدفع بنجاح',
    type: CheckoutSessionResponseDto,
  })
  async buildCheckoutSession(
    @Req() req: ExpressRequest,
    @Body() dto: CheckoutPreviewDto,
  ) {
    const session = await this.orderService.getCheckoutSession(this.getUserId(req), dto);

    return {
      session,
      message: 'تم تجهيز جلسة الدفع بنجاح',
    };
  }

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
  ) {
    const result = await this.orderService.previewCheckout(
      this.getUserId(req),
      dto.currency,
      dto.couponCode,
      dto.couponCodes,
    );

    return {
      preview: result.data,
      message: 'تم إنشاء معاينة الطلب بنجاح'
    };
  }

  @Get('checkout/payment-options')
  @ApiOperation({
    summary: 'خيارات الدفع',
    description: 'جلب خيارات الدفع للمستخدم مع حالة الأهلية',
  })
  @ApiQuery({ name: 'currency', required: false, type: String, description: 'العملة المطلوبة لحسابات الدفع المحلية' })
  @ApiResponse({
    status: 200,
    description: 'تم الحصول على خيارات الدفع بنجاح',
    type: CheckoutPaymentOptionsResponseDto,
  })
  async getPaymentOptions(
    @Req() req: ExpressRequest,
    @Query('currency') currency?: string,
  ) {
    const paymentOptions = await this.orderService.getPaymentOptions(this.getUserId(req), currency);

    return {
      paymentOptions,
      message: 'تم الحصول على خيارات الدفع بنجاح',
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
  ) {
    const userId = this.getUserId(req);
    const result = await this.orderService.confirmCheckout(userId, dto);
    const paymentOptions = await this.orderService.getPaymentOptions(userId, dto.currency);

    return {
      ...result,
      paymentOptions,
      message: 'تم إنشاء الطلب بنجاح'
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
  ) {
    const userId = this.getUserId(req);
    const [result, codEligibility] = await Promise.all([
      this.orderService.getUserOrders(userId, query),
      this.orderService.checkCODEligibility(userId),
    ]);

    const customerOrderStats = {
      totalOrders: codEligibility.totalOrders,
      completedOrders: codEligibility.completedOrders,
      inProgressOrders: codEligibility.inProgressOrders,
      cancelledOrders: codEligibility.cancelledOrders,
      requiredForCOD: codEligibility.requiredOrders,
      remainingForCOD: codEligibility.remainingOrders,
      codEligible: codEligibility.eligible,
    };

    return {
      orders: result.orders,
      pagination: result.pagination,
      codEligibility,
      customerOrderStats,
      message: 'تم الحصول على الطلبات بنجاح'
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
  ) {
    const userId = this.getUserId(req);
    const query: ListOrdersDto = {
      page: 1,
      limit: limit || 5,
    };

    const [result, codEligibility] = await Promise.all([
      this.orderService.getUserOrders(userId, query),
      this.orderService.checkCODEligibility(userId),
    ]);

    const customerOrderStats = {
      totalOrders: codEligibility.totalOrders,
      completedOrders: codEligibility.completedOrders,
      inProgressOrders: codEligibility.inProgressOrders,
      cancelledOrders: codEligibility.cancelledOrders,
      requiredForCOD: codEligibility.requiredOrders,
      remainingForCOD: codEligibility.remainingOrders,
      codEligible: codEligibility.eligible,
    };

    return {
      orders: result.orders,
      codEligibility,
      customerOrderStats,
      message: 'تم الحصول على الطلبات الأخيرة'
    };
  }

  @Get(':id([0-9a-fA-F]{24})')
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
  ) {
    const orderDoc = await this.orderService.getOrderDetails(orderId, this.getUserId(req));
    const order = orderDoc.toObject();

    const userIdForStats = orderDoc.userId ? orderDoc.userId.toString() : undefined;
    let codEligibility;
    let customerOrderStats;

    if (userIdForStats) {
      codEligibility = await this.orderService.checkCODEligibility(userIdForStats);
      customerOrderStats = {
        totalOrders: codEligibility.totalOrders,
        completedOrders: codEligibility.completedOrders,
        inProgressOrders: codEligibility.inProgressOrders,
        cancelledOrders: codEligibility.cancelledOrders,
        requiredForCOD: codEligibility.requiredOrders,
        remainingForCOD: codEligibility.remainingOrders,
        codEligible: codEligibility.eligible,
      };
    }

    return {
      order: {
        ...order,
        ...(codEligibility
          ? {
              codEligibility,
              customerOrderStats,
            }
          : {}),
      },
      message: 'تم الحصول على تفاصيل الطلب'
    };
  }

  @Get(':id([0-9a-fA-F]{24})/track')
  @ApiOperation({
    summary: 'تتبع الطلب',
    description: 'الحصول على معلومات تتبع الطلب والخط الزمني',
  })
  @ApiParam({ name: 'id', description: 'معرف الطلب' })
  @ApiResponse({ status: 200, description: 'تم الحصول على معلومات التتبع' })
  async trackOrder(
    @Req() req: ExpressRequest,
    @Param('id') orderId: string,
  ) {
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
      tracking,
      message: 'تم الحصول على معلومات التتبع'
    };
  }

  @Post(':id([0-9a-fA-F]{24})/cancel')
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
  ) {
    const order = await this.orderService.cancelOrder(orderId, this.getUserId(req), dto);

    return {
      order,
      message: 'تم إلغاء الطلب بنجاح'
    };
  }

  @Post(':id([0-9a-fA-F]{24})/rate')
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
  ) {
    const order = await this.orderService.rateOrder(orderId, this.getUserId(req), dto);

    return {
      order,
      message: 'شكراً لتقييمك!'
    };
  }

  @Post(':id([0-9a-fA-F]{24})/notes')
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
  ) {
    const order = await this.orderService.addOrderNotes(orderId, dto, this.getUserId(req));

    return {
      order,
      message: 'تم إضافة الملاحظات بنجاح'
    };
  }

  // ===== Statistics =====

  @Get('stats/summary')
  @ApiOperation({
    summary: 'إحصائيات الطلبات',
    description: 'الحصول على إحصائيات طلبات المستخدم',
  })
  @ApiResponse({ status: 200, description: 'تم الحصول على الإحصائيات' })
  async getOrderStatistics(@Req() req: ExpressRequest) {
    const stats = await this.orderService.getUserOrderStatistics(this.getUserId(req));

    return {
      stats,
      message: 'تم الحصول على الإحصائيات'
    };
  }

  // ===== Helper Methods =====

  private getStatusTitle(status: string): string {
    const titles: Record<string, string> = {
      pending_payment: 'في انتظار الدفع',
      confirmed: 'مؤكد',
      processing: 'قيد التجهيز',
      shipped: 'تم الشحن',
      delivered: 'تم التسليم',
      completed: 'مكتمل',
      on_hold: 'معلق',
      cancelled: 'ملغي',
      returned: 'مرتجع',
      refunded: 'مسترد',
    };
    return titles[status] || status;
  }

  private getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      pending_payment: '⏳',
      confirmed: '✅',
      processing: '📦',
      shipped: '🚚',
      delivered: '🎉',
      completed: '✨',
      on_hold: '⏸️',
      cancelled: '❌',
      returned: '↩️',
      refunded: '💰',
    };
    return icons[status] || '📋';
  }
}
