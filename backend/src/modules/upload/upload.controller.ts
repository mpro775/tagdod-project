import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadService } from './upload.service';
import { BunnyStreamService } from './bunny-stream.service';
import { UploadFileDto, DeleteFileDto, UploadVideoDto, VideoUploadResponseDto } from './dto/upload.dto';

@ApiTags('رفع-الملفات')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly bunnyStreamService: BunnyStreamService,
  ) {}

  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'رفع ملف واحد',
    description: 'رفع ملف واحد مع إمكانية تحديد المجلد والاسم المخصص'
  })
  @ApiBody({
    description: 'رفع ملف',
    type: UploadFileDto,
  })
  @ApiQuery({ name: 'folder', required: false, description: 'المجلد المراد رفع الملف إليه', example: 'products' })
  @ApiQuery({ name: 'filename', required: false, description: 'اسم مخصص للملف', example: 'product-image-001.jpg' })
  @ApiResponse({
    status: 201,
    description: 'تم رفع الملف بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            fileName: { type: 'string', example: 'product-image-001.jpg', description: 'اسم الملف' },
            filePath: { type: 'string', example: 'products/product-image-001.jpg', description: 'مسار الملف' },
            fileUrl: { type: 'string', example: 'https://cdn.example.com/products/product-image-001.jpg', description: 'رابط الملف' },
            fileSize: { type: 'number', example: 1024000, description: 'حجم الملف بالبايت' },
            mimeType: { type: 'string', example: 'image/jpeg', description: 'نوع الملف' },
            uploadedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' }
          }
        }
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
  async uploadFile(
    @UploadedFile() file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    @Query('folder') folder?: string,
    @Query('filename') customFilename?: string,
  ) {
    const result = await this.uploadService.uploadFile(file, folder, customFilename);
    return result;
  }

  @Post('files')
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'رفع ملفات متعددة',
    description: 'رفع عدة ملفات في وقت واحد (حتى 10 ملفات) مع إمكانية تحديد المجلد'
  })
  @ApiBody({
    description: 'رفع ملفات متعددة',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        folder: {
          type: 'string',
          description: 'المجلد المراد رفع الملفات إليه',
        },
      },
    },
  })
  @ApiQuery({ name: 'folder', required: false, description: 'المجلد المراد رفع الملفات إليه', example: 'gallery' })
  @ApiResponse({
    status: 201,
    description: 'تم رفع الملفات بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              fileName: { type: 'string', example: 'image1.jpg', description: 'اسم الملف' },
              filePath: { type: 'string', example: 'gallery/image1.jpg', description: 'مسار الملف' },
              fileUrl: { type: 'string', example: 'https://cdn.example.com/gallery/image1.jpg', description: 'رابط الملف' },
              fileSize: { type: 'number', example: 512000, description: 'حجم الملف بالبايت' },
              mimeType: { type: 'string', example: 'image/jpeg', description: 'نوع الملف' },
              uploadedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'خطأ في البيانات أو نوع أحد الملفات غير مدعوم'
  })
  @ApiResponse({
    status: 413,
    description: 'حجم إحدى الملفات كبير جداً'
  })
  @ApiResponse({
    status: 401,
    description: 'غير مصرح لك بالوصول'
  })
  async uploadFiles(
    @UploadedFiles() files: { buffer: Buffer; originalname: string; mimetype: string; size: number }[],
    @Query('folder') folder?: string,
  ) {
    const results = await this.uploadService.uploadFiles(files, folder);
    return results;
  }

  @Delete('file')
  @ApiOperation({
    summary: 'حذف ملف',
    description: 'حذف ملف مرفوع من خلال مساره'
  })
  @ApiBody({ type: DeleteFileDto })
  @ApiResponse({
    status: 200,
    description: 'تم حذف الملف بنجاح',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'File deleted successfully' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'الملف غير موجود'
  })
  @ApiResponse({
    status: 403,
    description: 'غير مصرح لك بحذف هذا الملف'
  })
  async deleteFile(@Body() dto: DeleteFileDto) {
    await this.uploadService.deleteFile(dto.filePath);
    return { message: 'File deleted successfully' };
  }

  @Get('file/:filePath(*)')
  @ApiOperation({
    summary: 'معلومات الملف',
    description: 'الحصول على معلومات مفصلة عن ملف مرفوع'
  })
  @ApiParam({ name: 'filePath', description: 'مسار الملف', example: 'products/image.jpg' })
  @ApiResponse({
    status: 200,
    description: 'تم استرجاع معلومات الملف بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            fileName: { type: 'string', example: 'image.jpg', description: 'اسم الملف' },
            filePath: { type: 'string', example: 'products/image.jpg', description: 'مسار الملف' },
            fileUrl: { type: 'string', example: 'https://cdn.example.com/products/image.jpg', description: 'رابط الملف' },
            fileSize: { type: 'number', example: 1024000, description: 'حجم الملف بالبايت' },
            mimeType: { type: 'string', example: 'image/jpeg', description: 'نوع الملف' },
            uploadedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' },
            lastModified: { type: 'string', format: 'date-time', example: '2024-01-15T11:00:00Z' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'الملف غير موجود'
  })
  @ApiResponse({
    status: 403,
    description: 'غير مصرح لك بالوصول إلى معلومات هذا الملف'
  })
  async getFileInfo(@Param('filePath') filePath: string) {
    const info = await this.uploadService.getFileInfo(filePath);
    return info;
  }

  @Post('video')
  @UseInterceptors(FileInterceptor('video'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'رفع فيديو',
    description: 'رفع فيديو إلى Bunny Stream مع إمكانية تحديد العنوان'
  })
  @ApiBody({
    description: 'رفع فيديو',
    type: UploadVideoDto,
  })
  @ApiResponse({
    status: 201,
    description: 'تم رفع الفيديو بنجاح',
    type: VideoUploadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'خطأ في البيانات أو نوع الفيديو غير مدعوم'
  })
  @ApiResponse({
    status: 413,
    description: 'حجم الفيديو كبير جداً'
  })
  @ApiResponse({
    status: 401,
    description: 'غير مصرح لك بالوصول'
  })
  async uploadVideo(
    @UploadedFile() video: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    @Body() body: UploadVideoDto,
  ) {
    const result = await this.bunnyStreamService.uploadVideo(video, body.title);
    return result;
  }

  @Get('video/:videoId')
  @ApiOperation({
    summary: 'معلومات الفيديو',
    description: 'الحصول على معلومات مفصلة عن فيديو مرفوع'
  })
  @ApiParam({ name: 'videoId', description: 'معرف الفيديو', example: '123456' })
  @ApiResponse({
    status: 200,
    description: 'تم استرجاع معلومات الفيديو بنجاح',
    type: VideoUploadResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'الفيديو غير موجود'
  })
  async getVideoInfo(@Param('videoId') videoId: string) {
    const info = await this.bunnyStreamService.getVideoInfo(videoId);
    return info;
  }

  @Delete('video/:videoId')
  @ApiOperation({
    summary: 'حذف فيديو',
    description: 'حذف فيديو مرفوع من خلال معرفه'
  })
  @ApiParam({ name: 'videoId', description: 'معرف الفيديو', example: '123456' })
  @ApiResponse({
    status: 200,
    description: 'تم حذف الفيديو بنجاح',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Video deleted successfully' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'الفيديو غير موجود'
  })
  async deleteVideo(@Param('videoId') videoId: string) {
    await this.bunnyStreamService.deleteVideo(videoId);
    return { message: 'Video deleted successfully' };
  }

  @Get('videos')
  @ApiOperation({
    summary: 'قائمة الفيديوهات',
    description: 'الحصول على قائمة الفيديوهات المرفوعة'
  })
  @ApiQuery({ name: 'page', required: false, description: 'رقم الصفحة', example: 1 })
  @ApiQuery({ name: 'perPage', required: false, description: 'عدد الفيديوهات في الصفحة', example: 20 })
  @ApiResponse({
    status: 200,
    description: 'تم استرجاع قائمة الفيديوهات بنجاح',
    schema: {
      type: 'object',
      properties: {
        totalItems: { type: 'number', example: 100 },
        currentPage: { type: 'number', example: 1 },
        itemsPerPage: { type: 'number', example: 20 },
        items: {
          type: 'array',
          items: VideoUploadResponseDto
        }
      }
    }
  })
  async listVideos(
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    const result = await this.bunnyStreamService.listVideos(page || 1, perPage || 20);
    return result;
  }

  // Public endpoint for accessing uploaded files (if needed)
  @Get('public/*')
  @ApiOperation({
    summary: 'عرض ملف عام',
    description: 'عرض ملف مرفوع بشكل عام (يُستخدم للاختبار - في الإنتاج يُفضل استخدام CDN مباشرة)'
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرجاع الملف بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          description: 'معلومات الملف أو محتواه حسب النوع'
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'الملف غير موجود'
  })
  async serveFile(@Param() params: Record<string, string>) {
    // This endpoint can be used for serving files through the API
    // In production, files should be served directly from CDN
    const filePath = params[0];
    const info = await this.uploadService.getFileInfo(filePath);
    return info;
  }
}
