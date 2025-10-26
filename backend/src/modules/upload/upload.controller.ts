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
import { UploadFileDto, DeleteFileDto } from './dto/upload.dto';

@ApiTags('رفع-الملفات')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

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
