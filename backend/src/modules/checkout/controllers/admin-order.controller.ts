import { 
  Body, 
  Controller, 
  Get, 
  Param, 
  Post, 
  Patch,
  Query, 
  Req, 
  UseGuards 
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';
import { UserRole } from '../../users/schemas/user.schema';
import { AdminPermission } from '../../../shared/constants/permissions';
import { Request as ExpressRequest } from 'express';
import { OrderService } from '../services/order.service';
import {
  ListOrdersDto,
  UpdateOrderStatusDto,
  ShipOrderDto,
  RefundOrderDto,
  AddOrderNotesDto,
  OrderAnalyticsDto,
  BulkOrderUpdateDto,
  VerifyPaymentDto,
} from '../dto/order.dto';
import { PaymentStatus } from '../schemas/order.schema';

/**
 * Controller للطلبات - للإدارة
 */
@ApiTags('إدارة-الطلبات')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin/orders')
export class AdminOrderController {
  constructor(private readonly orderService: OrderService) {}

  private getUserId(req: ExpressRequest): string {
    return (req as unknown as { user: { sub: string } }).user.sub;
  }

  // ===== Order Management =====

  @RequirePermissions(AdminPermission.ORDERS_READ, AdminPermission.ADMIN_ACCESS)
  @Get()
  @ApiOperation({
    summary: 'جميع الطلبات (للإدارة)',
    description: 'الحصول على جميع الطلبات مع إمكانية الفلترة والبحث'
  })
  @ApiResponse({ status: 200, description: 'تم الحصول على الطلبات بنجاح' })
  async getAllOrders(
    @Query() query: ListOrdersDto
  ) {
    const result = await this.orderService.getAllOrders(query);

    return {
      orders: result.orders,
      pagination: result.pagination,
      message: 'تم الحصول على الطلبات بنجاح'
    };
  }

  @Get(':id([0-9a-fA-F]{24})')
  @ApiOperation({ 
    summary: 'تفاصيل الطلب (للإدارة)',
    description: 'الحصول على تفاصيل طلب محدد مع جميع المعلومات'
  })
  @ApiParam({ name: 'id', description: 'معرف الطلب' })
  @ApiResponse({ status: 200, description: 'تم الحصول على تفاصيل الطلب' })
  @ApiResponse({ status: 404, description: 'الطلب غير موجود' })
  async getOrderDetails(
    @Param('id') orderId: string
  ) {
    const order = await this.orderService.getOrderDetails(orderId);

    return {
      order,
      message: 'تم الحصول على تفاصيل الطلب'
    };
  }

  @Patch(':id([0-9a-fA-F]{24})/status')
  @ApiOperation({ 
    summary: 'تحديث حالة الطلب',
    description: 'تحديث حالة طلب محدد من قبل الإدارة'
  })
  @ApiParam({ name: 'id', description: 'معرف الطلب' })
  @ApiResponse({ status: 200, description: 'تم تحديث حالة الطلب بنجاح' })
  @ApiResponse({ status: 400, description: 'لا يمكن تحديث الحالة' })
  async updateOrderStatus(
    @Req() req: ExpressRequest,
    @Param('id') orderId: string,
    @Body() dto: UpdateOrderStatusDto
  ) {
    const order = await this.orderService.adminUpdateOrderStatus(
      orderId,
      dto,
      this.getUserId(req)
    );

    return {
      order,
      message: `تم تحديث حالة الطلب إلى ${dto.status}`
    };
  }

  @Post(':id([0-9a-fA-F]{24})/ship')
  @ApiOperation({ 
    summary: 'شحن الطلب',
    description: 'تحديث معلومات الشحن للطلب'
  })
  @ApiParam({ name: 'id', description: 'معرف الطلب' })
  @ApiResponse({ status: 200, description: 'تم شحن الطلب بنجاح' })
  @ApiResponse({ status: 400, description: 'الطلب غير جاهز للشحن' })
  async shipOrder(
    @Req() req: ExpressRequest,
    @Param('id') orderId: string,
    @Body() dto: ShipOrderDto
  ) {
    const order = await this.orderService.shipOrder(
      orderId,
      dto,
      this.getUserId(req)
    );

    return {
      orderNumber: order.orderNumber,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      estimatedDelivery: order.estimatedDeliveryDate,
      message: 'تم شحن الطلب بنجاح'
    };
  }

  @Post(':id([0-9a-fA-F]{24})/refund')
  @ApiOperation({ 
    summary: 'معالجة الاسترداد',
    description: 'معالجة استرداد مبلغ الطلب'
  })
  @ApiParam({ name: 'id', description: 'معرف الطلب' })
  @ApiResponse({ status: 200, description: 'تم معالجة الاسترداد بنجاح' })
  @ApiResponse({ status: 400, description: 'لا يمكن معالجة الاسترداد' })
  async processRefund(
    @Req() req: ExpressRequest,
    @Param('id') orderId: string,
    @Body() dto: RefundOrderDto
  ) {
    const order = await this.orderService.processRefund(
      orderId,
      dto,
      this.getUserId(req)
    );

    return {
      orderNumber: order.orderNumber,
      refundAmount: order.returnInfo.returnAmount,
      refundReason: order.returnInfo.returnReason,
      refundedAt: order.returnInfo.returnedAt,
      message: `تم استرداد ${dto.amount} بنجاح`
    };
  }

  @Post(':id([0-9a-fA-F]{24})/notes')
  @ApiOperation({ 
    summary: 'إضافة ملاحظات إدارية',
    description: 'إضافة ملاحظات إدارية للطلب'
  })
  @ApiParam({ name: 'id', description: 'معرف الطلب' })
  @ApiResponse({ status: 200, description: 'تم إضافة الملاحظات بنجاح' })
  async addAdminNotes(
    @Req() req: ExpressRequest,
    @Param('id') orderId: string,
    @Body() dto: AddOrderNotesDto
  ) {
    const order = await this.orderService.addOrderNotes(
      orderId,
      { ...dto, type: 'admin' },
      this.getUserId(req),
      true
    );

    return {
      order,
      message: 'تم إضافة الملاحظات الإدارية'
    };
  }

  @Post(':id([0-9a-fA-F]{24})/verify-payment')
  @ApiOperation({ 
    summary: 'مطابقة الدفع المحلي',
    description: 'مطابقة الدفع للطلبات المحلية (إدخال المبلغ والعملة)'
  })
  @ApiParam({ name: 'id', description: 'معرف الطلب' })
  @ApiBody({ type: VerifyPaymentDto })
  @ApiResponse({ status: 200, description: 'تم مطابقة الدفع بنجاح' })
  @ApiResponse({ status: 400, description: 'فشل في مطابقة الدفع' })
  async verifyPayment(
    @Req() req: ExpressRequest,
    @Param('id') orderId: string,
    @Body() dto: VerifyPaymentDto
  ) {
    const order = await this.orderService.verifyLocalPayment(
      orderId,
      dto,
      this.getUserId(req)
    );

    return {
      order,
      message: order.paymentStatus === PaymentStatus.PAID 
        ? 'تم قبول الدفع بنجاح' 
        : 'تم رفض الدفع - المبلغ غير كافٍ',
      paymentStatus: order.paymentStatus,
      verifiedAmount: order.verifiedPaymentAmount,
      orderAmount: order.total,
      currency: order.currency
    };
  }

  // ===== Bulk Operations =====

  @Post('bulk/update-status')
  @ApiOperation({ 
    summary: 'تحديث حالة عدة طلبات',
    description: 'تحديث حالة عدة طلبات في عملية واحدة'
  })
  @ApiResponse({ status: 200, description: 'تم تحديث الطلبات بنجاح' })
  @ApiResponse({ status: 400, description: 'فشل في تحديث بعض الطلبات' })
  async bulkUpdateStatus(
    @Req() req: ExpressRequest,
    @Body() dto: BulkOrderUpdateDto
  ) {
    const results = [];
    const errors = [];

    for (const orderId of dto.orderIds) {
      try {
        const order = await this.orderService.adminUpdateOrderStatus(
          orderId,
          { status: dto.status, notes: dto.notes },
          this.getUserId(req)
        );
        results.push({ orderId, success: true, order });
      } catch (error) {
        errors.push({ orderId, error: (error as Error).message });
      }
    }

    return {
      results,
      errors,
      message: `تم تحديث ${results.length} طلب، فشل ${errors.length} طلب`
    };
  }

  // ===== Statistics =====

  @RequirePermissions(AdminPermission.ORDERS_READ, AdminPermission.ADMIN_ACCESS)
  @Get('stats')
  @ApiOperation({
    summary: 'إحصائيات الطلبات الأساسية',
    description: 'الحصول على إحصائيات أساسية للطلبات'
  })
  @ApiResponse({ status: 200, description: 'تم الحصول على الإحصائيات' })
  async getOrderStats() {
    const stats = await this.orderService.getStats();

    return {
      stats,
      message: 'تم الحصول على إحصائيات الطلبات'
    };
  }

  // ===== Analytics =====

  @Get('analytics/summary')
  @ApiOperation({ 
    summary: 'التحليلات الإدارية',
    description: 'الحصول على تحليلات شاملة للطلبات'
  })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'عدد الأيام' })
  @ApiQuery({ name: 'groupBy', required: false, type: String, description: 'تجميع البيانات' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'فلترة حسب الحالة' })
  @ApiResponse({ status: 200, description: 'تم الحصول على التحليلات' })
  async getAnalytics(
    @Query() query: OrderAnalyticsDto
  ) {
    const analytics = await this.orderService.getAdminAnalytics(query);

    return {
      analytics,
      message: 'تم الحصول على التحليلات'
    };
  }

  @Get('analytics/revenue')
  @ApiOperation({ 
    summary: 'تحليل الإيرادات',
    description: 'تحليل مفصل للإيرادات والأرباح'
  })
  @ApiQuery({ name: 'fromDate', required: false, type: String, description: 'تاريخ البداية' })
  @ApiQuery({ name: 'toDate', required: false, type: String, description: 'تاريخ النهاية' })
  @ApiResponse({ status: 200, description: 'تم الحصول على تحليل الإيرادات' })
  async getRevenueAnalytics(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string
  ) {
    // تطبيق تحليل الإيرادات المفصل
    const analytics = await this.orderService.getRevenueAnalytics({
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined
    });

    return {
      analytics,
      message: 'تم الحصول على تحليل الإيرادات'
    };
  }

  @Get('analytics/performance')
  @ApiOperation({ 
    summary: 'تحليل الأداء',
    description: 'تحليل أداء النظام والطلبات'
  })
  @ApiResponse({ status: 200, description: 'تم الحصول على تحليل الأداء' })
  async getPerformanceAnalytics() {
    // تطبيق تحليل الأداء
    const analytics = await this.orderService.getPerformanceAnalytics();

    return {
      analytics,
      message: 'تم الحصول على تحليل الأداء'
    };
  }

  // ===== Reports =====

  @Get('reports/orders')
  @ApiOperation({ 
    summary: 'تقرير الطلبات',
    description: 'تقرير مفصل للطلبات'
  })
  @ApiQuery({ name: 'format', required: false, type: String, description: 'تنسيق التقرير (pdf, excel)' })
  @ApiResponse({ status: 200, description: 'تم إنشاء التقرير' })
  async generateOrdersReport(
    @Query() query: ListOrdersDto,
    @Query('format') format: string = 'json'
  ) {
    const result = await this.orderService.getAllOrders(query);

    if (format === 'pdf') {
      // إنشاء PDF
      const pdfUrl = await this.orderService.generateOrdersPDF(result.orders);
      return {
        url: pdfUrl,
        message: 'تم إنشاء تقرير PDF'
      };
    }

    if (format === 'excel') {
      // إنشاء Excel
      const excelUrl = await this.orderService.generateOrdersExcel(result.orders);
      return {
        url: excelUrl,
        message: 'تم إنشاء ملف Excel'
      };
    }

    return {
      result,
      message: 'تم إنشاء التقرير'
    };
  }

  @Get('reports/financial')
  @ApiOperation({ 
    summary: 'التقرير المالي',
    description: 'تقرير مالي مفصل للطلبات'
  })
  @ApiResponse({ status: 200, description: 'تم إنشاء التقرير المالي' })
  async generateFinancialReport() {
    // تطبيق التقرير المالي
    const report = await this.orderService.generateFinancialReport();

    return {
      report,
      message: 'تم إنشاء التقرير المالي'
    };
  }

  @Post('analytics/export')
  @ApiOperation({
    summary: 'تصدير تحليلات الطلبات',
    description: 'تصدير بيانات تحليلات الطلبات بصيغ مختلفة (CSV, Excel, JSON)'
  })
  @ApiQuery({ name: 'format', required: false, type: String, description: 'صيغة الملف (csv, xlsx, json)', example: 'csv' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'عدد الأيام', example: 30 })
  @ApiQuery({ name: 'fromDate', required: false, type: String, description: 'من تاريخ' })
  @ApiQuery({ name: 'toDate', required: false, type: String, description: 'إلى تاريخ' })
  @ApiResponse({
    status: 200,
    description: 'تم تصدير البيانات بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            fileUrl: { type: 'string' },
            format: { type: 'string' },
            exportedAt: { type: 'string' },
            fileName: { type: 'string' },
            recordCount: { type: 'number' },
            summary: { type: 'object' }
          }
        }
      }
    }
  })
  async exportOrderAnalytics(
    @Query('format') format?: string,
    @Query('days') days?: number,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string
  ) {
    const exportFormat = format || 'csv';
    const analyticsParams: OrderAnalyticsDto = {
      days: days || 30,
    };

    return await this.orderService.exportOrderAnalytics(
      exportFormat,
      analyticsParams,
      fromDate,
      toDate
    );
  }

  @Post('export')
  @ApiOperation({
    summary: 'تصدير قائمة الطلبات',
    description: 'تصدير قائمة الطلبات مع التصفية بصيغ مختلفة (CSV, Excel, JSON)'
  })
  @ApiQuery({ name: 'format', required: false, type: String, description: 'صيغة الملف', example: 'csv' })
  @ApiResponse({
    status: 200,
    description: 'تم تصدير القائمة بنجاح'
  })
  async exportOrders(
    @Query() query: ListOrdersDto,
    @Query('format') format?: string
  ) {
    const exportFormat = format || 'csv';
    return await this.orderService.exportOrders(exportFormat, query);
  }
}
