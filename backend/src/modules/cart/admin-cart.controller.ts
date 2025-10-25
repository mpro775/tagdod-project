import { Controller, Get, Post, Param, Query, UseGuards, Body } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RequirePermissions } from '../../shared/decorators/permissions.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { AdminPermission } from '../../shared/constants/permissions';
import { CartService } from './cart.service';

@ApiTags('إدارة-السلات')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin/carts')
export class AdminCartController {
  constructor(private readonly cartService: CartService) {}

  @RequirePermissions(AdminPermission.CARTS_READ, AdminPermission.ADMIN_ACCESS)
  @Get('abandoned')
  @ApiOperation({
    summary: 'الحصول على السلات المهجورة',
    description: 'الحصول على قائمة السلات التي تم التخلي عنها لفترة محددة. يتطلب صلاحيات إدارية.',
    tags: ['إدارة السلات'],
  })
  @ApiQuery({
    name: 'hours',
    required: false,
    description: 'عدد الساعات للاعتبار سلة مهجورة',
    example: '24',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'عدد السلات المراد عرضها',
    example: '50',
  })
  @ApiOkResponse({
    description: 'تم الحصول على السلات المهجورة بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
              userId: { type: 'string', example: '507f1f77bcf86cd799439012' },
              items: { type: 'array' },
              pricingSummary: {
                type: 'object',
                properties: {
                  total: { type: 'number', example: 599.98 },
                },
              },
              lastActivity: { type: 'string', format: 'date-time' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        count: { type: 'number', example: 25 },
        totalCarts: { type: 'number', example: 50 },
        totalValue: { type: 'number', example: 14999.5 },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'غير مصرح - مطلوب تسجيل دخول' })
  @ApiForbiddenResponse({ description: 'ممنوع - مطلوب صلاحيات إدارية' })
  async getAbandonedCarts(
    @Query('hours') hours: string = '24',
    @Query('limit') limit: string = '50',
  ) {
    const hoursInactive = parseInt(hours);
    const carts = await this.cartService.findAbandonedCarts(hoursInactive);

    // Apply limit
    const limitNum = parseInt(limit);
    const limitedCarts = carts.slice(0, limitNum);

    // Calculate total value
    type CartLean = { pricingSummary?: { total?: number } };
    const totalValue = limitedCarts.reduce(
      (sum, cart: CartLean) => sum + (cart.pricingSummary?.total || 0),
      0,
    );

    return {
      carts: limitedCarts,
      count: limitedCarts.length,
      totalCarts: carts.length,
      totalValue,
    };
  }

  @RequirePermissions(AdminPermission.CARTS_SEND_REMINDERS, AdminPermission.ADMIN_ACCESS)
  @Post('send-reminders')
  @ApiOperation({
    summary: 'إرسال تذكيرات لجميع السلات المهجورة',
    description:
      'إرسال رسائل تذكير عبر البريد الإلكتروني لجميع السلات المهجورة. يتطلب صلاحيات إدارية.',
    tags: ['إدارة السلات'],
  })
  @ApiOkResponse({
    description: 'تم إرسال التذكيرات بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'تم إرسال 25 رسالة تذكير' },
        data: {
          type: 'object',
          properties: {
            emailsSent: { type: 'number', example: 25 },
            successCount: { type: 'number', example: 23 },
            failedCount: { type: 'number', example: 2 },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'غير مصرح - مطلوب تسجيل دخول' })
  @ApiForbiddenResponse({ description: 'ممنوع - مطلوب صلاحيات إدارية' })
  async sendReminders() {
    const result = await this.cartService.processAbandonedCarts();

    return {
      ...result,
      message: `Sent ${result.emailsSent} reminder emails`,
    };
  }

  @Post(':id/send-reminder')
  @ApiOperation({
    summary: 'إرسال تذكير لسلة محددة',
    description: 'إرسال رسالة تذكير عبر البريد الإلكتروني لسلة مهجورة محددة. يتطلب صلاحيات إدارية.',
    tags: ['إدارة السلات'],
  })
  @ApiParam({
    name: 'id',
    description: 'معرف السلة',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiOkResponse({
    description: 'تم إرسال التذكير بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'تم إرسال التذكير بنجاح' },
        data: {
          type: 'object',
          properties: {
            cartId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            emailSent: { type: 'boolean', example: true },
            sentAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'السلة غير موجودة' })
  @ApiUnauthorizedResponse({ description: 'غير مصرح - مطلوب تسجيل دخول' })
  @ApiForbiddenResponse({ description: 'ممنوع - مطلوب صلاحيات إدارية' })
  async sendSingleReminder(@Param('id') cartId: string) {
    const result = await this.cartService.sendAbandonmentReminder(cartId);

    return {
      ...result,
      message: 'Reminder sent successfully',
    };
  }

  @RequirePermissions(AdminPermission.ANALYTICS_READ, AdminPermission.ADMIN_ACCESS)
  @Get('analytics')
  @ApiOperation({
    summary: 'الحصول على تحليلات شاملة للسلات',
    description: 'الحصول على تحليلات مفصلة عن السلات لفترة محددة. يتطلب صلاحيات إدارية.',
    tags: ['إدارة السلات - التحليلات'],
  })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'الفترة بالأيام',
    example: '30',
  })
  @ApiOkResponse({
    description: 'تم الحصول على التحليلات بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            totalCarts: { type: 'number', example: 1250 },
            activeCarts: { type: 'number', example: 800 },
            abandonedCarts: { type: 'number', example: 450 },
            conversionRate: { type: 'number', example: 0.35 },
            averageCartValue: { type: 'number', example: 245.5 },
            totalRevenue: { type: 'number', example: 306875.0 },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'غير مصرح - مطلوب تسجيل دخول' })
  @ApiForbiddenResponse({ description: 'ممنوع - مطلوب صلاحيات إدارية' })
  async getAnalytics(@Query('period') period: string = '30') {
    return await this.cartService.getCartAnalytics(parseInt(period));
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'الحصول على إحصائيات السلات',
    description: 'الحصول على نظرة عامة على إحصائيات السلات. يتطلب صلاحيات إدارية.',
    tags: ['إدارة السلات - الإحصائيات'],
  })
  @ApiOkResponse({
    description: 'تم الحصول على الإحصائيات بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            totalCarts: { type: 'number', example: 5000 },
            activeCarts: { type: 'number', example: 3200 },
            completedCarts: { type: 'number', example: 1800 },
            abandonedCarts: { type: 'number', example: 1400 },
            totalValue: { type: 'number', example: 1225000.0 },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'غير مصرح - مطلوب تسجيل دخول' })
  @ApiForbiddenResponse({ description: 'ممنوع - مطلوب صلاحيات إدارية' })
  async getStatistics() {
    return await this.cartService.getCartStatistics();
  }

  @Get('conversion-rates')
  @ApiOperation({
    summary: 'الحصول على معدلات التحويل',
    description: 'الحصول على معدلات تحويل السلات لفترة محددة. يتطلب صلاحيات إدارية.',
    tags: ['إدارة السلات - التحليلات'],
  })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'الفترة بالأيام',
    example: '30',
  })
  @ApiOkResponse({
    description: 'تم الحصول على معدلات التحويل بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            overallRate: { type: 'number', example: 0.35 },
            dailyRates: { type: 'array' },
            weeklyRates: { type: 'array' },
            monthlyRate: { type: 'number', example: 0.32 },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'غير مصرح - مطلوب تسجيل دخول' })
  @ApiForbiddenResponse({ description: 'ممنوع - مطلوب صلاحيات إدارية' })
  async getConversionRates(@Query('period') period: string = '30') {
    return await this.cartService.getConversionRates(parseInt(period));
  }

  @RequirePermissions(AdminPermission.CARTS_READ, AdminPermission.ADMIN_ACCESS)
  @Get('all')
  @ApiOperation({
    summary: 'الحصول على جميع السلات مع الترقيم والتصفية',
    description: 'الحصول على قائمة بجميع السلات مع إمكانية الترقيم والتصفية. يتطلب صلاحيات إدارية.',
    tags: ['إدارة السلات'],
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'رقم الصفحة',
    example: '1',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'عدد العناصر في الصفحة',
    example: '20',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'تصفية حسب الحالة',
    example: 'active',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'تصفية حسب معرف المستخدم',
    example: '507f1f77bcf86cd799439012',
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    description: 'تاريخ البداية',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    description: 'تاريخ النهاية',
    example: '2024-12-31',
  })
  @ApiOkResponse({
    description: 'تم الحصول على السلات بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
              userId: { type: 'string', example: '507f1f77bcf86cd799439012' },
              items: { type: 'array' },
              status: { type: 'string', example: 'active' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 20 },
            total: { type: 'number', example: 100 },
            totalPages: { type: 'number', example: 5 },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'غير مصرح - مطلوب تسجيل دخول' })
  @ApiForbiddenResponse({ description: 'ممنوع - مطلوب صلاحيات إدارية' })
  async getAllCarts(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('status') status?: string,
    @Query('userId') userId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const filters = {
      status: status as string | undefined,
      userId,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    };

    return await this.cartService.getAllCarts(parseInt(page), parseInt(limit), filters);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'الحصول على تفاصيل السلة بواسطة المعرف',
    description: 'الحصول على تفاصيل سلة محددة باستخدام المعرف. يتطلب صلاحيات إدارية.',
    tags: ['إدارة السلات'],
  })
  @ApiParam({
    name: 'id',
    description: 'معرف السلة',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiOkResponse({
    description: 'تم الحصول على تفاصيل السلة بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            userId: { type: 'string', example: '507f1f77bcf86cd799439012' },
            items: { type: 'array' },
            pricingSummary: { type: 'object' },
            status: { type: 'string', example: 'active' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'السلة غير موجودة' })
  @ApiUnauthorizedResponse({ description: 'غير مصرح - مطلوب تسجيل دخول' })
  @ApiForbiddenResponse({ description: 'ممنوع - مطلوب صلاحيات إدارية' })
  async getCartById(@Param('id') cartId: string) {
    return await this.cartService.getCartById(cartId);
  }

  @Post(':id/convert-to-order')
  @ApiOperation({
    summary: 'تحويل السلة يدوياً إلى طلب',
    description: 'تحويل سلة محددة إلى طلب يدوياً. يتطلب صلاحيات إدارية.',
    tags: ['إدارة السلات'],
  })
  @ApiParam({
    name: 'id',
    description: 'معرف السلة',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiOkResponse({
    description: 'تم تحويل السلة إلى طلب بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'تم تحويل السلة إلى طلب بنجاح' },
        data: {
          type: 'object',
          properties: {
            orderId: { type: 'string', example: '507f1f77bcf86cd799439015' },
            cartId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            status: { type: 'string', example: 'completed' },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'السلة غير موجودة' })
  @ApiBadRequestResponse({ description: 'لا يمكن تحويل السلة - السلة فارغة أو غير نشطة' })
  @ApiUnauthorizedResponse({ description: 'غير مصرح - مطلوب تسجيل دخول' })
  @ApiForbiddenResponse({ description: 'ممنوع - مطلوب صلاحيات إدارية' })
  async convertToOrder(@Param('id') cartId: string) {
    const result = await this.cartService.convertToOrder(cartId);
    return {
      ...result,
      message: 'Cart converted to order successfully',
    };
  }

  @Get('recovery-campaigns')
  @ApiOperation({
    summary: 'تحليلات حملات استرداد السلات',
    description:
      'الحصول على تحليلات حملات استرداد السلات المهجورة لفترة محددة. يتطلب صلاحيات إدارية.',
    tags: ['إدارة السلات - التحليلات'],
  })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'الفترة بالأيام',
    example: '30',
  })
  @ApiOkResponse({
    description: 'تم الحصول على تحليلات الحملات بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            totalCampaigns: { type: 'number', example: 5 },
            emailsSent: { type: 'number', example: 1250 },
            recoveryRate: { type: 'number', example: 0.15 },
            revenueRecovered: { type: 'number', example: 18750.0 },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'غير مصرح - مطلوب تسجيل دخول' })
  @ApiForbiddenResponse({ description: 'ممنوع - مطلوب صلاحيات إدارية' })
  async getRecoveryCampaigns(@Query('period') period: string = '30') {
    return await this.cartService.getRecoveryCampaignAnalytics(parseInt(period));
  }

  @Get('customer-behavior')
  @ApiOperation({
    summary: 'تحليلات سلوك العملاء',
    description: 'الحصول على تحليلات سلوك العملاء في السلات لفترة محددة. يتطلب صلاحيات إدارية.',
    tags: ['إدارة السلات - التحليلات'],
  })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'الفترة بالأيام',
    example: '30',
  })
  @ApiOkResponse({
    description: 'تم الحصول على تحليلات السلوك بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            averageSessionTime: { type: 'number', example: 8.5 },
            averageItemsPerCart: { type: 'number', example: 2.3 },
            topAbandonedProducts: { type: 'array' },
            peakShoppingHours: { type: 'array' },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'غير مصرح - مطلوب تسجيل دخول' })
  @ApiForbiddenResponse({ description: 'ممنوع - مطلوب صلاحيات إدارية' })
  async getCustomerBehavior(@Query('period') period: string = '30') {
    return await this.cartService.getCustomerBehaviorAnalytics(parseInt(period));
  }

  @Get('revenue-impact')
  @ApiOperation({
    summary: 'تحليل تأثير الإيرادات',
    description:
      'الحصول على تحليل تأثير السلات المهجورة على الإيرادات لفترة محددة. يتطلب صلاحيات إدارية.',
    tags: ['إدارة السلات - التحليلات'],
  })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'الفترة بالأيام',
    example: '30',
  })
  @ApiOkResponse({
    description: 'تم الحصول على تحليل التأثير بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            totalLostRevenue: { type: 'number', example: 45000.0 },
            potentialRecovery: { type: 'number', example: 11250.0 },
            recoveryPercentage: { type: 'number', example: 0.25 },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'غير مصرح - مطلوب تسجيل دخول' })
  @ApiForbiddenResponse({ description: 'ممنوع - مطلوب صلاحيات إدارية' })
  async getRevenueImpact(@Query('period') period: string = '30') {
    return await this.cartService.getRevenueImpactAnalytics(parseInt(period));
  }

  @Post('bulk-actions')
  @ApiOperation({
    summary: 'تنفيذ إجراءات جماعية على السلات',
    description:
      'تنفيذ إجراءات جماعية على مجموعة من السلات مثل الحذف أو التحديث. يتطلب صلاحيات إدارية.',
    tags: ['إدارة السلات'],
  })
  @ApiBody({
    description: 'بيانات الإجراء الجماعي',
    schema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['delete', 'clear', 'update_status'],
          example: 'delete',
          description: 'نوع الإجراء المطلوب تنفيذه',
        },
        cartIds: {
          type: 'array',
          items: { type: 'string' },
          example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
          description: 'قائمة معرفات السلات',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'تم تنفيذ الإجراء الجماعي بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'تم تنفيذ الإجراء الجماعي: تمت معالجة 25 سلة' },
        data: {
          type: 'object',
          properties: {
            processed: { type: 'number', example: 25 },
            failed: { type: 'number', example: 0 },
            errors: { type: 'array' },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'بيانات الإجراء غير صحيحة' })
  @ApiUnauthorizedResponse({ description: 'غير مصرح - مطلوب تسجيل دخول' })
  @ApiForbiddenResponse({ description: 'ممنوع - مطلوب صلاحيات إدارية' })
  async performBulkActions(@Body() body: { action: string; cartIds: string[] }) {
    const result = await this.cartService.performBulkActions(body.action, body.cartIds);
    return {
      ...result,
      message: `Bulk action completed: ${result.processed} carts processed`,
    };
  }
}
