import { Controller, Get, Param, Post, Query, UseGuards, Patch, Body, UseInterceptors } from '@nestjs/common';
import { DateTimezoneInterceptor } from '../../shared/interceptors/date-timezone.interceptor';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RequirePermissions } from '../../shared/decorators/permissions.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { AdminPermission } from '../../shared/constants/permissions';
import { ServicesService } from './services.service';
import { ServicesPermissionGuard, ServicePermission } from './guards/services-permission.guard';
import { RequireServicePermission } from './decorators/service-permission.decorator';
import { OffersStatisticsDto, OffersManagementResponseDto, EngineersOverviewStatisticsDto } from './dto/offers.dto';

@ApiTags('إدارة-الخدمات')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, ServicesPermissionGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.ENGINEER)
@UseInterceptors(DateTimezoneInterceptor)
@Controller('services/admin')
export class AdminServicesController {
  constructor(private svc: ServicesService) {}

  @RequirePermissions(AdminPermission.SERVICES_READ, AdminPermission.ADMIN_ACCESS)
  @Get('requests')
  @RequireServicePermission(ServicePermission.ADMIN)
  @ApiOperation({
    summary: 'قائمة طلبات الخدمات',
    description: 'استرداد قائمة بجميع طلبات الخدمات مع إمكانية التصفية والترقيم'
  })
  @ApiQuery({ name: 'status', required: false, description: 'حالة الطلب' })
  @ApiQuery({ name: 'type', required: false, description: 'نوع الخدمة' })
  @ApiQuery({ name: 'engineerId', required: false, description: 'معرف الفني' })
  @ApiQuery({ name: 'userId', required: false, description: 'معرف العميل' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'تاريخ البداية' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'تاريخ النهاية' })
  @ApiQuery({ name: 'search', required: false, description: 'نص البحث' })
  @ApiQuery({ name: 'page', required: false, description: 'رقم الصفحة', example: '1' })
  @ApiQuery({ name: 'limit', required: false, description: 'عدد العناصر في الصفحة', example: '20' })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد قائمة الطلبات بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'req123', description: 'معرف الطلب' },
              title: { type: 'string', example: 'إصلاح جهاز تلفزيون', description: 'عنوان الطلب' },
              description: { type: 'string', example: 'شاشة التلفزيون تظهر خطوطاً بيضاء', description: 'وصف المشكلة' },
              status: { type: 'string', example: 'pending', description: 'حالة الطلب' },
              type: { type: 'string', example: 'repair', description: 'نوع الخدمة' },
              userId: { type: 'string', example: 'user456', description: 'معرف العميل' },
              engineerId: { type: 'string', example: 'eng789', description: 'معرف الفني المسؤول' },
              createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' }
            }
          }
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 150, description: 'إجمالي العناصر' },
            page: { type: 'number', example: 1, description: 'الصفحة الحالية' },
            limit: { type: 'number', example: 20, description: 'عدد العناصر في الصفحة' },
            totalPages: { type: 'number', example: 8, description: 'إجمالي الصفحات' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'غير مصرح لك بالوصول إلى هذه البيانات'
  })
  async list(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('engineerId') engineerId?: string,
    @Query('userId') userId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('search') search?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const data = await this.svc.adminList({
      status,
      type,
      engineerId,
      userId,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      search,
      page: Number(page),
      limit: Number(limit),
    });
    return { items: data.items, meta: data.meta };
  }

  @Get('requests/:id')
  @ApiOperation({
    summary: 'الحصول على تفاصيل طلب خدمة',
    description: 'استرداد تفاصيل كاملة لطلب خدمة محدد'
  })
  @ApiParam({ name: 'id', description: 'معرف طلب الخدمة' })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد تفاصيل الطلب بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'req123', description: 'معرف الطلب' },
            title: { type: 'string', example: 'إصلاح جهاز تلفزيون', description: 'عنوان الطلب' },
            description: { type: 'string', example: 'شاشة التلفزيون تظهر خطوطاً بيضاء', description: 'وصف المشكلة' },
            status: { type: 'string', example: 'in_progress', description: 'حالة الطلب' },
            type: { type: 'string', example: 'repair', description: 'نوع الخدمة' },
            userId: { type: 'string', example: 'user456', description: 'معرف العميل' },
            engineerId: { type: 'string', example: 'eng789', description: 'معرف الفني المسؤول' },
            location: {
              type: 'object',
              properties: {
                address: { type: 'string', example: 'شارع الملك فيصل، صنعاء' },
                lat: { type: 'number', example: 15.3695 },
                lng: { type: 'number', example: 44.2019 }
              }
            },
            images: {
              type: 'array',
              items: { type: 'string', example: 'https://example.com/image1.jpg' }
            },
            createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'لم يتم العثور على الطلب'
  })
  @ApiResponse({
    status: 403,
    description: 'غير مصرح لك بالوصول إلى هذا الطلب'
  })
  async getRequest(@Param('id') id: string) {
    const data = await this.svc.adminGetRequest(id);
    return data;
  }

  @Get('requests/:id/offers')
  @ApiOperation({
    summary: 'الحصول على عروض طلب خدمة',
    description: 'استرداد جميع العروض المقدمة لطلب خدمة محدد'
  })
  @ApiParam({ name: 'id', description: 'معرف طلب الخدمة' })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد العروض بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'offer123', description: 'معرف العرض' },
              engineerId: { type: 'string', example: 'eng456', description: 'معرف الفني' },
              engineerName: { type: 'string', example: 'أحمد محمد', description: 'اسم الفني' },
              price: { type: 'number', example: 150.00, description: 'سعر العرض' },
              estimatedHours: { type: 'number', example: 3, description: 'عدد الساعات المقدرة' },
              description: { type: 'string', example: 'سأصلح التلفزيون في غضون 3 ساعات', description: 'وصف العرض' },
              status: { type: 'string', example: 'pending', description: 'حالة العرض' },
              createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T11:00:00Z' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'لم يتم العثور على الطلب'
  })
  async getRequestOffers(@Param('id') id: string) {
    const data = await this.svc.adminGetRequestOffers(id);
    return data;
  }

  @Patch('requests/:id/status')
  @ApiOperation({
    summary: 'تحديث حالة طلب خدمة',
    description: 'تحديث حالة طلب خدمة من قبل الإدارة'
  })
  @ApiParam({ name: 'id', description: 'معرف طلب الخدمة' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['status'],
      properties: {
        status: { type: 'string', example: 'approved', description: 'الحالة الجديدة' },
        note: { type: 'string', example: 'تم الموافقة على الطلب', description: 'ملاحظة إضافية' }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'تم تحديث حالة الطلب بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'req123' },
            status: { type: 'string', example: 'approved' },
            updatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T12:00:00Z' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'لم يتم العثور على الطلب'
  })
  async updateRequestStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('note') note?: string,
  ) {
    const data = await this.svc.adminUpdateRequestStatus(id, status, note);
    return data;
  }

  @Post('requests/:id/cancel')
  async cancel(@Param('id') id: string, @Body('reason') reason?: string) {
    const data = await this.svc.adminCancel(id, reason);
    return data;
  }

  @Post('requests/:id/assign-engineer')
  @ApiOperation({
    summary: 'تعيين فني لطلب خدمة',
    description: 'تعيين فني محدد لطلب خدمة من قبل الإدارة'
  })
  @ApiParam({ name: 'id', description: 'معرف طلب الخدمة' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['engineerId'],
      properties: {
        engineerId: { type: 'string', example: 'eng456', description: 'معرف الفني' },
        note: { type: 'string', example: 'تم تعيين الفني أحمد للمهمة', description: 'ملاحظة إضافية' }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'تم تعيين الفني بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'req123' },
            engineerId: { type: 'string', example: 'eng456' },
            status: { type: 'string', example: 'assigned' },
            assignedAt: { type: 'string', format: 'date-time', example: '2024-01-15T12:30:00Z' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'لم يتم العثور على الطلب أو الفني'
  })
  async assignEngineer(
    @Param('id') id: string,
    @Body('engineerId') engineerId: string,
    @Body('note') note?: string,
  ) {
    const data = await this.svc.adminAssignEngineer(id, engineerId, note);
    return data;
  }

  // === إحصائيات شاملة ===
  @Get('statistics/overview')
  @ApiOperation({
    summary: 'إحصائيات عامة للخدمات',
    description: 'استرداد إحصائيات شاملة حول جميع الخدمات والطلبات'
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد الإحصائيات بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            totalRequests: { type: 'number', example: 1250, description: 'إجمالي الطلبات' },
            pendingRequests: { type: 'number', example: 45, description: 'الطلبات المعلقة' },
            inProgressRequests: { type: 'number', example: 23, description: 'الطلبات قيد التنفيذ' },
            completedRequests: { type: 'number', example: 1182, description: 'الطلبات المكتملة' },
            totalEngineers: { type: 'number', example: 15, description: 'إجمالي الفنيين' },
            activeEngineers: { type: 'number', example: 12, description: 'الفنيين النشطين' },
            averageRating: { type: 'number', example: 4.3, description: 'متوسط التقييمات' }
          }
        }
      }
    }
  })
  async getOverviewStats() {
    const data = await this.svc.getOverviewStatistics();
    return data;
  }

  @Get('statistics/requests')
  @ApiOperation({
    summary: 'إحصائيات الطلبات',
    description: 'استرداد إحصائيات مفصلة حول الطلبات حسب الفترة الزمنية'
  })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'تاريخ البداية (ISO format)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'تاريخ النهاية (ISO format)' })
  @ApiQuery({ name: 'groupBy', required: false, enum: ['day', 'week', 'month'], description: 'تجميع البيانات حسب' })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد إحصائيات الطلبات بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              period: { type: 'string', example: '2024-01-15', description: 'الفترة الزمنية' },
              totalRequests: { type: 'number', example: 25, description: 'إجمالي الطلبات' },
              completedRequests: { type: 'number', example: 22, description: 'الطلبات المكتملة' },
              cancelledRequests: { type: 'number', example: 3, description: 'الطلبات الملغية' },
              averageCompletionTime: { type: 'number', example: 4.5, description: 'متوسط وقت الإنجاز (ساعات)' }
            }
          }
        }
      }
    }
  })
  async getRequestsStats(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('groupBy') groupBy?: 'day' | 'week' | 'month',
  ) {
    const data = await this.svc.getRequestsStatistics({
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      groupBy: groupBy || 'day',
    });
    return data;
  }

  @Get('statistics/engineers')
  @ApiOperation({
    summary: 'إحصائيات الفنيين',
    description: 'استرداد إحصائيات أداء الفنيين خلال فترة زمنية محددة'
  })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'تاريخ البداية (ISO format)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'تاريخ النهاية (ISO format)' })
  @ApiQuery({ name: 'limit', required: false, description: 'عدد الفنيين المراد استرجاعهم', example: '10' })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد إحصائيات الفنيين بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              engineerId: { type: 'string', example: 'eng123', description: 'معرف الفني' },
              engineerName: { type: 'string', example: 'أحمد محمد', description: 'اسم الفني' },
              totalRequests: { type: 'number', example: 45, description: 'إجمالي الطلبات' },
              completedRequests: { type: 'number', example: 42, description: 'الطلبات المكتملة' },
              averageRating: { type: 'number', example: 4.6, description: 'متوسط التقييمات' },
              totalEarnings: { type: 'number', example: 2250.00, description: 'إجمالي الأرباح' }
            }
          }
        }
      }
    }
  })
  async getEngineersStats(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('limit') limit = '10',
  ) {
    const data = await this.svc.getEngineersStatistics({
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      limit: Number(limit),
    });
    return data;
  }

  @Get('statistics/services-types')
  @ApiOperation({
    summary: 'إحصائيات أنواع الخدمات',
    description: 'استرداد إحصائيات حول أنواع الخدمات المختلفة وتوزيع الطلبات عليها'
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد إحصائيات أنواع الخدمات بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              serviceType: { type: 'string', example: 'repair', description: 'نوع الخدمة' },
              serviceTypeName: { type: 'string', example: 'إصلاح', description: 'اسم نوع الخدمة' },
              totalRequests: { type: 'number', example: 156, description: 'إجمالي الطلبات' },
              completedRequests: { type: 'number', example: 148, description: 'الطلبات المكتملة' },
              averagePrice: { type: 'number', example: 125.50, description: 'متوسط السعر' },
              averageRating: { type: 'number', example: 4.2, description: 'متوسط التقييمات' }
            }
          }
        }
      }
    }
  })
  async getServiceTypesStats(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const data = await this.svc.getServiceTypesStatistics({
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    });
    return data;
  }

  @Get('statistics/revenue')
  async getRevenueStats(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('groupBy') groupBy?: 'day' | 'week' | 'month',
  ) {
    const data = await this.svc.getRevenueStatistics({
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      groupBy: groupBy || 'day',
    });
    return data;
  }

  // === إدارة المهندسين ===
  @Get('engineers')
  async getEngineersList(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
  ) {
    const data = await this.svc.getEngineersList({
      page: Number(page),
      limit: Number(limit),
      search,
    });
    return { items: data.items, meta: data.meta };
  }

  @Get('engineers/:id/statistics')
  async getEngineerStats(@Param('id') id: string) {
    const data = await this.svc.getEngineerStatistics(id);
    return data;
  }

  @Get('engineers/:id/offers')
  async getEngineerOffers(
    @Param('id') id: string,
    @Query('status') status?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const data = await this.svc.getEngineerOffers(id, {
      status,
      page: Number(page),
      limit: Number(limit),
    });
    return { items: data.items, meta: data.meta };
  }

  // === إحصائيات المهندسين ===
  @Get('engineers/statistics/overview')
  @RequireServicePermission(ServicePermission.ADMIN)
  @ApiOperation({ summary: 'احصل على إحصائيات عامة للمهندسين' })
  @ApiResponse({ status: 200, type: EngineersOverviewStatisticsDto })
  async getEngineersOverviewStatistics() {
    const data = await this.svc.getEngineersOverviewStatistics();
    return data;
  }

  // === إحصائيات العروض ===
  @Get('offers/statistics')
  @RequireServicePermission(ServicePermission.ADMIN)
  @ApiOperation({ summary: 'احصل على إحصائيات العروض' })
  @ApiResponse({ status: 200, type: OffersStatisticsDto })
  async getOffersStatistics(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const data = await this.svc.getOffersStatistics({
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    });
    return data;
  }

  // === إدارة العروض ===
  @Get('offers')
  @RequireServicePermission(ServicePermission.ADMIN)
  @ApiOperation({ summary: 'احصل على قائمة العروض للإدارة' })
  @ApiResponse({ status: 200, type: OffersManagementResponseDto })
  async getOffersManagementList(
    @Query('status') status?: string,
    @Query('requestId') requestId?: string,
    @Query('engineerId') engineerId?: string,
    @Query('search') search?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const data = await this.svc.getOffersManagementList({
      status,
      requestId,
      engineerId,
      search,
      page: Number(page),
      limit: Number(limit),
    });
    return { items: data.items, meta: data.meta };
  }

  @Post('requests/:id/accept-offer')
  @RequireServicePermission(ServicePermission.ADMIN)
  @ApiOperation({ 
    summary: 'قبول عرض من قبل الإدارة',
    description: 'قبول عرض مهندس لطلب خدمة من قبل الإدارة'
  })
  @ApiParam({ name: 'id', description: 'معرف طلب الخدمة' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['offerId'],
      properties: {
        offerId: { type: 'string', example: '507f1f77bcf86cd799439011', description: 'معرف العرض' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'تم قبول العرض بنجاح',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'الطلب أو العرض غير موجود' })
  @ApiResponse({ status: 400, description: 'حالة غير صالحة' })
  async acceptOfferByAdmin(
    @Param('id') requestId: string,
    @Body('offerId') offerId: string,
  ) {
    const result = await this.svc.adminAcceptOffer(requestId, offerId);
    return result;
  }

  @Post('offers/:id/reject')
  @RequireServicePermission(ServicePermission.ADMIN)
  @ApiOperation({ 
    summary: 'رفض عرض من قبل الإدارة',
    description: 'رفض عرض مهندس من قبل الإدارة'
  })
  @ApiParam({ name: 'id', description: 'معرف العرض' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', example: 'تم رفض العرض', description: 'سبب الرفض (اختياري)' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'تم رفض العرض بنجاح',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'العرض غير موجود' })
  async rejectOfferByAdmin(
    @Param('id') offerId: string,
    @Body('reason') reason?: string,
  ) {
    const result = await this.svc.adminRejectOffer(offerId, reason);
    return result;
  }

  @Post('offers/:id/cancel')
  @RequireServicePermission(ServicePermission.ADMIN)
  @ApiOperation({ 
    summary: 'إلغاء عرض من قبل الإدارة',
    description: 'إلغاء عرض مهندس من قبل الإدارة'
  })
  @ApiParam({ name: 'id', description: 'معرف العرض' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', example: 'تم إلغاء العرض', description: 'سبب الإلغاء (اختياري)' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'تم إلغاء العرض بنجاح',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'العرض غير موجود' })
  async cancelOfferByAdmin(
    @Param('id') offerId: string,
    @Body('reason') reason?: string,
  ) {
    const result = await this.svc.adminCancelOffer(offerId, reason);
    return result;
  }
}
