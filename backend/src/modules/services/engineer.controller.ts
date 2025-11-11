import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
  ApiParam
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ServicesService } from './services.service';
import { CreateOfferDto, UpdateOfferDto } from './dto/offers.dto';
import { NearbyQueryDto } from './dto/requests.dto';
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

@ApiTags('خدمات-الفنيين')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ServicesPermissionGuard)
@Controller('services/engineer')
export class EngineerServicesController {
  constructor(private svc: ServicesService) {}

  @Get('requests/nearby')
  @RequireServicePermission(ServicePermission.ENGINEER)
  @ApiOperation({
    summary: 'طلبات قريبة من الفني',
    description: 'البحث عن طلبات الخدمات القريبة من موقع الفني الحالي'
  })
  @ApiQuery({ type: NearbyQueryDto })
  @ApiResponse({
    status: 200,
    description: 'تم العثور على الطلبات القريبة بنجاح',
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
              type: { type: 'string', example: 'repair', description: 'نوع الخدمة' },
              location: {
                type: 'object',
                properties: {
                  address: { type: 'string', example: 'شارع الملك فيصل، صنعاء' },
                  lat: { type: 'number', example: 15.3695 },
                  lng: { type: 'number', example: 44.2019 }
                }
              },
              distance: { type: 'number', example: 2.5, description: 'المسافة بالكيلومترات' },
              customerName: { type: 'string', example: 'محمد أحمد', description: 'اسم العميل' },
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
  async nearby(@Req() req: RequestWithUser, @Query() q: NearbyQueryDto) {
    const data = await this.svc.nearby(req.user!.sub, q.lat, q.lng, q.radiusKm);
    return { data };
  }

  @Get('requests/city')
  @RequireServicePermission(ServicePermission.ENGINEER)
  @ApiOperation({
    summary: 'طلبات في نفس مدينة الفني',
    description: 'استرداد جميع طلبات الخدمات المتاحة في مدينة الفني دون فلترة حسب المسافة'
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد الطلبات في المدينة بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'req123' },
              title: { type: 'string', example: 'صيانة مكيف هواء' },
              city: { type: 'string', example: 'صنعاء' },
              status: { type: 'string', example: 'OPEN' },
              createdAt: { type: 'string', format: 'date-time' }
            },
          },
        },
      },
    },
  })
  async listInCity(@Req() req: RequestWithUser) {
    const data = await this.svc.listRequestsInEngineerCity(req.user!.sub);
    return { data };
  }

  @Get('requests/all')
  @RequireServicePermission(ServicePermission.ENGINEER)
  @ApiOperation({
    summary: 'جميع طلبات الخدمات المتاحة',
    description: 'استرداد جميع الطلبات المفتوحة أو قيد جمع العروض بدون قيود المدينة أو المسافة'
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد جميع الطلبات بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'req789' },
              title: { type: 'string', example: 'تركيب سخان مياه' },
              city: { type: 'string', example: 'عدن' },
              status: { type: 'string', example: 'OFFERS_COLLECTING' },
              createdAt: { type: 'string', format: 'date-time' }
            },
          },
        },
      },
    },
  })
  async listAll(@Req() req: RequestWithUser) {
    const data = await this.svc.listAllAvailableRequests();
    return { data };
  }

  @Post('offers')
  @ApiOperation({
    summary: 'إرسال عرض للعميل',
    description: 'إرسال عرض سعر لعميل لطلب خدمة محدد'
  })
  @ApiBody({ type: CreateOfferDto })
  @ApiResponse({
    status: 201,
    description: 'تم إرسال العرض بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'offer123', description: 'معرف العرض الجديد' },
            requestId: { type: 'string', example: 'req456', description: 'معرف طلب الخدمة' },
            price: { type: 'number', example: 150.00, description: 'سعر العرض' },
            estimatedHours: { type: 'number', example: 3, description: 'عدد الساعات المقدرة' },
            description: { type: 'string', example: 'سأصلح التلفزيون في غضون 3 ساعات', description: 'وصف العرض' },
            status: { type: 'string', example: 'pending', description: 'حالة العرض' },
            createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T11:00:00Z' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'بيانات غير صحيحة أو الطلب غير متاح'
  })
  @ApiResponse({
    status: 404,
    description: 'لم يتم العثور على طلب الخدمة'
  })
  async offer(@Req() req: RequestWithUser, @Body() dto: CreateOfferDto) {
    const data = await this.svc.offer(req.user!.sub, dto);
    return { data };
  }

  @Patch('offers/:id')
  @ApiOperation({
    summary: 'تحديث عرض',
    description: 'تحديث عرض مقدم سابقاً للعميل'
  })
  @ApiParam({ name: 'id', description: 'معرف العرض' })
  @ApiBody({ type: UpdateOfferDto })
  @ApiResponse({
    status: 200,
    description: 'تم تحديث العرض بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'offer123' },
            price: { type: 'number', example: 160.00, description: 'السعر المحدث' },
            estimatedHours: { type: 'number', example: 3.5, description: 'الساعات المقدرة المحدثة' },
            description: { type: 'string', example: 'سأصلح التلفزيون في غضون 3.5 ساعات', description: 'الوصف المحدث' },
            updatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T11:30:00Z' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'لا يمكن تحديث هذا العرض في حالته الحالية'
  })
  @ApiResponse({
    status: 404,
    description: 'لم يتم العثور على العرض'
  })
  @ApiResponse({
    status: 403,
    description: 'غير مصرح لك بتحديث هذا العرض'
  })
  async updateOffer(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: UpdateOfferDto) {
    const data = await this.svc.updateOffer(req.user!.sub, id, dto);
    return { data };
  }

  @Delete('offers/:id')
  @ApiOperation({
    summary: 'حذف عرض',
    description: 'تمكين الفني من حذف عرضه إذا لم يتم قبوله بعد'
  })
  @ApiParam({ name: 'id', description: 'معرف العرض' })
  @ApiResponse({
    status: 200,
    description: 'تم حذف العرض بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            ok: { type: 'boolean', example: true },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'لا يمكن حذف العرض في حالته الحالية'
  })
  @ApiResponse({
    status: 404,
    description: 'لم يتم العثور على العرض'
  })
  async deleteOffer(@Req() req: RequestWithUser, @Param('id') id: string) {
    const data = await this.svc.deleteOffer(req.user!.sub, id);
    return { data };
  }

  @Post('requests/:id/start')
  @ApiOperation({
    summary: 'بدء العمل في طلب خدمة',
    description: 'بدء العمل في طلب خدمة مكلف به الفني'
  })
  @ApiParam({ name: 'id', description: 'معرف طلب الخدمة' })
  @ApiResponse({
    status: 200,
    description: 'تم بدء العمل بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'req123' },
            status: { type: 'string', example: 'in_progress' },
            startedAt: { type: 'string', format: 'date-time', example: '2024-01-15T14:00:00Z' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'لا يمكن بدء العمل في هذا الطلب'
  })
  @ApiResponse({
    status: 404,
    description: 'لم يتم العثور على الطلب'
  })
  @ApiResponse({
    status: 403,
    description: 'غير مصرح لك بالعمل على هذا الطلب'
  })
  async start(@Req() req: RequestWithUser, @Param('id') id: string) {
    const data = await this.svc.start(req.user!.sub, id);
    return { data };
  }

  @Post('requests/:id/complete')
  @ApiOperation({
    summary: 'إكمال طلب خدمة',
    description: 'إكمال طلب خدمة منجز من قبل الفني'
  })
  @ApiParam({ name: 'id', description: 'معرف طلب الخدمة' })
  @ApiResponse({
    status: 200,
    description: 'تم إكمال الطلب بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'req123' },
            status: { type: 'string', example: 'completed' },
            completedAt: { type: 'string', format: 'date-time', example: '2024-01-15T17:00:00Z' },
            totalTime: { type: 'number', example: 3, description: 'إجمالي وقت العمل بالساعات' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'لا يمكن إكمال هذا الطلب في حالته الحالية'
  })
  @ApiResponse({
    status: 404,
    description: 'لم يتم العثور على الطلب'
  })
  @ApiResponse({
    status: 403,
    description: 'غير مصرح لك بإكمال هذا الطلب'
  })
  async complete(@Req() req: RequestWithUser, @Param('id') id: string) {
    const data = await this.svc.complete(req.user!.sub, id);
    return { data };
  }

  @Get('offers/my')
  @ApiOperation({
    summary: 'عروضي',
    description: 'استرداد جميع العروض المقدمة من قبل الفني'
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد عروضك بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'offer123', description: 'معرف العرض' },
              requestId: { type: 'string', example: 'req456', description: 'معرف طلب الخدمة' },
              requestTitle: { type: 'string', example: 'إصلاح جهاز تلفزيون', description: 'عنوان طلب الخدمة' },
              price: { type: 'number', example: 150.00, description: 'سعر العرض' },
              estimatedHours: { type: 'number', example: 3, description: 'عدد الساعات المقدرة' },
              status: { type: 'string', example: 'pending', description: 'حالة العرض' },
              customerName: { type: 'string', example: 'محمد أحمد', description: 'اسم العميل' },
              createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T11:00:00Z' }
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
  async myOffers(@Req() req: RequestWithUser) {
    const data = await this.svc.myOffers(req.user!.sub);
    return { data };
  }
}
