import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ServicesService } from './services.service';
import { AcceptOfferDto, CreateServiceRequestDto, RateServiceDto } from './dto/requests.dto';
import { ServicesPermissionGuard, ServicePermission } from './guards/services-permission.guard';
import { RequireServicePermission } from './decorators/service-permission.decorator';

// JWT Payload interface
interface JwtUser {
  sub: string;
  phone: string;
  isAdmin: boolean;
  roles?: string[];
  permissions?: string[];
  preferredCurrency?: string;
}

// Request with JWT user
interface RequestWithUser {
  user: JwtUser;
}

@ApiTags('خدمات-العملاء')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ServicesPermissionGuard)
@Controller('services/customer')
export class CustomerServicesController {
  constructor(private svc: ServicesService) {}

  @Post()
  @RequireServicePermission(ServicePermission.CUSTOMER)
  @ApiOperation({
    summary: 'إنشاء طلب خدمة جديد',
    description: 'إنشاء طلب خدمة جديد من قبل العميل'
  })
  @ApiBody({ type: CreateServiceRequestDto })
  @ApiResponse({
    status: 201,
    description: 'تم إنشاء طلب الخدمة بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'req123', description: 'معرف الطلب الجديد' },
            title: { type: 'string', example: 'إصلاح جهاز تلفزيون', description: 'عنوان الطلب' },
            status: { type: 'string', example: 'pending', description: 'حالة الطلب' },
            createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'بيانات غير صحيحة'
  })
  @ApiResponse({
    status: 401,
    description: 'غير مصرح لك بالوصول'
  })
  async create(@Req() req: RequestWithUser, @Body() dto: CreateServiceRequestDto) {
    const data = await this.svc.createRequest(req.user!.sub, dto);
    return { data };
  }

  @Get('my')
  @ApiOperation({
    summary: 'طلباتي',
    description: 'استرداد قائمة بجميع طلبات الخدمات الخاصة بالعميل'
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد طلباتك بنجاح',
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
              status: { type: 'string', example: 'in_progress', description: 'حالة الطلب' },
              type: { type: 'string', example: 'repair', description: 'نوع الخدمة' },
              engineerName: { type: 'string', example: 'أحمد محمد', description: 'اسم الفني المسؤول' },
              createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'غير مصرح لك بالوصول'
  })
  async my(@Req() req: RequestWithUser) {
    const data = await this.svc.myRequests(req.user!.sub);
    return { data };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'تفاصيل طلب خدمة',
    description: 'استرداد تفاصيل كاملة لطلب خدمة محدد'
  })
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
            engineerName: { type: 'string', example: 'أحمد محمد', description: 'اسم الفني المسؤول' },
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
  async get(@Req() req: RequestWithUser, @Param('id') id: string) {
    const data = await this.svc.getRequest(req.user!.sub, id);
    return { data };
  }

  @Post(':id/cancel')
  @ApiOperation({
    summary: 'إلغاء طلب خدمة',
    description: 'إلغاء طلب خدمة من قبل العميل'
  })
  @ApiResponse({
    status: 200,
    description: 'تم إلغاء الطلب بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'req123' },
            status: { type: 'string', example: 'cancelled' },
            cancelledAt: { type: 'string', format: 'date-time', example: '2024-01-15T14:30:00Z' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'لا يمكن إلغاء هذا الطلب في حالته الحالية'
  })
  @ApiResponse({
    status: 404,
    description: 'لم يتم العثور على الطلب'
  })
  async cancel(@Req() req: RequestWithUser, @Param('id') id: string) {
    const data = await this.svc.cancel(req.user!.sub, id);
    return { data };
  }

  @Post(':id/accept-offer')
  @ApiOperation({
    summary: 'قبول عرض فني',
    description: 'قبول عرض مقدم من فني لطلب خدمة'
  })
  @ApiBody({ type: AcceptOfferDto })
  @ApiResponse({
    status: 200,
    description: 'تم قبول العرض بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'req123' },
            status: { type: 'string', example: 'assigned' },
            engineerId: { type: 'string', example: 'eng456' },
            engineerName: { type: 'string', example: 'أحمد محمد' },
            acceptedPrice: { type: 'number', example: 150.00 },
            acceptedAt: { type: 'string', format: 'date-time', example: '2024-01-15T15:00:00Z' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'العرض غير متاح أو منتهي الصلاحية'
  })
  @ApiResponse({
    status: 404,
    description: 'لم يتم العثور على الطلب أو العرض'
  })
  async accept(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: AcceptOfferDto) {
    const data = await this.svc.acceptOffer(req.user!.sub, id, dto.offerId);
    return { data };
  }

  @Post(':id/rate')
  @ApiOperation({
    summary: 'تقييم خدمة',
    description: 'تقييم خدمة منجزة وإضافة تعليق'
  })
  @ApiBody({ type: RateServiceDto })
  @ApiResponse({
    status: 200,
    description: 'تم إرسال التقييم بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'req123' },
            rating: { type: 'number', example: 5, description: 'التقييم من 1-5' },
            comment: { type: 'string', example: 'خدمة ممتازة وسريعة', description: 'التعليق' },
            ratedAt: { type: 'string', format: 'date-time', example: '2024-01-15T16:00:00Z' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'الخدمة غير مكتملة أو تم تقييمها مسبقاً'
  })
  @ApiResponse({
    status: 404,
    description: 'لم يتم العثور على الطلب'
  })
  async rate(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: RateServiceDto) {
    const data = await this.svc.rate(req.user!.sub, id, dto.score, dto.comment);
    return { data };
  }

  @Get(':id/offers')
  @ApiOperation({
    summary: 'عروض طلب خدمة',
    description: 'استرداد جميع العروض المقدمة لطلب خدمة محدد'
  })
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
  @ApiResponse({
    status: 403,
    description: 'غير مصرح لك بالوصول إلى هذا الطلب'
  })
  async getOffers(@Req() req: RequestWithUser, @Param('id') id: string) {
    const data = await this.svc.getOffersForRequest(req.user!.sub, id);
    return { data };
  }
}
