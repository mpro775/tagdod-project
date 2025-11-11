import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
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
  @ApiCreatedResponse({
    description: 'تم إنشاء طلب الخدمة بنجاح',
    schema: {
      example: {
        data: {
          _id: '6645e1a5f2f0a02eab4d9c10',
          userId: '6637c4ed09d96f1d93f3b712',
          title: 'إصلاح جهاز تكييف',
          type: 'maintenance',
          description: 'الجهاز لا يعمل ويصدر صوتاً مرتفعاً عند التشغيل',
          images: ['https://cdn.example.com/uploads/requests/ac-issue-1.jpg'],
          city: 'صنعاء',
          addressId: '662fa2ab5d97b30a4f8c1234',
          status: 'OPEN',
          scheduledAt: '2024-06-05T09:00:00.000Z',
          engineerId: null,
          acceptedOffer: null,
          rating: {},
          location: { type: 'Point', coordinates: [44.206521, 15.353622] },
          createdAt: '2024-06-01T12:30:15.512Z',
          updatedAt: '2024-06-01T12:30:15.512Z',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'بيانات غير صحيحة',
    schema: {
      example: {
        statusCode: 400,
        message: ['addressId must be a mongodb id'],
        error: 'Bad Request',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'غير مصرح لك بالوصول' })
  async create(@Req() req: RequestWithUser, @Body() dto: CreateServiceRequestDto) {
    const data = await this.svc.createRequest(req.user!.sub, dto);
    return { data };
  }

  @Get('my')
  @ApiOperation({
    summary: 'طلباتي',
    description: 'استرداد قائمة بجميع طلبات الخدمات الخاصة بالعميل'
  })
  @ApiOkResponse({
    description: 'تم استرداد طلباتك بنجاح',
    schema: {
      example: {
        data: [
          {
            _id: '6645e1a5f2f0a02eab4d9c10',
            title: 'إصلاح جهاز تكييف',
            type: 'maintenance',
            description: 'الجهاز لا يعمل ويصدر صوتاً مرتفعاً عند التشغيل',
            images: ['https://cdn.example.com/uploads/requests/ac-issue-1.jpg'],
            city: 'صنعاء',
            addressId: '662fa2ab5d97b30a4f8c1234',
            status: 'ASSIGNED',
            scheduledAt: '2024-06-05T09:00:00.000Z',
            engineerId: '6637d50690fbb31de8d9c445',
            acceptedOffer: { offerId: '6645f731dc490a317ad91884', amount: 180 },
            rating: {},
            createdAt: '2024-06-01T12:30:15.512Z',
            updatedAt: '2024-06-02T08:10:45.004Z',
          },
          {
            _id: '6640b15457b44bb2d1f5ed98',
            title: 'تركيب سخان مياه',
            type: 'installation',
            description: 'تركيب سخان جديد مع اختبار ضغط المياه',
            images: [],
            city: 'عدن',
            addressId: '6640b11c57b44bb2d1f5ed97',
            status: 'COMPLETED',
            scheduledAt: '2024-05-27T13:30:00.000Z',
            engineerId: '6637d50690fbb31de8d9c445',
            acceptedOffer: { offerId: '6640b1d057b44bb2d1f5eda0', amount: 220 },
            rating: { score: 5, comment: 'خدمة ممتازة', at: '2024-05-27T16:02:19.412Z' },
            createdAt: '2024-05-25T09:14:03.921Z',
            updatedAt: '2024-05-27T16:02:19.412Z',
          },
        ],
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'غير مصرح لك بالوصول' })
  async my(@Req() req: RequestWithUser) {
    const data = await this.svc.myRequests(req.user!.sub);
    return { data };
  }

  @Get('my/no-offers')
  @ApiOperation({
    summary: 'طلباتي بدون عروض',
    description: 'استرداد الطلبات التي لم يتم تقديم عروض عليها بعد'
  })
  @ApiOkResponse({
    description: 'تم استرداد الطلبات بدون عروض بنجاح',
    schema: {
      example: {
        data: [
          {
            _id: '6645e1a5f2f0a02eab4d9c10',
            title: 'إصلاح جهاز تكييف',
            status: 'OPEN',
            createdAt: '2024-06-01T12:30:15.512Z',
            updatedAt: '2024-06-01T12:30:15.512Z',
          },
        ],
      },
    },
  })
  async myWithoutOffers(@Req() req: RequestWithUser) {
    const data = await this.svc.myRequestsWithoutOffers(req.user!.sub);
    return { data };
  }

  @Get('my/with-offers')
  @ApiOperation({
    summary: 'طلباتي مع عروض قيد المراجعة',
    description: 'استرداد الطلبات التي تحتوي على عروض ولم تُقبل بعد'
  })
  @ApiOkResponse({
    description: 'تم استرداد الطلبات ذات العروض بنجاح',
    schema: {
      example: {
        data: [
          {
            _id: '6645e1a5f2f0a02eab4d9c10',
            title: 'إصلاح جهاز تكييف',
            status: 'OFFERS_COLLECTING',
            createdAt: '2024-06-01T12:30:15.512Z',
            updatedAt: '2024-06-02T08:10:45.004Z',
          },
        ],
      },
    },
  })
  async myWithOffers(@Req() req: RequestWithUser) {
    const data = await this.svc.myRequestsWithOffersPending(req.user!.sub);
    return { data };
  }

  @Get('my/with-accepted-offer')
  @ApiOperation({
    summary: 'طلباتي مع عروض مقبولة',
    description: 'استرداد الطلبات التي تم قبول أحد عروضها'
  })
  @ApiOkResponse({
    description: 'تم استرداد الطلبات ذات العروض المقبولة بنجاح',
    schema: {
      example: {
        data: [
          {
            _id: '6645e1a5f2f0a02eab4d9c10',
            title: 'إصلاح جهاز تكييف',
            status: 'ASSIGNED',
            acceptedOffer: { offerId: '6645f731dc490a317ad91884', amount: 180 },
            createdAt: '2024-06-01T12:30:15.512Z',
            updatedAt: '2024-06-02T08:10:45.004Z',
          },
        ],
      },
    },
  })
  async myWithAcceptedOffer(@Req() req: RequestWithUser) {
    const data = await this.svc.myRequestsWithAcceptedOffers(req.user!.sub);
    return { data };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'تفاصيل طلب خدمة',
    description: 'استرداد تفاصيل كاملة لطلب خدمة محدد'
  })
  @ApiOkResponse({
    description: 'تم استرداد تفاصيل الطلب بنجاح',
    schema: {
      example: {
        data: {
          _id: '6645e1a5f2f0a02eab4d9c10',
          userId: '6637c4ed09d96f1d93f3b712',
          title: 'إصلاح جهاز تكييف',
          type: 'maintenance',
          description: 'الجهاز لا يعمل ويصدر صوتاً مرتفعاً عند التشغيل',
          images: ['https://cdn.example.com/uploads/requests/ac-issue-1.jpg'],
          city: 'صنعاء',
          addressId: '662fa2ab5d97b30a4f8c1234',
          status: 'ASSIGNED',
          scheduledAt: '2024-06-05T09:00:00.000Z',
          engineerId: '6637d50690fbb31de8d9c445',
          acceptedOffer: { offerId: '6645f731dc490a317ad91884', amount: 180, note: 'يشمل قطع الغيار' },
          rating: {},
          location: { type: 'Point', coordinates: [44.206521, 15.353622] },
          createdAt: '2024-06-01T12:30:15.512Z',
          updatedAt: '2024-06-02T08:10:45.004Z',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'لم يتم العثور على الطلب',
    schema: {
      example: {
        statusCode: 404,
        message: 'Service request not found',
        error: 'Not Found',
      },
    },
  })
  @ApiForbiddenResponse({ description: 'غير مصرح لك بالوصول إلى هذا الطلب' })
  async get(@Req() req: RequestWithUser, @Param('id') id: string) {
    const data = await this.svc.getRequest(req.user!.sub, id);
    return { data };
  }

  @Post(':id/cancel')
  @ApiOperation({
    summary: 'إلغاء طلب خدمة',
    description: 'إلغاء طلب خدمة من قبل العميل'
  })
  @ApiOkResponse({
    description: 'تم إلغاء الطلب بنجاح',
    schema: {
      example: {
        data: { ok: true },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'لا يمكن إلغاء هذا الطلب في حالته الحالية',
    schema: {
      example: {
        data: { error: 'CANNOT_CANCEL' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'لم يتم العثور على الطلب',
    schema: {
      example: {
        data: { error: 'NOT_FOUND' },
      },
    },
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
  @ApiOkResponse({
    description: 'تم قبول العرض بنجاح',
    schema: {
      example: {
        data: { ok: true },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'العرض غير متاح أو تم رفضه',
    schema: {
      example: {
        data: { error: 'INVALID_STATUS' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'لم يتم العثور على الطلب أو العرض',
    schema: {
      example: {
        data: { error: 'OFFER_NOT_FOUND' },
      },
    },
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
  @ApiOkResponse({
    description: 'تم إرسال التقييم بنجاح',
    schema: {
      example: {
        data: { ok: true },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'الخدمة غير مكتملة أو تم تقييمها مسبقاً',
    schema: {
      example: {
        data: { error: 'NOT_COMPLETED' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'لم يتم العثور على الطلب',
    schema: {
      example: {
        data: { error: 'NOT_FOUND' },
      },
    },
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
  @ApiOkResponse({
    description: 'تم استرداد العروض بنجاح',
    schema: {
      example: {
        data: [
          {
            _id: '6645f731dc490a317ad91884',
            requestId: '6645e1a5f2f0a02eab4d9c10',
            engineerId: {
              _id: '6637d50690fbb31de8d9c445',
              firstName: 'أحمد',
              lastName: 'محمد',
              phone: '+967711234567',
              jobTitle: 'مهندس تبريد وتكييف',
            },
            amount: 180,
            note: 'يشمل قطع الغيار وضمان لمدة شهر',
            distanceKm: 4.8,
            status: 'OFFERED',
            createdAt: '2024-06-01T13:05:32.144Z',
            updatedAt: '2024-06-01T13:05:32.144Z',
          },
          {
            _id: '6645f921dc490a317ad9189b',
            requestId: '6645e1a5f2f0a02eab4d9c10',
            engineerId: {
              _id: '6637d54890fbb31de8d9c54a',
              firstName: 'ليلى',
              lastName: 'الحسني',
              phone: '+967733006677',
              jobTitle: 'فنية أجهزة كهربائية',
            },
            amount: 200,
            note: 'يتم إصلاح العطل خلال ساعتين',
            distanceKm: 7.1,
            status: 'OFFERED',
            createdAt: '2024-06-01T13:22:01.998Z',
            updatedAt: '2024-06-01T13:22:01.998Z',
          },
        ],
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'لم يتم العثور على الطلب',
    schema: {
      example: {
        data: { error: 'REQUEST_NOT_FOUND' },
      },
    },
  })
  @ApiForbiddenResponse({ description: 'غير مصرح لك بالوصول إلى هذا الطلب' })
  async getOffers(@Req() req: RequestWithUser, @Param('id') id: string) {
    const data = await this.svc.getOffersForRequest(req.user!.sub, id);
    return { data };
  }
}
