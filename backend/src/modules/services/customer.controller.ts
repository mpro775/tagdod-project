import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { DateTimezoneInterceptor } from '../../shared/interceptors/date-timezone.interceptor';
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
  ApiQuery,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ServicesService } from './services.service';
import {
  AcceptOfferDto,
  CancelServiceRequestDto,
  CreateServiceRequestDto,
  RateServiceDto,
  UpdateServiceRequestDto,
} from './dto/requests.dto';
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
@UseInterceptors(DateTimezoneInterceptor)
@Controller('services/customer')
export class CustomerServicesController {
  constructor(private svc: ServicesService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', 10)) // قبول حتى 10 صور
  @RequireServicePermission(ServicePermission.CUSTOMER)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'إنشاء طلب خدمة جديد',
    description: 'إنشاء طلب خدمة جديد من قبل العميل مع رفع الصور تلقائياً إلى Bunny.net',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'addressId'],
      properties: {
        title: { type: 'string', example: 'إصلاح جهاز تكييف' },
        type: { type: 'string', example: 'maintenance' },
        description: { type: 'string', example: 'الجهاز لا يعمل ويصدر صوتاً مرتفعاً عند التشغيل' },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'صور الطلب (حتى 10 صور) - يتم رفعها تلقائياً إلى Bunny.net',
        },
        addressId: { type: 'string', example: '662fa2ab5d97b30a4f8c1234' },
        scheduledAt: { type: 'string', format: 'date-time', example: '2024-06-05T09:00:00.000Z' },
      },
    },
  })
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
          images: ['https://cdn.example.com/uploads/services/requests/uuid-ac-issue-1.jpg'],
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
    description: 'بيانات غير صحيحة أو وصلت للحد الأقصى من الإلغاءات',
    schema: {
      examples: {
        invalidData: {
          value: {
            statusCode: 400,
            message: ['addressId must be a mongodb id'],
            error: 'Bad Request',
          },
        },
        cancellationLimitReached: {
          value: {
            statusCode: 400,
            error: 'MONTHLY_CANCELLATION_LIMIT_REACHED',
            message: 'لقد وصلت إلى الحد الأقصى المسموح به من الإلغاءات لهذا الشهر (3/3). سيتم إعادة تفعيل حسابك في 1 [الشهر القادم].',
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'غير مصرح لك بالوصول' })
  async create(
    @Req() req: RequestWithUser,
    @Body() dto: CreateServiceRequestDto,
    @UploadedFiles()
    images?: Array<{ buffer: Buffer; originalname: string; mimetype: string; size: number }>,
  ) {
    const data = await this.svc.createRequest(req.user!.sub, dto, images);
    return { data };
  }

  @Get('my')
  @ApiOperation({
    summary: 'طلباتي',
    description: 'استرداد قائمة بجميع طلبات الخدمات الخاصة بالعميل مع إمكانية الفلترة حسب الحالة. الطلبات الملغاة مدرجة افتراضياً.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'فلترة حسب حالة الطلب (OPEN, OFFERS_COLLECTING, ASSIGNED, COMPLETED, RATED, CANCELLED). يمكن تمرير قيمة واحدة أو مصفوفة. الطلبات الملغاة مدرجة دائماً.',
    type: [String],
    isArray: true,
    example: ['ASSIGNED', 'COMPLETED'],
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
            statusLabel: 'تم قبول العرض',
            scheduledAt: '2024-06-05T09:00:00.000Z',
            engineerId: '6637d50690fbb31de8d9c445',
            acceptedOffer: { offerId: '6645f731dc490a317ad91884', amount: 180, currency: 'YER' },
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
            statusLabel: 'اكتملت الخدمة',
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
  async my(@Req() req: RequestWithUser, @Query('status') status?: string | string[]) {
    const data = await this.svc.myRequests(req.user!.sub, status);
    return { data };
  }

  @Get('my/no-offers')
  @ApiOperation({
    summary: 'طلباتي بدون عروض',
    description: 'استرداد الطلبات التي لم يتم تقديم عروض عليها بعد',
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
    description: 'استرداد الطلبات التي تحتوي على عروض ولم تُقبل بعد',
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

  @Get(':requestId/offers/:offerId')
  @ApiOperation({
    summary: 'تفاصيل عرض مهندس',
    description: 'استرداد تفاصيل عرض محدد مع بيانات المهندس والطلب',
  })
  @ApiParam({ name: 'requestId', description: 'معرف طلب الخدمة' })
  @ApiParam({ name: 'offerId', description: 'معرف العرض' })
  @ApiOkResponse({
    description: 'تم استرداد تفاصيل العرض بنجاح',
    schema: {
      example: {
        data: {
          offer: {
            _id: '6645f731dc490a317ad91884',
            amount: 9000,
            currency: 'YER',
            note: 'يشمل التركيب الكامل مع قطع الغيار',
            status: 'OFFERED',
            statusLabel: 'عرض مقدم',
            engineer: {
              id: '6637d50690fbb31de8d9c445',
              name: 'حسن اللقلي',
              jobTitle: 'مهندس كهرباء',
              phone: '777123456',
              whatsapp: 'https://wa.me/967777123456',
            },
          },
          request: {
            _id: '6645e1a5f2f0a02eab4d9c10',
            title: 'تركيب منظومة شمسية',
            type: 'installation',
            description: 'عرض المشكلة: تركيب منظومة طاقة شمسية كاملة...',
            images: ['https://cdn.example.com/uploads/request.jpg'],
            status: 'OPEN',
            statusLabel: 'بانتظار العروض',
            scheduledAt: '2025-09-21T09:00:00.000Z',
            address: {
              label: 'المنزل',
              line1: 'شارع تعز - جوار مستشفى ناصر',
              city: 'صنعاء',
            },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'لم يتم العثور على الطلب أو العرض',
    schema: {
      example: {
        data: { error: 'REQUEST_NOT_FOUND' },
      },
    },
  })
  async offerDetails(
    @Req() req: RequestWithUser,
    @Param('requestId') requestId: string,
    @Param('offerId') offerId: string,
  ) {
    const data = await this.svc.getOfferDetails(req.user!.sub, requestId, offerId);
    return { data };
  }

  @Get('my/with-accepted-offer')
  @ApiOperation({
    summary: 'طلباتي مع عروض مقبولة',
    description: 'استرداد الطلبات التي تم قبول أحد عروضها',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'فلترة حسب حالة الطلب (ASSIGNED, COMPLETED, RATED)',
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
            acceptedOffer: { offerId: '6645f731dc490a317ad91884', amount: 180, currency: 'YER' },
            createdAt: '2024-06-01T12:30:15.512Z',
            updatedAt: '2024-06-02T08:10:45.004Z',
          },
        ],
      },
    },
  })
  async myWithAcceptedOffer(
    @Req() req: RequestWithUser,
    @Query('status') status?: string | string[],
  ) {
    const data = await this.svc.myRequestsWithAcceptedOffers(req.user!.sub, status);
    return { data };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'تفاصيل طلب خدمة',
    description: 'استرداد تفاصيل كاملة لطلب خدمة محدد',
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
          acceptedOffer: {
            offerId: '6645f731dc490a317ad91884',
            amount: 180,
            currency: 'YER',
            note: 'يشمل قطع الغيار',
          },
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

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images', 10))
  @RequireServicePermission(ServicePermission.CUSTOMER)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'تعديل طلب خدمة',
    description: 'تعديل طلب خدمة - مسموح فقط إذا لم يتم تلقي أي عروض على الطلب',
  })
  @ApiParam({ name: 'id', description: 'معرف طلب الخدمة' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'إصلاح جهاز تكييف' },
        type: { type: 'string', example: 'maintenance' },
        description: { type: 'string', example: 'الجهاز لا يعمل ويصدر صوتاً مرتفعاً عند التشغيل' },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'صور الطلب (حتى 10 صور) - يتم رفعها تلقائياً إلى Bunny.net',
        },
        addressId: { type: 'string', example: '662fa2ab5d97b30a4f8c1234' },
        scheduledAt: { type: 'string', format: 'date-time', example: '2024-06-05T09:00:00.000Z' },
      },
    },
  })
  @ApiOkResponse({
    description: 'تم تحديث طلب الخدمة بنجاح',
    schema: {
      example: {
        data: {
          _id: '6645e1a5f2f0a02eab4d9c10',
          userId: '6637c4ed09d96f1d93f3b712',
          title: 'إصلاح جهاز تكييف محدث',
          type: 'maintenance',
          description: 'الجهاز لا يعمل ويصدر صوتاً مرتفعاً عند التشغيل - تم التحديث',
          images: ['https://cdn.example.com/uploads/services/requests/uuid-ac-issue-1.jpg'],
          city: 'صنعاء',
          addressId: '662fa2ab5d97b30a4f8c1234',
          status: 'OPEN',
          scheduledAt: '2024-06-05T09:00:00.000Z',
          engineerId: null,
          acceptedOffer: null,
          rating: {},
          location: { type: 'Point', coordinates: [44.206521, 15.353622] },
          createdAt: '2024-06-01T12:30:15.512Z',
          updatedAt: '2024-06-01T14:20:30.000Z',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'لا يمكن تعديل الطلب - يوجد عروض مقدمة عليه',
    schema: {
      example: {
        data: { error: 'HAS_OFFERS' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'حالة الطلب لا تسمح بالتعديل',
    schema: {
      example: {
        data: { error: 'INVALID_STATUS' },
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
  @ApiForbiddenResponse({ description: 'غير مصرح لك بالوصول إلى هذا الطلب' })
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateServiceRequestDto,
    @UploadedFiles()
    images?: Array<{ buffer: Buffer; originalname: string; mimetype: string; size: number }>,
  ) {
    const data = await this.svc.updateRequest(req.user!.sub, id, dto, images);
    return { data };
  }

  @Post(':id/cancel')
  @ApiOperation({
    summary: 'إلغاء طلب خدمة',
    description: 'إلغاء طلب خدمة من قبل العميل (يسمح فقط من حالة ASSIGNED، ويطلب سبب إجباري، وحد أقصى 3 إلغاءات في الشهر)',
  })
  @ApiBody({
    type: CancelServiceRequestDto,
    description: 'سبب الإلغاء (إجباري)',
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
    description: 'لا يمكن إلغاء هذا الطلب (سبب مطلوب، أو حالة غير صالحة، أو وصلت للحد الأقصى)',
    schema: {
      examples: {
        reasonRequired: {
          value: { data: { error: 'REASON_REQUIRED' } },
        },
        cannotCancel: {
          value: { data: { error: 'CANNOT_CANCEL', message: 'يمكن إلغاء الطلب فقط بعد قبول عرض من مهندس' } },
        },
        limitReached: {
          value: {
            data: {
              error: 'CANCELLATION_LIMIT_REACHED',
              message: 'لقد وصلت إلى الحد الأقصى المسموح به من الإلغاءات لهذا الشهر (3/3). سيتم إعادة تفعيل حسابك في بداية الشهر القادم.',
            },
          },
        },
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
  async cancel(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: CancelServiceRequestDto,
  ) {
    const data = await this.svc.cancel(req.user!.sub, id, dto.reason);
    return { data };
  }

  @Delete(':id')
  @RequireServicePermission(ServicePermission.CUSTOMER)
  @ApiOperation({
    summary: 'حذف طلب خدمة',
    description: 'حذف طلب خدمة نهائياً من قبل العميل - مسموح فقط للطلبات المفتوحة أو الملغاة',
  })
  @ApiParam({ name: 'id', description: 'معرف طلب الخدمة' })
  @ApiOkResponse({
    description: 'تم حذف الطلب بنجاح',
    schema: {
      example: {
        data: { ok: true },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'لا يمكن حذف هذا الطلب في حالته الحالية',
    schema: {
      example: {
        data: {
          error: 'CANNOT_DELETE',
          message: 'لا يمكن حذف الطلب في حالته الحالية. يمكن حذف الطلبات المفتوحة أو الملغاة فقط.',
        },
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
  @ApiForbiddenResponse({ description: 'غير مصرح لك بالوصول إلى هذا الطلب' })
  async delete(@Req() req: RequestWithUser, @Param('id') id: string) {
    const data = await this.svc.deleteRequest(req.user!.sub, id);
    return { data };
  }

  @Post(':id/accept-offer')
  @ApiOperation({
    summary: 'قبول عرض فني',
    description: 'قبول عرض مقدم من فني لطلب خدمة',
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
    description: 'تقييم خدمة منجزة وإضافة تعليق',
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
    description: 'استرداد جميع العروض المقدمة لطلب خدمة محدد مع إمكانية الفلترة حسب الحالة',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'فلترة حسب حالة العرض (OFFERED, ACCEPTED, REJECTED, CANCELLED, OUTBID, EXPIRED). يمكن تمرير قيمة واحدة أو مصفوفة.',
    type: [String],
    isArray: true,
    example: ['OFFERED', 'ACCEPTED'],
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
            statusLabel: 'عرض مقدم',
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
            status: 'CANCELLED',
            statusLabel: 'عرض ملغى',
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
  async getOffers(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Query('status') status?: string | string[],
  ) {
    const data = await this.svc.getOffersForRequest(req.user!.sub, id, status);
    return { data };
  }

  @Post(':id/complete')
  @ApiOperation({
    summary: 'إكمال طلب خدمة',
    description: 'تأكيد إكمال طلب خدمة من قبل العميل',
  })
  @ApiParam({ name: 'id', description: 'معرف طلب الخدمة' })
  @ApiOkResponse({
    description: 'تم تأكيد إكمال الطلب بنجاح',
    schema: {
      example: {
        data: { ok: true },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'لا يمكن إكمال هذا الطلب في حالته الحالية',
    schema: {
      examples: {
        invalidStatus: {
          value: { data: { error: 'INVALID_STATUS' } },
        },
        notOwner: {
          value: { data: { error: 'NOT_OWNER' } },
        },
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
  @ApiForbiddenResponse({ description: 'غير مصرح لك بإكمال هذا الطلب' })
  async complete(@Req() req: RequestWithUser, @Param('id') id: string) {
    const data = await this.svc.complete(req.user!.sub, id);
    return { data };
  }
}
