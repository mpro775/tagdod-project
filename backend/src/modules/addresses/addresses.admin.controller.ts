import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RequirePermissions } from '../../shared/decorators/permissions.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { AdminPermission } from '../../shared/constants/permissions';
import {
  AdminAddressFilterDto,
  UsageStatsFilterDto,
} from './dto/admin-address.dto';

@ApiTags('إدارة-العناوين')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, AdminGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin/addresses')
export class AddressesAdminController {
  private readonly logger = new Logger(AddressesAdminController.name);

  constructor(private readonly addressesService: AddressesService) {}

  // =====================================================
  // STATISTICS & ANALYTICS
  // =====================================================

  @RequirePermissions(AdminPermission.ADDRESSES_READ, AdminPermission.ADMIN_ACCESS)
  @Get('stats')
  @ApiOperation({
    summary: 'الحصول على إحصائيات شاملة للعناوين',
    description: 'استرداد إحصائيات مفصلة حول العناوين في النظام',
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد الإحصائيات بنجاح',
    schema: {
      type: 'object',
      properties: {
        totalAddresses: {
          type: 'number',
          example: 1250,
          description: 'إجمالي عدد العناوين (بما في ذلك المحذوفة)',
        },
        totalActiveAddresses: {
          type: 'number',
          example: 1180,
          description: 'عدد العناوين النشطة',
        },
        totalDeletedAddresses: {
          type: 'number',
          example: 70,
          description: 'عدد العناوين المحذوفة',
        },
        totalUsers: {
          type: 'number',
          example: 450,
          description: 'عدد المستخدمين الذين لديهم عناوين',
        },
        averagePerUser: {
          type: 'number',
          example: 2.8,
          description: 'متوسط عدد العناوين لكل مستخدم',
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'غير مصرح لك بالوصول إلى هذه البيانات' })
  async getStats() {
    this.logger.log('Admin: Getting address statistics');
    const stats = await this.addressesService.getStats();
    return { success: true, data: stats };
  }

  @RequirePermissions(AdminPermission.ADDRESSES_READ, AdminPermission.ADMIN_ACCESS)
  @Get('top-cities')
  @ApiOperation({
    summary: 'المدن الأكثر استخداماً',
    description: 'استرداد قائمة بالمدن الأكثر استخداماً في العناوين مرتبة تنازلياً',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'عدد المدن المراد عرضها',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد المدن الأكثر استخداماً بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              city: { type: 'string', example: 'صنعاء', description: 'اسم المدينة' },
              count: { type: 'number', example: 450, description: 'عدد العناوين' },
              activeCount: {
                type: 'number',
                example: 420,
                description: 'عدد العناوين النشطة',
              },
              defaultCount: {
                type: 'number',
                example: 150,
                description: 'عدد العناوين الافتراضية',
              },
              totalUsage: {
                type: 'number',
                example: 1250,
                description: 'إجمالي مرات الاستخدام',
              },
              percentage: {
                type: 'number',
                example: 36.5,
                description: 'النسبة المئوية من إجمالي العناوين',
              },
            },
          },
        },
      },
    },
  })
  async getTopCities(@Query('limit') limit?: number) {
    this.logger.log(`Admin: Getting top ${limit || 10} cities`);
    const cities = await this.addressesService.getTopCities(limit || 10);
    return { success: true, data: cities };
  }

  @RequirePermissions(AdminPermission.ADDRESSES_READ, AdminPermission.ADMIN_ACCESS)
  @Get('most-used')
  @ApiOperation({
    summary: 'العناوين الأكثر استخداماً',
    description: 'استرداد قائمة بالعناوين الأكثر استخداماً مع معلومات المستخدمين',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'عدد العناوين المراد عرضها',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد العناوين الأكثر استخداماً بنجاح',
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
              label: { type: 'string', example: 'المنزل' },
              line1: { type: 'string', example: 'شارع الستين، بجوار مطعم السلطان' },
              city: { type: 'string', example: 'صنعاء' },
              usageCount: { type: 'number', example: 15 },
              lastUsedAt: { type: 'string', format: 'date-time' },
              userId: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  name: { type: 'string', example: 'أحمد محمد' },
                  phone: { type: 'string', example: '+967771234567' },
                },
              },
            },
          },
        },
      },
    },
  })
  async getMostUsedAddresses(@Query('limit') limit?: number) {
    this.logger.log(`Admin: Getting most used addresses (limit: ${limit || 10})`);
    const addresses = await this.addressesService.getMostUsedAddresses(limit || 10);
    return { success: true, data: addresses };
  }

  @RequirePermissions(AdminPermission.ADDRESSES_READ, AdminPermission.ADMIN_ACCESS)
  @Get('recently-used')
  @ApiOperation({
    summary: 'العناوين المستخدمة مؤخراً',
    description: 'استرداد قائمة بالعناوين التي تم استخدامها مؤخراً',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'عدد العناوين المراد عرضها',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد العناوين المستخدمة مؤخراً بنجاح',
  })
  async getRecentlyUsedAddresses(@Query('limit') limit?: number) {
    this.logger.log(`Admin: Getting recently used addresses (limit: ${limit || 20})`);
    const addresses = await this.addressesService.getRecentlyUsedAddresses(limit || 20);
    return { success: true, data: addresses };
  }

  @RequirePermissions(AdminPermission.ADDRESSES_READ, AdminPermission.ADMIN_ACCESS)
  @Get('never-used')
  @ApiOperation({
    summary: 'العناوين التي لم تستخدم أبداً',
    description: 'استرداد قائمة بالعناوين التي لم يتم استخدامها مطلقاً',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'عدد العناوين المراد عرضها',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد العناوين غير المستخدمة بنجاح',
  })
  async getNeverUsedAddresses(@Query('limit') limit?: number) {
    this.logger.log(`Admin: Getting never used addresses (limit: ${limit || 20})`);
    const addresses = await this.addressesService.getNeverUsedAddresses(limit || 20);
    return { success: true, data: addresses };
  }

  @RequirePermissions(AdminPermission.ADDRESSES_READ, AdminPermission.ADMIN_ACCESS)
  @Get('usage-analytics')
  @ApiOperation({
    summary: 'تحليلات استخدام العناوين',
    description: 'استرداد تحليلات مفصلة حول استخدام العناوين في النظام',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'تاريخ البداية (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'تاريخ النهاية (YYYY-MM-DD)',
    example: '2024-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد تحليلات الاستخدام بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            stats: {
              type: 'object',
              properties: {
                totalUsage: { type: 'number', example: 3500 },
                avgUsage: { type: 'number', example: 2.8 },
                maxUsage: { type: 'number', example: 25 },
                addressesUsed: { type: 'number', example: 1050 },
                addressesNeverUsed: { type: 'number', example: 130 },
              },
            },
            dailyTrend: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string', example: '2024-01-15' },
                  count: { type: 'number', example: 45 },
                },
              },
            },
          },
        },
      },
    },
  })
  async getUsageAnalytics(@Query() filters: UsageStatsFilterDto) {
    this.logger.log('Admin: Getting usage analytics');

    const startDate = filters.startDate ? new Date(filters.startDate) : undefined;
    const endDate = filters.endDate ? new Date(filters.endDate) : undefined;

    const analytics = await this.addressesService.getUsageAnalytics(startDate, endDate);
    return { success: true, data: analytics };
  }

  @RequirePermissions(AdminPermission.ADDRESSES_READ, AdminPermission.ADMIN_ACCESS)
  @Get('geographic-analytics')
  @ApiOperation({
    summary: 'التحليل الجغرافي للعناوين',
    description: 'استرداد بيانات التوزيع الجغرافي للعناوين (للخرائط الحرارية)',
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد التحليل الجغرافي بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            cityDistribution: {
              type: 'array',
              description: 'توزيع العناوين حسب المدينة',
            },
            coordinates: {
              type: 'array',
              description: 'جميع الإحداثيات (لخريطة حرارية)',
              items: {
                type: 'object',
                properties: {
                  lat: { type: 'number', example: 15.3694 },
                  lng: { type: 'number', example: 44.191 },
                  city: { type: 'string', example: 'صنعاء' },
                  label: { type: 'string', example: 'المنزل' },
                },
              },
            },
            totalPoints: { type: 'number', example: 1250 },
          },
        },
      },
    },
  })
  async getGeographicAnalytics() {
    this.logger.log('Admin: Getting geographic analytics');
    const analytics = await this.addressesService.getGeographicAnalytics();
    return { success: true, data: analytics };
  }

  // =====================================================
  // SEARCH & LIST
  // =====================================================

  @RequirePermissions(AdminPermission.ADDRESSES_READ, AdminPermission.ADMIN_ACCESS)
  @Get('list')
  @ApiOperation({
    summary: 'قائمة جميع العناوين مع فلترة وبحث',
    description: 'استرداد جميع العناوين في النظام مع دعم الفلترة والبحث والترتيب',
  })
  @ApiQuery({ name: 'userId', required: false, description: 'تصفية حسب معرف المستخدم' })
  @ApiQuery({ name: 'city', required: false, description: 'تصفية حسب المدينة' })
  @ApiQuery({ name: 'label', required: false, description: 'تصفية حسب التسمية' })
  @ApiQuery({
    name: 'isDefault',
    required: false,
    type: Boolean,
    description: 'العناوين الافتراضية فقط',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'العناوين النشطة فقط',
  })
  @ApiQuery({
    name: 'includeDeleted',
    required: false,
    type: Boolean,
    description: 'تضمين المحذوفة',
  })
  @ApiQuery({ name: 'search', required: false, description: 'البحث في النص' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'عدد النتائج' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'رقم الصفحة' })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'usageCount', 'lastUsedAt'],
    description: 'الترتيب حسب',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'اتجاه الترتيب',
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد قائمة العناوين بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'array', description: 'قائمة العناوين مع معلومات المستخدمين' },
        pagination: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 1250 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 20 },
            pages: { type: 'number', example: 63 },
          },
        },
      },
    },
  })
  async listAddresses(@Query() filters: AdminAddressFilterDto) {
    this.logger.log(`Admin: Listing addresses with filters: ${JSON.stringify(filters)}`);
    const result = await this.addressesService.adminList(filters);
    return { success: true, ...result };
  }

  // =====================================================
  // USER SPECIFIC
  // =====================================================

  @RequirePermissions(AdminPermission.ADDRESSES_READ, AdminPermission.ADMIN_ACCESS)
  @Get('user/:userId')
  @ApiOperation({
    summary: 'الحصول على عناوين مستخدم محدد',
    description: 'استرداد جميع عناوين مستخدم محدد مع معلومات المستخدم',
  })
  @ApiParam({ name: 'userId', description: 'معرف المستخدم' })
  @ApiQuery({
    name: 'includeDeleted',
    required: false,
    type: Boolean,
    description: 'تضمين العناوين المحذوفة',
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد عناوين المستخدم بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'array', description: 'قائمة العناوين' },
        count: { type: 'number', example: 3 },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'المستخدم غير موجود' })
  async getUserAddresses(
    @Param('userId') userId: string,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    this.logger.log(`Admin: Getting addresses for user ${userId}`);
    const addresses = await this.addressesService.getUserAddresses(
      userId,
      includeDeleted === 'true',
    );

    return {
      success: true,
      data: addresses,
      count: addresses.length,
    };
  }

  @RequirePermissions(AdminPermission.ADDRESSES_READ, AdminPermission.ADMIN_ACCESS)
  @Get('user/:userId/count')
  @ApiOperation({
    summary: 'عدد عناوين مستخدم محدد',
    description: 'الحصول على عدد العناوين النشطة لمستخدم محدد',
  })
  @ApiParam({ name: 'userId', description: 'معرف المستخدم' })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد العدد بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            count: { type: 'number', example: 3 },
          },
        },
      },
    },
  })
  async getUserAddressCount(@Param('userId') userId: string) {
    this.logger.log(`Admin: Getting address count for user ${userId}`);
    const count = await this.addressesService.getUserAddressCount(userId);
    return {
      success: true,
      data: { userId, count },
    };
  }

  // =====================================================
  // GEOGRAPHIC SEARCH
  // =====================================================

  @RequirePermissions(AdminPermission.ADDRESSES_READ, AdminPermission.ADMIN_ACCESS)
  @Get('nearby')
  @ApiOperation({
    summary: 'البحث عن عناوين قريبة من نقطة معينة',
    description: 'استرداد العناوين القريبة من إحداثيات معينة (مفيد للتخطيط اللوجستي)',
  })
  @ApiQuery({ name: 'lat', required: true, description: 'خط العرض', example: 15.3694 })
  @ApiQuery({ name: 'lng', required: true, description: 'خط الطول', example: 44.191 })
  @ApiQuery({
    name: 'radius',
    required: false,
    description: 'نصف القطر بالكيلومتر',
    example: 10,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'عدد النتائج',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد العناوين القريبة بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          description: 'العناوين القريبة مرتبة حسب المسافة',
        },
        searchParams: {
          type: 'object',
          properties: {
            lat: { type: 'number', example: 15.3694 },
            lng: { type: 'number', example: 44.191 },
            radiusKm: { type: 'number', example: 10 },
          },
        },
      },
    },
  })
  async searchNearbyAddresses(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
    @Query('limit') limit?: string,
  ) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = radius ? parseFloat(radius) : 10;
    const limitNum = limit ? parseInt(limit) : 20;

    this.logger.log(
      `Admin: Searching addresses near (${latitude}, ${longitude}) within ${radiusKm}km`,
    );

    const addresses = await this.addressesService.searchNearby(
      latitude,
      longitude,
      radiusKm,
      limitNum,
    );

    return {
      success: true,
      data: addresses,
      searchParams: {
        lat: latitude,
        lng: longitude,
        radiusKm,
      },
    };
  }
}

