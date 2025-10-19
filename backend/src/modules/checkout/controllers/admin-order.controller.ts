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
  ApiQuery
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { UserRole } from '../../users/schemas/user.schema';
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
  OrderResponseDto
} from '../dto/order.dto';

/**
 * Controller للطلبات - للإدارة
 */
@ApiTags('admin-orders')
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

  @Get()
  @ApiOperation({ 
    summary: 'جميع الطلبات (للإدارة)',
    description: 'الحصول على جميع الطلبات مع إمكانية الفلترة والبحث'
  })
  @ApiResponse({ status: 200, description: 'تم الحصول على الطلبات بنجاح' })
  async getAllOrders(
    @Query() query: ListOrdersDto
  ): Promise<OrderResponseDto> {
    const result = await this.orderService.getAllOrders(query);

    return {
      success: true,
      message: 'تم الحصول على الطلبات بنجاح',
      data: result.orders,
      pagination: result.pagination
    };
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'تفاصيل الطلب (للإدارة)',
    description: 'الحصول على تفاصيل طلب محدد مع جميع المعلومات'
  })
  @ApiParam({ name: 'id', description: 'معرف الطلب' })
  @ApiResponse({ status: 200, description: 'تم الحصول على تفاصيل الطلب' })
  @ApiResponse({ status: 404, description: 'الطلب غير موجود' })
  async getOrderDetails(
    @Param('id') orderId: string
  ): Promise<OrderResponseDto> {
    const order = await this.orderService.getOrderDetails(orderId);

    return {
      success: true,
      message: 'تم الحصول على تفاصيل الطلب',
      data: order
    };
  }

  @Patch(':id/status')
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
  ): Promise<OrderResponseDto> {
    const order = await this.orderService.adminUpdateOrderStatus(
      orderId,
      dto,
      this.getUserId(req)
    );

    return {
      success: true,
      message: `تم تحديث حالة الطلب إلى ${dto.status}`,
      data: order
    };
  }

  @Post(':id/ship')
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
  ): Promise<OrderResponseDto> {
    const order = await this.orderService.shipOrder(
      orderId,
      dto,
      this.getUserId(req)
    );

    return {
      success: true,
      message: 'تم شحن الطلب بنجاح',
      data: {
        orderNumber: order.orderNumber,
        trackingNumber: order.trackingNumber,
        trackingUrl: order.trackingUrl,
        estimatedDelivery: order.estimatedDeliveryDate
      }
    };
  }

  @Post(':id/refund')
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
  ): Promise<OrderResponseDto> {
    const order = await this.orderService.processRefund(
      orderId,
      dto,
      this.getUserId(req)
    );

    return {
      success: true,
      message: `تم استرداد ${dto.amount} بنجاح`,
      data: {
        orderNumber: order.orderNumber,
        refundAmount: order.returnInfo.returnAmount,
        refundReason: order.returnInfo.returnReason,
        refundedAt: order.returnInfo.returnedAt
      }
    };
  }

  @Post(':id/notes')
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
  ): Promise<OrderResponseDto> {
    const order = await this.orderService.addOrderNotes(
      orderId,
      { ...dto, type: 'admin' },
      this.getUserId(req),
      true
    );

    return {
      success: true,
      message: 'تم إضافة الملاحظات الإدارية',
      data: order
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
  ): Promise<OrderResponseDto> {
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
      success: errors.length === 0,
      message: `تم تحديث ${results.length} طلب، فشل ${errors.length} طلب`,
      data: { results, errors }
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
  ): Promise<OrderResponseDto> {
    const analytics = await this.orderService.getAdminAnalytics(query);

    return {
      success: true,
      message: 'تم الحصول على التحليلات',
      data: analytics
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
  ): Promise<OrderResponseDto> {
    // تطبيق تحليل الإيرادات المفصل
    const analytics = await this.orderService.getRevenueAnalytics({
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined
    });

    return {
      success: true,
      message: 'تم الحصول على تحليل الإيرادات',
      data: analytics
    };
  }

  @Get('analytics/performance')
  @ApiOperation({ 
    summary: 'تحليل الأداء',
    description: 'تحليل أداء النظام والطلبات'
  })
  @ApiResponse({ status: 200, description: 'تم الحصول على تحليل الأداء' })
  async getPerformanceAnalytics(): Promise<OrderResponseDto> {
    // تطبيق تحليل الأداء
    const analytics = await this.orderService.getPerformanceAnalytics();

    return {
      success: true,
      message: 'تم الحصول على تحليل الأداء',
      data: analytics
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
  ): Promise<OrderResponseDto> {
    const result = await this.orderService.getAllOrders(query);

    if (format === 'pdf') {
      // إنشاء PDF
      const pdfUrl = await this.orderService.generateOrdersPDF(result.orders);
      return {
        success: true,
        message: 'تم إنشاء تقرير PDF',
        data: { url: pdfUrl }
      };
    }

    if (format === 'excel') {
      // إنشاء Excel
      const excelUrl = await this.orderService.generateOrdersExcel(result.orders);
      return {
        success: true,
        message: 'تم إنشاء ملف Excel',
        data: { url: excelUrl }
      };
    }

    return {
      success: true,
      message: 'تم إنشاء التقرير',
      data: result
    };
  }

  @Get('reports/financial')
  @ApiOperation({ 
    summary: 'التقرير المالي',
    description: 'تقرير مالي مفصل للطلبات'
  })
  @ApiResponse({ status: 200, description: 'تم إنشاء التقرير المالي' })
  async generateFinancialReport(): Promise<OrderResponseDto> {
    // تطبيق التقرير المالي
    const report = await this.orderService.generateFinancialReport();

    return {
      success: true,
      message: 'تم إنشاء التقرير المالي',
      data: report
    };
  }
}
