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
  constructor(private mediaService: MediaService) {}

  // ==================== رفع صورة إلى المستودع ====================
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(
    @UploadedFile() file: Express.Multer.File,
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
      console.error('Upload error:', error);
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
    @Req() req: { user: { sub: string } },
  ) {
    return this.mediaService.deleteMedia(id, req.user.sub);
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
      throw new Error('Access denied. Super Admin required.');
    }
    return this.mediaService.permanentDeleteMedia(id);
  }

  // ==================== إحصائيات المستودع ====================
  @Get('stats/summary')
  async getStats() {
    return this.mediaService.getStats();
  }
}

