import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../users/schemas/user.schema';
import { MediaService } from './media.service';
import { UploadMediaDto } from './dto/upload-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { ListMediaDto } from './dto/list-media.dto';

@ApiTags('إدارة-الوسائط')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/media')
export class MediaController {
  private readonly logger = new Logger(MediaController.name);

  constructor(private mediaService: MediaService) {}

  // ==================== رفع صورة إلى المستودع ====================
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'رفع وسائط إلى المكتبة',
    description: 'رفع ملف وسائط (صور، فيديوهات، مستندات) إلى مكتبة الوسائط مع إمكانية إضافة بيانات وصفية'
  })
  @ApiBody({ type: UploadMediaDto })
  @ApiResponse({
    status: 201,
    description: 'تم رفع الوسائط بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'media123', description: 'معرف الوسائط' },
            fileName: { type: 'string', example: 'product-image.jpg', description: 'اسم الملف' },
            filePath: { type: 'string', example: 'media/product-image.jpg', description: 'مسار الملف' },
            fileUrl: { type: 'string', example: 'https://cdn.example.com/media/product-image.jpg', description: 'رابط الملف' },
            fileSize: { type: 'number', example: 1024000, description: 'حجم الملف بالبايت' },
            mimeType: { type: 'string', example: 'image/jpeg', description: 'نوع الملف' },
            alt: { type: 'string', example: 'صورة منتج رائع', description: 'النص البديل' },
            title: { type: 'string', example: 'هاتف ذكي سامسونج', description: 'عنوان الوسائط' },
            tags: {
              type: 'array',
              items: { type: 'string', example: 'product' },
              description: 'العلامات'
            },
            uploadedBy: { type: 'string', example: 'admin123', description: 'معرف المستخدم الذي رفع الملف' },
            uploadedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' }
          }
        },
        meta: {
          type: 'object',
          properties: {
            isDuplicate: { type: 'boolean', example: false, description: 'هل الملف مكرر' }
          }
        },
        message: { type: 'string', example: 'Media uploaded successfully' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'خطأ في البيانات أو نوع الملف غير مدعوم'
  })
  @ApiResponse({
    status: 413,
    description: 'حجم الملف كبير جداً'
  })
  @ApiResponse({
    status: 401,
    description: 'غير مصرح لك بالوصول'
  })
  async uploadMedia(
    @UploadedFile() file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    @Body() dto: UploadMediaDto,
    @Req() req: { user: { sub: string } },
  ) {
    try {
      // التحقق من وجود الملف
      if (!file) {
        throw new Error('No file uploaded');
      }

      const result = await this.mediaService.uploadToLibrary(file, dto, req.user.sub);
      
      return {
        media: result.media,
        isDuplicate: result.isDuplicate,
        message: result.message,
      };
    } catch (error) {
      this.logger.error('Upload error:', error);
      throw error;
    }
  }

  // ==================== قائمة الصور (مع Pagination) ====================
  @Get()
  @ApiOperation({
    summary: 'قائمة الوسائط',
    description: 'استرداد قائمة بجميع الوسائط في المكتبة مع إمكانية التصفية والترقيم'
  })
  @ApiQuery({ type: ListMediaDto })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد قائمة الوسائط بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'media123', description: 'معرف الوسائط' },
              fileName: { type: 'string', example: 'product-image.jpg', description: 'اسم الملف' },
              filePath: { type: 'string', example: 'media/product-image.jpg', description: 'مسار الملف' },
              fileUrl: { type: 'string', example: 'https://cdn.example.com/media/product-image.jpg', description: 'رابط الملف' },
              fileSize: { type: 'number', example: 1024000, description: 'حجم الملف بالبايت' },
              mimeType: { type: 'string', example: 'image/jpeg', description: 'نوع الملف' },
              alt: { type: 'string', example: 'صورة منتج رائع', description: 'النص البديل' },
              title: { type: 'string', example: 'هاتف ذكي سامسونج', description: 'عنوان الوسائط' },
              tags: {
                type: 'array',
                items: { type: 'string', example: 'product' },
                description: 'العلامات'
              },
              uploadedBy: { type: 'string', example: 'admin123', description: 'معرف المستخدم الذي رفع الملف' },
              uploadedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' },
              updatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T11:00:00Z' }
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
    status: 401,
    description: 'غير مصرح لك بالوصول'
  })
  async listMedia(@Query() dto: ListMediaDto) {
    return this.mediaService.listMedia(dto);
  }

  // ==================== عرض صورة واحدة ====================
  @Get(':id')
  @ApiOperation({
    summary: 'تفاصيل الوسائط',
    description: 'استرداد تفاصيل وسائط محددة من المكتبة'
  })
  @ApiParam({ name: 'id', description: 'معرف الوسائط' })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد تفاصيل الوسائط بنجاح',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'media123', description: 'معرف الوسائط' },
        fileName: { type: 'string', example: 'product-image.jpg', description: 'اسم الملف' },
        filePath: { type: 'string', example: 'media/product-image.jpg', description: 'مسار الملف' },
        fileUrl: { type: 'string', example: 'https://cdn.example.com/media/product-image.jpg', description: 'رابط الملف' },
        fileSize: { type: 'number', example: 1024000, description: 'حجم الملف بالبايت' },
        mimeType: { type: 'string', example: 'image/jpeg', description: 'نوع الملف' },
        alt: { type: 'string', example: 'صورة منتج رائع', description: 'النص البديل' },
        title: { type: 'string', example: 'هاتف ذكي سامسونج', description: 'عنوان الوسائط' },
        tags: {
          type: 'array',
          items: { type: 'string', example: 'product' },
          description: 'العلامات'
        },
        uploadedBy: { type: 'string', example: 'admin123', description: 'معرف المستخدم الذي رفع الملف' },
        uploadedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T11:00:00Z' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'الوسائط غير موجودة'
  })
  @ApiResponse({
    status: 401,
    description: 'غير مصرح لك بالوصول'
  })
  async getMedia(@Param('id') id: string) {
    return this.mediaService.getMedia(id);
  }

  // ==================== تحديث بيانات الصورة ====================
  @Patch(':id')
  @ApiOperation({
    summary: 'تحديث الوسائط',
    description: 'تحديث البيانات الوصفية لملف وسائط في المكتبة'
  })
  @ApiParam({ name: 'id', description: 'معرف الوسائط' })
  @ApiBody({ type: UpdateMediaDto })
  @ApiResponse({
    status: 200,
    description: 'تم تحديث الوسائط بنجاح',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'media123', description: 'معرف الوسائط' },
        alt: { type: 'string', example: 'صورة منتج محدثة', description: 'النص البديل المحدث' },
        title: { type: 'string', example: 'هاتف ذكي سامسونج جالاكسي', description: 'العنوان المحدث' },
        tags: {
          type: 'array',
          items: { type: 'string', example: 'product' },
          description: 'العلامات المحدثة'
        },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T12:00:00Z' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'الوسائط غير موجودة'
  })
  @ApiResponse({
    status: 400,
    description: 'بيانات غير صحيحة'
  })
  @ApiResponse({
    status: 401,
    description: 'غير مصرح لك بالوصول'
  })
  async updateMedia(
    @Param('id') id: string,
    @Body() dto: UpdateMediaDto,
  ) {
    return this.mediaService.updateMedia(id, dto);
  }

  // ==================== حذف صورة (Soft Delete) ====================
  @Delete(':id')
  @ApiOperation({
    summary: 'حذف الوسائط',
    description: 'حذف ملف وسائط من المكتبة (حذف مؤقت - يمكن الاستعادة)'
  })
  @ApiParam({ name: 'id', description: 'معرف الوسائط' })
  @ApiResponse({
    status: 200,
    description: 'تم حذف الوسائط بنجاح',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Media deleted successfully' },
        deletedAt: { type: 'string', format: 'date-time', example: '2024-01-15T13:00:00Z' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'الوسائط غير موجودة'
  })
  @ApiResponse({
    status: 403,
    description: 'غير مصرح لك بحذف هذه الوسائط'
  })
  async deleteMedia(
    @Param('id') id: string,
    @Req() req: { user: { sub: string; roles?: string[] } },
  ) {
    this.logger.log(`User ${req.user.sub} attempting to delete media ${id}`);
    const result = await this.mediaService.deleteMedia(id, req.user.sub);
    this.logger.log(`Media ${id} deleted successfully by user ${req.user.sub}`);
    return result;
  }

  // ==================== استعادة صورة محذوفة ====================
  @Post(':id/restore')
  @ApiOperation({
    summary: 'استعادة الوسائط',
    description: 'استعادة ملف وسائط محذوف مؤقتاً إلى المكتبة'
  })
  @ApiParam({ name: 'id', description: 'معرف الوسائط' })
  @ApiResponse({
    status: 200,
    description: 'تم استعادة الوسائط بنجاح',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'media123', description: 'معرف الوسائط' },
        status: { type: 'string', example: 'active', description: 'حالة الوسائط بعد الاستعادة' },
        restoredAt: { type: 'string', format: 'date-time', example: '2024-01-15T14:00:00Z' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'الوسائط غير موجودة أو غير محذوفة'
  })
  @ApiResponse({
    status: 403,
    description: 'غير مصرح لك باستعادة هذه الوسائط'
  })
  async restoreMedia(@Param('id') id: string) {
    return this.mediaService.restoreMedia(id);
  }

  // ==================== حذف نهائي ====================
  @Delete(':id/permanent')
  @ApiOperation({
    summary: 'حذف الوسائط نهائياً',
    description: 'حذف ملف وسائط نهائياً من المكتبة والتخزين (متاح للمشرفين الفائقين فقط)'
  })
  @ApiParam({ name: 'id', description: 'معرف الوسائط' })
  @ApiResponse({
    status: 200,
    description: 'تم حذف الوسائط نهائياً بنجاح',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Media permanently deleted successfully' },
        deletedFiles: {
          type: 'array',
          items: { type: 'string', example: 'media/product-image.jpg' },
          description: 'قائمة الملفات المحذوفة'
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'الوسائط غير موجودة'
  })
  @ApiResponse({
    status: 403,
    description: 'غير مصرح لك بالحذف النهائي (يتطلب صلاحيات مشرف فائق)'
  })
  async permanentDeleteMedia(
    @Param('id') id: string,
    @Req() req: { user: { sub: string; roles?: string[] } }
  ) {
    // Check if user is SUPER_ADMIN
    if (!req.user.roles?.includes(UserRole.SUPER_ADMIN)) {
      this.logger.warn(`Unauthorized permanent delete attempt by user ${req.user.sub} for media ${id}`);
      throw new Error('Access denied. Super Admin required.');
    }
    
    this.logger.log(`Super Admin ${req.user.sub} attempting permanent delete of media ${id}`);
    const result = await this.mediaService.permanentDeleteMedia(id);
    this.logger.log(`Media ${id} permanently deleted by Super Admin ${req.user.sub}`);
    return result;
  }

  // ==================== إحصائيات المستودع ====================
  @Get('stats/summary')
  async getStats() {
    return this.mediaService.getStats();
  }

  // ==================== تنظيف الملفات المحذوفة ====================
  @Post('cleanup/deleted')
  async cleanupDeletedFiles(
    @Req() req: { user: { sub: string; roles?: string[] } }
  ) {
    // Check if user is SUPER_ADMIN
    if (!req.user.roles?.includes(UserRole.SUPER_ADMIN)) {
      this.logger.warn(`Unauthorized cleanup attempt by user ${req.user.sub}`);
      throw new Error('Access denied. Super Admin required.');
    }

    this.logger.log(`Super Admin ${req.user.sub} starting deleted files cleanup`);
    const result = await this.mediaService.cleanupDeletedFiles();
    this.logger.log(`Deleted files cleanup completed by Super Admin ${req.user.sub}. Deleted: ${result.deletedCount}, Errors: ${result.errors.length}`);
    
    return {
      ...result,
      message: `تم تنظيف ${result.deletedCount} ملف محذوف`,
    };
  }

  // ==================== تنظيف الملفات المكررة ====================
  @Post('cleanup/duplicates')
  async cleanupDuplicateFiles(
    @Req() req: { user: { sub: string; roles?: UserRole[] } }
  ) {
    // Check if user is SUPER_ADMIN
    if (!req.user.roles?.includes(UserRole.SUPER_ADMIN)) {
      this.logger.warn(`Unauthorized cleanup attempt by user ${req.user.sub}`);
      throw new Error('Access denied. Super Admin required.');
    }

    this.logger.log(`Super Admin ${req.user.sub} starting duplicate files cleanup`);
    const result = await this.mediaService.cleanupDuplicateFiles();
    this.logger.log(`Duplicate files cleanup completed by Super Admin ${req.user.sub}. Removed: ${result.removedCount}, Errors: ${result.errors.length}`);
    
    return {
      ...result,
      message: `تم إزالة ${result.removedCount} ملف مكرر`,
    };
  }

  // ==================== تنظيف الملفات غير المستخدمة ====================
  @Post('cleanup/unused')
  async cleanupUnusedFiles(
    @Req() req: { user: { sub: string; roles?: UserRole[] } },
    @Query('days') days?: number,
  ) {
    // Check if user is SUPER_ADMIN
    if (!req.user.roles?.includes(UserRole.SUPER_ADMIN)) {
      this.logger.warn(`Unauthorized cleanup attempt by user ${req.user.sub}`);
      throw new Error('Access denied. Super Admin required.');
    }

    const daysThreshold = days || 90;
    this.logger.log(`Super Admin ${req.user.sub} starting unused files cleanup (${daysThreshold} days threshold)`);
    const result = await this.mediaService.cleanupUnusedFiles(daysThreshold);
    this.logger.log(`Unused files cleanup completed by Super Admin ${req.user.sub}. Removed: ${result.removedCount}, Errors: ${result.errors.length}`);
    
    return {
      ...result,
      message: `تم إزالة ${result.removedCount} ملف غير مستخدم`,
    };
  }
}

