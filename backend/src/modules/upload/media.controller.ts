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
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../users/schemas/user.schema';
import { MediaService } from './media.service';
import { UploadMediaDto } from './dto/upload-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { ListMediaDto } from './dto/list-media.dto';

@ApiTags('admin-media')
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
        success: true,
        data: result.media,
        meta: {
          isDuplicate: result.isDuplicate,
        },
        message: result.message,
      };
    } catch (error) {
      this.logger.error('Upload error:', error);
      throw error;
    }
  }

  // ==================== قائمة الصور (مع Pagination) ====================
  @Get()
  async listMedia(@Query() dto: ListMediaDto) {
    return this.mediaService.listMedia(dto);
  }

  // ==================== عرض صورة واحدة ====================
  @Get(':id')
  async getMedia(@Param('id') id: string) {
    return this.mediaService.getMedia(id);
  }

  // ==================== تحديث بيانات الصورة ====================
  @Patch(':id')
  async updateMedia(
    @Param('id') id: string,
    @Body() dto: UpdateMediaDto,
  ) {
    return this.mediaService.updateMedia(id, dto);
  }

  // ==================== حذف صورة (Soft Delete) ====================
  @Delete(':id')
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
  async restoreMedia(@Param('id') id: string) {
    return this.mediaService.restoreMedia(id);
  }

  // ==================== حذف نهائي ====================
  @Delete(':id/permanent')
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
      success: true,
      data: result,
      message: `تم تنظيف ${result.deletedCount} ملف محذوف`,
    };
  }

  // ==================== تنظيف الملفات المكررة ====================
  @Post('cleanup/duplicates')
  async cleanupDuplicateFiles(
    @Req() req: { user: { sub: string; roles?: string[] } }
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
      success: true,
      data: result,
      message: `تم إزالة ${result.removedCount} ملف مكرر`,
    };
  }

  // ==================== تنظيف الملفات غير المستخدمة ====================
  @Post('cleanup/unused')
  async cleanupUnusedFiles(
    @Query('days') days?: number,
    @Req() req: { user: { sub: string; roles?: string[] } }
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
      success: true,
      data: result,
      message: `تم إزالة ${result.removedCount} ملف غير مستخدم`,
    };
  }
}

