import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  Res,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { BackupsService } from './backups.service';
import { CreateBackupDto, BackupResponseDto, BackupStatsDto } from './dto/backup.dto';
import axios from 'axios';

@ApiTags('النسخ الاحتياطي')
@Controller('backups')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class BackupsController {
  constructor(private readonly backupsService: BackupsService) {}

  @Post()
  @ApiOperation({
    summary: 'إنشاء نسخة احتياطية يدوياً',
    description: 'إنشاء نسخة احتياطية كاملة لقاعدة البيانات',
  })
  @ApiResponse({
    status: 201,
    description: 'تم إنشاء النسخة الاحتياطية بنجاح',
    type: BackupResponseDto,
  })
  async createBackup(
    @Request() req: { user: { userId: string } },
  ): Promise<{ message: string; data: BackupResponseDto }> {
    const backup = await this.backupsService.createBackup(req.user.userId);
    return {
      message: 'تم إنشاء النسخة الاحتياطية بنجاح',
      data: backup.toObject() as BackupResponseDto,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'الحصول على جميع النسخ الاحتياطية',
    description: 'استرداد قائمة بجميع النسخ الاحتياطية مع إمكانية التصفح',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد النسخ الاحتياطية بنجاح',
  })
  async getAllBackups(
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ): Promise<{
    message: string;
    data: BackupResponseDto[];
    pagination: { total: number; limit: number; skip: number };
  }> {
    const result = await this.backupsService.getAllBackups(
      limit ? parseInt(limit) : 50,
      skip ? parseInt(skip) : 0,
    );
    return {
      message: 'تم استرداد النسخ الاحتياطية بنجاح',
      data: result.backups.map((b) => b.toObject() as BackupResponseDto),
      pagination: {
        total: result.total,
        limit: limit ? parseInt(limit) : 50,
        skip: skip ? parseInt(skip) : 0,
      },
    };
  }

  @Get('stats')
  @ApiOperation({
    summary: 'إحصائيات النسخ الاحتياطي',
    description: 'الحصول على إحصائيات النسخ الاحتياطي',
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد الإحصائيات بنجاح',
    type: BackupStatsDto,
  })
  async getStats(): Promise<{ message: string; data: BackupStatsDto }> {
    const stats = await this.backupsService.getBackupStats();
    return {
      message: 'تم استرداد الإحصائيات بنجاح',
      data: stats,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'الحصول على نسخة احتياطية واحدة',
    description: 'استرداد تفاصيل نسخة احتياطية معينة',
  })
  @ApiParam({ name: 'id', description: 'معرف النسخة الاحتياطية' })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد النسخة الاحتياطية بنجاح',
    type: BackupResponseDto,
  })
  async getBackup(@Param('id') id: string): Promise<{ message: string; data: BackupResponseDto }> {
    const backup = await this.backupsService.getBackup(id);
    return {
      message: 'تم استرداد النسخة الاحتياطية بنجاح',
      data: backup.toObject() as BackupResponseDto,
    };
  }

  @Get(':id/download')
  @ApiOperation({
    summary: 'تحميل نسخة احتياطية',
    description: 'تحميل ملف النسخة الاحتياطية من Bunny Storage',
  })
  @ApiParam({ name: 'id', description: 'معرف النسخة الاحتياطية' })
  @ApiResponse({
    status: 200,
    description: 'تم تحميل الملف بنجاح',
  })
  async downloadBackup(@Param('id') id: string, @Res() res: Response) {
    const backup = await this.backupsService.getBackup(id);

    if (backup.status !== 'completed') {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'النسخة الاحتياطية غير مكتملة',
      });
    }

    if (!backup.bunnyUrl && !backup.bunnyPath) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'ملف النسخة الاحتياطية غير موجود في Bunny Storage',
      });
    }

    try {
      // تحميل الملف من Bunny
      const downloadUrl = backup.bunnyUrl || this.getBunnyUrl(backup.bunnyPath!);
      const response = await axios.get(downloadUrl, {
        responseType: 'stream',
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      res.setHeader('Content-Type', 'application/gzip');
      res.setHeader('Content-Disposition', `attachment; filename="${backup.filename}"`);
      res.setHeader('Content-Length', backup.size);

      response.data.pipe(res);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'فشل تحميل الملف من Bunny Storage',
        error: errorMessage,
      });
    }
  }

  @Post(':id/restore')
  @ApiOperation({
    summary: 'استعادة قاعدة البيانات',
    description: 'استعادة قاعدة البيانات من نسخة احتياطية (تحذير: سيتم حذف البيانات الحالية)',
  })
  @ApiParam({ name: 'id', description: 'معرف النسخة الاحتياطية' })
  @ApiResponse({
    status: 200,
    description: 'تم استعادة قاعدة البيانات بنجاح',
  })
  async restoreBackup(@Param('id') id: string): Promise<{ message: string }> {
    await this.backupsService.restoreBackup(id);
    return {
      message: 'تم استعادة قاعدة البيانات بنجاح',
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'حذف نسخة احتياطية',
    description: 'حذف نسخة احتياطية معينة من Bunny Storage وقاعدة البيانات',
  })
  @ApiParam({ name: 'id', description: 'معرف النسخة الاحتياطية' })
  @ApiResponse({
    status: 200,
    description: 'تم حذف النسخة الاحتياطية بنجاح',
  })
  async deleteBackup(@Param('id') id: string): Promise<{ message: string }> {
    await this.backupsService.deleteBackup(id);
    return {
      message: 'تم حذف النسخة الاحتياطية بنجاح',
    };
  }

  /**
   * الحصول على رابط Bunny من المسار
   */
  private getBunnyUrl(bunnyPath: string): string {
    // هذا سيتم استخدامه فقط إذا لم يكن bunnyUrl موجوداً
    // في الواقع، يجب أن يكون bunnyUrl موجوداً دائماً بعد الرفع
    return bunnyPath;
  }
}
