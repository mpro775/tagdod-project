import {
  Controller,
  Get,
  Query,
  UseGuards,
  Logger,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RequirePermissions } from '../../shared/decorators/permissions.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { AdminPermission } from '../../shared/constants/permissions';
import {
  SearchAnalyticsFilterDto,
  SearchLogsFilterDto,
  TopSearchTermsDto,
} from './dto/admin-search.dto';

@ApiTags('إدارة-البحث')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, AdminGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin/search')
export class SearchAdminController {
  private readonly logger = new Logger(SearchAdminController.name);

  constructor(private readonly searchService: SearchService) {}

  // =====================================================
  // STATISTICS & ANALYTICS
  // =====================================================

  @RequirePermissions(AdminPermission.ANALYTICS_READ, AdminPermission.ADMIN_ACCESS)
  @Get('stats')
  @ApiOperation({
    summary: 'إحصائيات البحث الشاملة',
    description: 'استرداد إحصائيات شاملة حول عمليات البحث في النظام',
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد الإحصائيات بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            totalSearches: { type: 'number', example: 15420, description: 'إجمالي عمليات البحث' },
            totalUniqueQueries: {
              type: 'number',
              example: 3250,
              description: 'عدد الاستعلامات الفريدة',
            },
            averageResultsPerSearch: {
              type: 'number',
              example: 8.5,
              description: 'متوسط النتائج لكل بحث',
            },
            zeroResultSearches: {
              type: 'number',
              example: 420,
              description: 'عمليات بحث بدون نتائج',
            },
            zeroResultsPercentage: {
              type: 'number',
              example: 2.7,
              description: 'نسبة البحث بدون نتائج',
            },
            averageResponseTime: {
              type: 'number',
              example: 125,
              description: 'متوسط وقت الاستجابة (ms)',
            },
            topLanguage: { type: 'string', example: 'ar', description: 'اللغة الأكثر استخداماً' },
            topEntityType: {
              type: 'string',
              example: 'products',
              description: 'نوع الكيان الأكثر بحثاً',
            },
          },
        },
      },
    },
  })
  @ApiQuery({ name: 'startDate', required: false, description: 'تاريخ البداية (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'تاريخ النهاية (YYYY-MM-DD)' })
  @ApiQuery({ name: 'language', required: false, enum: ['ar', 'en'], description: 'اللغة' })
  @ApiQuery({
    name: 'entityType',
    required: false,
    enum: ['products', 'categories', 'brands', 'all'],
    description: 'نوع الكيان',
  })
  async getSearchStats(@Query() filters: SearchAnalyticsFilterDto) {
    this.logger.log(`Admin: Getting search statistics`);

    const stats = await this.searchService.getSearchStats();

    // يمكن استخدام filters لاحقاً عند إضافة Search Logs
    this.logger.debug(`Filters applied: ${JSON.stringify(filters)}`);

    return { success: true, data: stats };
  }

  @RequirePermissions(AdminPermission.ANALYTICS_READ, AdminPermission.ADMIN_ACCESS)
  @Get('top-terms')
  @ApiOperation({
    summary: 'الكلمات المفتاحية الأكثر بحثاً',
    description: 'استرداد قائمة بالكلمات والعبارات الأكثر بحثاً في النظام',
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد الكلمات المفتاحية بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              query: { type: 'string', example: 'هاتف سامسونج', description: 'نص البحث' },
              count: { type: 'number', example: 450, description: 'عدد مرات البحث' },
              hasResults: { type: 'boolean', example: true, description: 'وجود نتائج' },
              averageResults: { type: 'number', example: 12, description: 'متوسط عدد النتائج' },
            },
          },
        },
      },
    },
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'عدد النتائج' })
  @ApiQuery({ name: 'startDate', required: false, description: 'تاريخ البداية' })
  @ApiQuery({ name: 'endDate', required: false, description: 'تاريخ النهاية' })
  @ApiQuery({ name: 'language', required: false, enum: ['ar', 'en'] })
  async getTopSearchTerms(@Query() filters: TopSearchTermsDto) {
    this.logger.log(`Admin: Getting top search terms (limit: ${filters.limit || 20})`);

    const startDate = filters.startDate ? new Date(filters.startDate) : undefined;
    const endDate = filters.endDate ? new Date(filters.endDate) : undefined;

    const terms = await this.searchService.getTopSearchTerms({
      limit: filters.limit,
      startDate,
      endDate,
      language: filters.language,
    });

    return { success: true, data: terms };
  }

  @RequirePermissions(AdminPermission.ANALYTICS_READ, AdminPermission.ADMIN_ACCESS)
  @Get('zero-results')
  @ApiOperation({
    summary: 'عمليات البحث بدون نتائج',
    description: 'استرداد قائمة بعمليات البحث التي لم تُرجع أي نتائج (مفيد لتحسين المحتوى)',
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد عمليات البحث الفاشلة بنجاح',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getZeroResultSearches(
    @Query('limit') limit?: number,
    @Query('page') page?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    this.logger.log('Admin: Getting zero-result searches');

    const result = await this.searchService.getZeroResultSearches({
      limit,
      page,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    return { success: true, ...result };
  }

  @RequirePermissions(AdminPermission.ANALYTICS_READ, AdminPermission.ADMIN_ACCESS)
  @Get('trends')
  @ApiOperation({
    summary: 'اتجاهات البحث عبر الزمن',
    description: 'تحليل اتجاهات البحث على مدى فترة زمنية محددة',
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد اتجاهات البحث بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string', example: '2024-01-15', description: 'التاريخ' },
              count: { type: 'number', example: 450, description: 'عدد عمليات البحث' },
              uniqueQueries: { type: 'number', example: 120, description: 'الاستعلامات الفريدة' },
            },
          },
        },
      },
    },
  })
  async getSearchTrends() {
    this.logger.log('Admin: Getting search trends');

    const trends = await this.searchService.getSearchTrends();

    return { success: true, data: trends };
  }

  // =====================================================
  // SEARCH LOGS
  // =====================================================

  @RequirePermissions(AdminPermission.ANALYTICS_READ, AdminPermission.ADMIN_ACCESS)
  @Get('logs')
  @ApiOperation({
    summary: 'سجلات البحث',
    description: 'استرداد سجلات عمليات البحث مع إمكانية الفلترة',
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد السجلات بنجاح',
  })
  @ApiQuery({ name: 'query', required: false, description: 'نص البحث للفلترة' })
  @ApiQuery({ name: 'userId', required: false, description: 'معرف المستخدم' })
  @ApiQuery({ name: 'hasResults', required: false, type: Boolean })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  async getSearchLogs(@Query() filters: SearchLogsFilterDto) {
    this.logger.log(`Admin: Getting search logs`);

    const result = await this.searchService.getSearchLogs({
      query: filters.query,
      userId: filters.userId,
      hasResults: filters.hasResults,
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
      limit: filters.limit,
      page: filters.page,
    });

    return { success: true, ...result };
  }

  // =====================================================
  // CONTENT ANALYTICS
  // =====================================================

  @RequirePermissions(AdminPermission.ANALYTICS_READ, AdminPermission.ADMIN_ACCESS)
  @Get('most-searched-products')
  @ApiOperation({
    summary: 'المنتجات الأكثر ظهوراً في البحث',
    description: 'استرداد قائمة بالمنتجات الأكثر شيوعاً في نتائج البحث',
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد المنتجات الأكثر بحثاً بنجاح',
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
              name: { type: 'string', example: 'هاتف سامسونج' },
              nameEn: { type: 'string', example: 'Samsung Phone' },
              mainImage: { type: 'string', example: 'https://...' },
              viewsCount: { type: 'number', example: 1250 },
              rating: { type: 'number', example: 4.5 },
              reviewsCount: { type: 'number', example: 85 },
              isFeatured: { type: 'boolean', example: true },
              category: { type: 'object' },
              brand: { type: 'object' },
            },
          },
        },
      },
    },
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'عدد النتائج' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getMostSearchedProducts(
    @Query('limit') limit?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    this.logger.log(`Admin: Getting most searched products (limit: ${limit || 20})`);

    const products = await this.searchService.getMostSearchedProducts({
      limit,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    return { success: true, data: products };
  }

  @RequirePermissions(AdminPermission.ANALYTICS_READ, AdminPermission.ADMIN_ACCESS)
  @Get('most-searched-categories')
  @ApiOperation({
    summary: 'الفئات الأكثر بحثاً',
    description: 'استرداد قائمة بالفئات الأكثر شيوعاً في عمليات البحث',
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد الفئات بنجاح',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getMostSearchedCategories(
    @Query('limit') limit?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    this.logger.log(`Admin: Getting most searched categories (limit: ${limit || 10})`);

    const categories = await this.searchService.getMostSearchedCategories({
      limit,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    return { success: true, data: categories };
  }

  @RequirePermissions(AdminPermission.ANALYTICS_READ, AdminPermission.ADMIN_ACCESS)
  @Get('most-searched-brands')
  @ApiOperation({
    summary: 'العلامات التجارية الأكثر بحثاً',
    description: 'استرداد قائمة بالعلامات التجارية الأكثر شيوعاً في البحث',
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد العلامات التجارية بنجاح',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getMostSearchedBrands(
    @Query('limit') limit?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    this.logger.log(`Admin: Getting most searched brands (limit: ${limit || 10})`);

    const brands = await this.searchService.getMostSearchedBrands({
      limit,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    return { success: true, data: brands };
  }

  // =====================================================
  // SYSTEM & PERFORMANCE
  // =====================================================

  @RequirePermissions(AdminPermission.ANALYTICS_READ, AdminPermission.ADMIN_ACCESS)
  @Get('performance')
  @ApiOperation({
    summary: 'مؤشرات أداء البحث',
    description: 'استرداد مؤشرات الأداء ومعلومات النظام للبحث',
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد مؤشرات الأداء بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            indexedData: {
              type: 'object',
              properties: {
                totalProducts: { type: 'number', example: 1250 },
                activeProducts: { type: 'number', example: 1180 },
                totalCategories: { type: 'number', example: 45 },
                totalBrands: { type: 'number', example: 32 },
              },
            },
            cacheStatus: {
              type: 'object',
              properties: {
                searchCacheTTL: { type: 'number', example: 300 },
                suggestionsCacheTTL: { type: 'number', example: 1800 },
                facetsCacheTTL: { type: 'number', example: 600 },
              },
            },
            systemHealth: { type: 'string', example: 'healthy' },
          },
        },
      },
    },
  })
  async getPerformanceMetrics() {
    this.logger.log('Admin: Getting search performance metrics');

    const metrics = await this.searchService.getSearchPerformanceMetrics();

    return { success: true, data: metrics };
  }

  @RequirePermissions(AdminPermission.SYSTEM_MAINTENANCE, AdminPermission.ADMIN_ACCESS)
  @Post('clear-cache')
  @ApiOperation({
    summary: 'مسح ذاكرة التخزين المؤقت للبحث',
    description: 'مسح جميع بيانات الكاش الخاصة بالبحث (للصيانة أو التحديثات)',
  })
  @ApiResponse({
    status: 200,
    description: 'تم مسح الكاش بنجاح',
  })
  async clearCache() {
    this.logger.log('Admin: Clearing search caches');

    await this.searchService.clearSearchCaches();

    return {
      success: true,
      message: 'Search caches cleared successfully',
    };
  }
}

