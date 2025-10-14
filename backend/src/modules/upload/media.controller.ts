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
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { MediaService } from './media.service';
import { UploadMediaDto } from './dto/upload-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { ListMediaDto } from './dto/list-media.dto';

@ApiTags('admin-media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)
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
    const result = await this.mediaService.uploadToLibrary(file, dto, req.user.sub);
    
    return {
      data: result.media,
      meta: {
        isDuplicate: result.isDuplicate,
      },
      message: result.message,
    };
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
  @Roles(UserRole.SUPER_ADMIN) // فقط Super Admin
  async permanentDeleteMedia(@Param('id') id: string) {
    return this.mediaService.permanentDeleteMedia(id);
  }

  // ==================== إحصائيات المستودع ====================
  @Get('stats/summary')
  async getStats() {
    return this.mediaService.getStats();
  }
}

