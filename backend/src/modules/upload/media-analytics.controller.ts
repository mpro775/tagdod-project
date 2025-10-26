import {
  Controller,
  Get,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { MediaService } from './media.service';

@ApiTags('إحصائيات-الوسائط')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin/media-analytics')
export class MediaAnalyticsController {
  private readonly logger = new Logger(MediaAnalyticsController.name);

  constructor(private readonly mediaService: MediaService) {}

  // ==================== نظرة عامة على الإحصائيات ====================

  @Get('overview')
  @ApiOperation({
    summary: 'الإحصائيات العامة للوسائط',
    description: 'يعرض إحصائيات شاملة عن جميع الملفات والوسائط في النظام',
  })
  @ApiResponse({
    status: 200,
    description: 'تم جلب الإحصائيات العامة بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            totalFiles: { type: 'number', example: 1250, description: 'إجمالي عدد الملفات' },
            totalSize: { type: 'number', example: 5242880000, description: 'إجمالي حجم الملفات بالبايت' },
            totalSizeFormatted: { type: 'string', example: '5.24 GB', description: 'إجمالي الحجم منسق' },
            filesThisMonth: { type: 'number', example: 156, description: 'عدد الملفات المرفوعة هذا الشهر' },
            filesThisWeek: { type: 'number', example: 42, description: 'عدد الملفات المرفوعة هذا الأسبوع' },
            filesToday: { type: 'number', example: 8, description: 'عدد الملفات المرفوعة اليوم' },
            averageFileSize: { type: 'number', example: 419430, description: 'متوسط حجم الملف' },
            averageFileSizeFormatted: { type: 'string', example: '419.43 KB' },
            filesByType: {
              type: 'object',
              properties: {
                images: { type: 'number', example: 850 },
                videos: { type: 'number', example: 120 },
                documents: { type: 'number', example: 200 },
                other: { type: 'number', example: 80 },
              },
            },
            sizeByType: {
              type: 'object',
              properties: {
                images: { type: 'number', example: 2147483648 },
                videos: { type: 'number', example: 2684354560 },
                documents: { type: 'number', example: 314572800 },
                other: { type: 'number', example: 96468992 },
              },
            },
            storageUsagePercent: { type: 'number', example: 52.4, description: 'نسبة استخدام التخزين' },
            topUploaders: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  userId: { type: 'string' },
                  name: { type: 'string' },
                  uploadCount: { type: 'number' },
                  totalSize: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
  })
  async getOverview() {
    try {
      const stats = await this.mediaService.getMediaStatistics();
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      this.logger.error(`Error getting media overview: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  // ==================== إحصائيات حسب النوع ====================

  @Get('by-type')
  @ApiOperation({
    summary: 'إحصائيات الوسائط حسب النوع',
    description: 'يعرض توزيع الملفات حسب أنواعها المختلفة',
  })
  @ApiResponse({
    status: 200,
    description: 'تم جلب الإحصائيات بنجاح',
  })
  async getStatsByType() {
    try {
      const stats = await this.mediaService.getStatsByFileType();
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      this.logger.error(`Error getting stats by type: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  // ==================== إحصائيات الرفع حسب الفترة ====================

  @Get('upload-timeline')
  @ApiOperation({
    summary: 'إحصائيات الرفع حسب الفترة الزمنية',
    description: 'يعرض توزيع عمليات الرفع خلال فترة زمنية محددة',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['day', 'week', 'month', 'year'],
    description: 'الفترة الزمنية للإحصائيات',
  })
  @ApiResponse({
    status: 200,
    description: 'تم جلب الإحصائيات بنجاح',
  })
  async getUploadTimeline(@Query('period') period: string = 'month') {
    try {
      const timeline = await this.mediaService.getUploadTimeline(period);
      return {
        success: true,
        data: timeline,
      };
    } catch (error) {
      this.logger.error(`Error getting upload timeline: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  // ==================== أكبر الملفات ====================

  @Get('largest-files')
  @ApiOperation({
    summary: 'قائمة أكبر الملفات',
    description: 'يعرض الملفات الأكبر حجماً في النظام',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'عدد الملفات المراد عرضها',
  })
  @ApiResponse({
    status: 200,
    description: 'تم جلب القائمة بنجاح',
  })
  async getLargestFiles(@Query('limit') limit: number = 20) {
    try {
      const files = await this.mediaService.getLargestFiles(Number(limit));
      return {
        success: true,
        data: files,
      };
    } catch (error) {
      this.logger.error(`Error getting largest files: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  // ==================== أحدث الملفات ====================

  @Get('recent-uploads')
  @ApiOperation({
    summary: 'أحدث الملفات المرفوعة',
    description: 'يعرض آخر الملفات التي تم رفعها',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'عدد الملفات المراد عرضها',
  })
  @ApiResponse({
    status: 200,
    description: 'تم جلب القائمة بنجاح',
  })
  async getRecentUploads(@Query('limit') limit: number = 20) {
    try {
      const files = await this.mediaService.getRecentUploads(Number(limit));
      return {
        success: true,
        data: files,
      };
    } catch (error) {
      this.logger.error(`Error getting recent uploads: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  // ==================== إحصائيات التخزين ====================

  @Get('storage')
  @ApiOperation({
    summary: 'إحصائيات التخزين',
    description: 'يعرض معلومات عن مساحة التخزين المستخدمة والمتاحة',
  })
  @ApiResponse({
    status: 200,
    description: 'تم جلب إحصائيات التخزين بنجاح',
  })
  async getStorageStats() {
    try {
      const storage = await this.mediaService.getStorageStatistics();
      return {
        success: true,
        data: storage,
      };
    } catch (error) {
      this.logger.error(`Error getting storage stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  // ==================== إحصائيات المستخدمين ====================

  @Get('by-user')
  @ApiOperation({
    summary: 'إحصائيات الرفع حسب المستخدم',
    description: 'يعرض إحصائيات عمليات الرفع لكل مستخدم',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'عدد المستخدمين المراد عرضهم',
  })
  @ApiResponse({
    status: 200,
    description: 'تم جلب الإحصائيات بنجاح',
  })
  async getStatsByUser(@Query('limit') limit: number = 20) {
    try {
      const userStats = await this.mediaService.getStatsByUser(Number(limit));
      return {
        success: true,
        data: userStats,
      };
    } catch (error) {
      this.logger.error(`Error getting stats by user: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  // ==================== الملفات غير المستخدمة ====================

  @Get('unused-files')
  @ApiOperation({
    summary: 'الملفات غير المستخدمة',
    description: 'يعرض الملفات التي لم يتم استخدامها في أي مكان',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'عدد الملفات المراد عرضها',
  })
  @ApiResponse({
    status: 200,
    description: 'تم جلب القائمة بنجاح',
  })
  async getUnusedFiles(@Query('limit') limit: number = 50) {
    try {
      const files = await this.mediaService.getUnusedFiles(Number(limit));
      const totalSize = files.reduce((sum, file) => {
        return sum + ((file as { fileSize?: number }).fileSize || 0);
      }, 0);
      
      return {
        success: true,
        data: files,
        meta: {
          totalUnused: files.length,
          potentialSavings: totalSize,
        },
      };
    } catch (error) {
      this.logger.error(`Error getting unused files: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  // ==================== تقرير شامل ====================

  @Get('full-report')
  @ApiOperation({
    summary: 'تقرير شامل عن الوسائط',
    description: 'يولد تقرير شامل يحتوي على جميع الإحصائيات',
  })
  @ApiResponse({
    status: 200,
    description: 'تم توليد التقرير بنجاح',
  })
  async getFullReport() {
    try {
      const [overview, byType, storage, topUploaders, largestFiles, recentFiles] =
        await Promise.all([
          this.mediaService.getMediaStatistics(),
          this.mediaService.getStatsByFileType(),
          this.mediaService.getStorageStatistics(),
          this.mediaService.getStatsByUser(10),
          this.mediaService.getLargestFiles(10),
          this.mediaService.getRecentUploads(10),
        ]);

      return {
        success: true,
        data: {
          overview,
          byType,
          storage,
          topUploaders,
          largestFiles,
          recentFiles,
          generatedAt: new Date(),
        },
      };
    } catch (error) {
      this.logger.error(`Error generating full report: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
}

