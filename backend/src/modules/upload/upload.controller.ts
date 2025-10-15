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
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadService, UploadResult } from './upload.service';
import { UploadFileDto, DeleteFileDto } from './dto/upload.dto';

@ApiTags('upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File upload',
    type: UploadFileDto,
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
    @Query('filename') customFilename?: string,
  ): Promise<{ data: UploadResult }> {
    const result = await this.uploadService.uploadFile(file, folder, customFilename);
    return { data: result };
  }

  @Post('files')
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Multiple files upload',
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
          description: 'Upload folder',
        },
      },
    },
  })
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('folder') folder?: string,
  ): Promise<{ data: UploadResult[] }> {
    const results = await this.uploadService.uploadFiles(files, folder);
    return { data: results };
  }

  @Delete('file')
  async deleteFile(@Body() dto: DeleteFileDto): Promise<{ message: string }> {
    await this.uploadService.deleteFile(dto.filePath);
    return { message: 'File deleted successfully' };
  }

  @Get('file/:filePath(*)')
  async getFileInfo(@Param('filePath') filePath: string): Promise<{ data: unknown }> {
    const info = await this.uploadService.getFileInfo(filePath);
    return { data: info };
  }

  // Public endpoint for accessing uploaded files (if needed)
  @Get('public/*')
  async serveFile(@Param() params: Record<string, string>): Promise<{ data: unknown }> {
    // This endpoint can be used for serving files through the API
    // In production, files should be served directly from CDN
    const filePath = params[0];
    const info = await this.uploadService.getFileInfo(filePath);
    return { data: info };
  }
}
