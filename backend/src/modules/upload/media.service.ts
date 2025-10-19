import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Media } from './schemas/media.schema';
import { UploadService } from './upload.service';
import { UploadMediaDto } from './dto/upload-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { ListMediaDto } from './dto/list-media.dto';
import { AppException } from '../../shared/exceptions/app.exception';
import * as crypto from 'crypto';
import * as sharp from 'sharp';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    @InjectModel(Media.name) private mediaModel: Model<Media>,
    private uploadService: UploadService,
  ) {}

  /**
   * رفع صورة إلى المستودع
   */
  async uploadToLibrary(file: { buffer: Buffer; originalname: string; mimetype: string; size: number }, dto: UploadMediaDto, userId: string) {
    // حساب hash للملف للكشف عن التكرار
    const fileHash = this.calculateFileHash(file.buffer);

    // فحص التكرار
    const existingMedia = await this.mediaModel
      .findOne({
        fileHash,
        deletedAt: null,
      })
      .lean();

    if (existingMedia) {
      // الصورة موجودة بالفعل - نرجع الموجودة
      return {
        media: existingMedia,
        isDuplicate: true,
        message: 'الصورة موجودة بالفعل في المستودع',
      };
    }

    // تحديد المجلد حسب الفئة
    const folder = `media/${dto.category}`;

    // رفع الملف إلى Bunny.net
    const uploadResult = await this.uploadService.uploadFile(file, folder);

    // استخراج أبعاد الصورة
    let width, height;
    if (file.mimetype.startsWith('image/')) {
      const metadata = await sharp(file.buffer).metadata();
      width = metadata.width;
      height = metadata.height;
    }

    // حفظ البيانات في قاعدة البيانات
    const media = await this.mediaModel.create({
      url: uploadResult.url,
      filename: file.originalname, // الاسم الأصلي للملف
      storedFilename: uploadResult.filename, // المسار الكامل المخزن في Bunny
      name: dto.name,
      category: dto.category,
      type: file.mimetype.startsWith('image/') ? 'image' : 'document',
      mimeType: uploadResult.mimeType,
      size: uploadResult.size,
      width,
      height,
      fileHash,
      description: dto.description || '',
      tags: dto.tags || [],
      uploadedBy: userId,
      isPublic: dto.isPublic !== undefined ? dto.isPublic : true,
      usageCount: 0,
      usedIn: [],
    });

    return {
      media,
      isDuplicate: false,
      message: 'تم رفع الصورة بنجاح',
    };
  }

  /**
   * قائمة الصور من المستودع مع Pagination
   */
  async listMedia(dto: ListMediaDto) {
    const {
      page = 1,
      limit = 24,
      search,
      category,
      type,
      isPublic,
      includeDeleted = false,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = dto;

    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = {};

    // فلترة المحذوفة
    if (!includeDeleted) {
      query.deletedAt = null;
    }

    // البحث
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { filename: { $regex: search, $options: 'i' } },
      ];
    }

    // فلترة حسب الفئة
    if (category) {
      query.category = category;
    }

    // فلترة حسب النوع
    if (type) {
      query.type = type;
    }

    // فلترة العامة/الخاصة
    if (isPublic !== undefined) {
      query.isPublic = isPublic;
    }

    // الترتيب
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      this.mediaModel
        .find(query)
        .populate('uploadedBy', 'firstName lastName phone')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.mediaModel.countDocuments(query),
    ]);

    return {
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * عرض صورة واحدة
   */
  async getMedia(id: string) {
    const media = await this.mediaModel
      .findById(id)
      .populate('uploadedBy', 'firstName lastName phone')
      .lean();

    if (!media) {
      throw new AppException('MEDIA_NOT_FOUND', 'الصورة غير موجودة', null, 404);
    }

    return { data: media };
  }

  /**
   * تحديث بيانات الصورة
   */
  async updateMedia(id: string, dto: UpdateMediaDto) {
    const media = await this.mediaModel.findById(id);

    if (!media) {
      throw new AppException('MEDIA_NOT_FOUND', 'الصورة غير موجودة', null, 404);
    }

    if (media.deletedAt) {
      throw new AppException('MEDIA_DELETED', 'الصورة محذوفة', null, 400);
    }

    // تحديث الحقول
    if (dto.name !== undefined) media.name = dto.name;
    if (dto.category !== undefined) media.category = dto.category;
    if (dto.description !== undefined) media.description = dto.description;
    if (dto.tags !== undefined) media.tags = dto.tags;
    if (dto.isPublic !== undefined) media.isPublic = dto.isPublic;

    await media.save();

    return {
      data: {
        id: media._id,
        name: media.name,
        category: media.category,
        updated: true,
      },
    };
  }

  /**
   * حذف صورة (Soft Delete)
   */
  async deleteMedia(id: string, userId: string) {
    const media = await this.mediaModel.findById(id);

    if (!media) {
      throw new AppException('MEDIA_NOT_FOUND', 'الصورة غير موجودة', null, 404);
    }

    if (media.deletedAt) {
      throw new AppException('MEDIA_ALREADY_DELETED', 'الصورة محذوفة بالفعل', null, 400);
    }

    // Soft delete
    media.deletedAt = new Date();
    media.deletedBy = userId;
    await media.save();

    return {
      data: {
        id: media._id,
        deleted: true,
        deletedAt: media.deletedAt,
      },
    };
  }

  /**
   * استعادة صورة محذوفة
   */
  async restoreMedia(id: string) {
    const media = await this.mediaModel.findById(id);

    if (!media) {
      throw new AppException('MEDIA_NOT_FOUND', 'الصورة غير موجودة', null, 404);
    }

    if (!media.deletedAt) {
      throw new AppException('MEDIA_NOT_DELETED', 'الصورة غير محذوفة', null, 400);
    }

    media.deletedAt = null;
    media.deletedBy = undefined;
    await media.save();

    return {
      data: {
        id: media._id,
        restored: true,
      },
    };
  }

  /**
   * حذف نهائي (Hard Delete)
   */
  async permanentDeleteMedia(id: string) {
    const media = await this.mediaModel.findById(id);

    if (!media) {
      throw new AppException('MEDIA_NOT_FOUND', 'الصورة غير موجودة', null, 404);
    }

    // حذف من Bunny.net
    try {
      await this.uploadService.deleteFile(media.storedFilename);
    } catch (error) {
      this.logger.error('Failed to delete file from Bunny.net:', error);
      // نستمر في الحذف من قاعدة البيانات حتى لو فشل الحذف من Bunny
    }

    // حذف من قاعدة البيانات
    await this.mediaModel.deleteOne({ _id: id });

    return {
      data: {
        id,
        permanentlyDeleted: true,
      },
    };
  }

  /**
   * زيادة عداد الاستخدام
   */
  async incrementUsage(id: string, usedInId: string) {
    const media = await this.mediaModel.findById(id);

    if (media) {
      media.usageCount += 1;
      if (!media.usedIn?.includes(usedInId)) {
        media.usedIn = [...(media.usedIn || []), usedInId];
      }
      await media.save();
    }
  }

  /**
   * تقليل عداد الاستخدام
   */
  async decrementUsage(id: string, usedInId: string) {
    const media = await this.mediaModel.findById(id);

    if (media) {
      media.usageCount = Math.max(0, media.usageCount - 1);
      media.usedIn = media.usedIn?.filter((item) => item !== usedInId) || [];
      await media.save();
    }
  }

  /**
   * إحصائيات المستودع
   */
  async getStats() {
    const [total, byCategory, byType, totalSize, recentlyAdded] = await Promise.all([
      this.mediaModel.countDocuments({ deletedAt: null }),
      this.mediaModel.aggregate([
        { $match: { deletedAt: null } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
      this.mediaModel.aggregate([
        { $match: { deletedAt: null } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
      this.mediaModel.aggregate([
        { $match: { deletedAt: null } },
        { $group: { _id: null, totalSize: { $sum: '$size' } } },
      ]),
      this.mediaModel
        .find({ deletedAt: null })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name category url createdAt')
        .lean(),
    ]);

    const categoryStats: Record<string, number> = {};
    byCategory.forEach((item: { _id: string; count: number }) => {
      categoryStats[item._id] = item.count;
    });

    const typeStats: Record<string, number> = {};
    byType.forEach((item: { _id: string; count: number }) => {
      typeStats[item._id] = item.count;
    });

    const totalSizeInBytes = totalSize[0]?.totalSize || 0;
    const averageSize = total > 0 ? totalSizeInBytes / total : 0;

    return {
      data: {
        total,
        byCategory: categoryStats,
        byType: typeStats,
        totalSize: totalSizeInBytes,
        totalSizeMB: (totalSizeInBytes / (1024 * 1024)).toFixed(2),
        averageSize,
        recentlyAdded,
      },
    };
  }

  /**
   * حساب hash للملف
   */
  private calculateFileHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * تنظيف الملفات المحذوفة نهائياً (Hard Delete)
   */
  async cleanupDeletedFiles(): Promise<{ deletedCount: number; errors: string[] }> {
    const errors: string[] = [];
    let deletedCount = 0;

    try {
      // البحث عن الملفات المحذوفة منذ أكثر من 30 يوم
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const deletedFiles = await this.mediaModel.find({
        deletedAt: { $lt: thirtyDaysAgo },
      }).lean();

      this.logger.log(`Found ${deletedFiles.length} files to cleanup`);

      for (const file of deletedFiles) {
        try {
          // حذف من Bunny.net
          await this.uploadService.deleteFile(file.storedFilename);
          
          // حذف من قاعدة البيانات
          await this.mediaModel.deleteOne({ _id: file._id });
          
          deletedCount++;
          this.logger.log(`Successfully cleaned up file: ${file.storedFilename}`);
        } catch (error) {
          const errorMsg = `Failed to cleanup file ${file.storedFilename}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          this.logger.error(errorMsg);
        }
      }

      this.logger.log(`Cleanup completed. Deleted: ${deletedCount}, Errors: ${errors.length}`);
    } catch (error) {
      this.logger.error('Cleanup process failed:', error);
      errors.push(`Cleanup process failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return { deletedCount, errors };
  }

  /**
   * تنظيف الملفات المكررة
   */
  async cleanupDuplicateFiles(): Promise<{ removedCount: number; errors: string[] }> {
    const errors: string[] = [];
    let removedCount = 0;

    try {
      // البحث عن الملفات المكررة بناءً على fileHash
      const duplicates = await this.mediaModel.aggregate([
        {
          $match: {
            fileHash: { $exists: true, $ne: null },
            deletedAt: null,
          },
        },
        {
          $group: {
            _id: '$fileHash',
            count: { $sum: 1 },
            files: { $push: '$$ROOT' },
          },
        },
        {
          $match: {
            count: { $gt: 1 },
          },
        },
      ]);

      this.logger.log(`Found ${duplicates.length} duplicate file groups`);

      for (const group of duplicates) {
        // الاحتفاظ بالملف الأقدم وحذف الباقي
        const sortedFiles = group.files.sort((a: Media, b: Media) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
        const filesToDelete = sortedFiles.slice(1);

        for (const file of filesToDelete) {
          try {
            // حذف من Bunny.net
            await this.uploadService.deleteFile(file.storedFilename);
            
            // حذف من قاعدة البيانات
            await this.mediaModel.deleteOne({ _id: file._id });
            
            removedCount++;
            this.logger.log(`Removed duplicate file: ${file.storedFilename}`);
          } catch (error) {
            const errorMsg = `Failed to remove duplicate file ${file.storedFilename}: ${error instanceof Error ? error.message : 'Unknown error'}`;
            errors.push(errorMsg);
            this.logger.error(errorMsg);
          }
        }
      }

      this.logger.log(`Duplicate cleanup completed. Removed: ${removedCount}, Errors: ${errors.length}`);
    } catch (error) {
      this.logger.error('Duplicate cleanup process failed:', error);
      errors.push(`Duplicate cleanup process failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return { removedCount, errors };
  }

  /**
   * تنظيف الملفات غير المستخدمة (usageCount = 0 ولم تُستخدم منذ فترة طويلة)
   */
  async cleanupUnusedFiles(daysThreshold: number = 90): Promise<{ removedCount: number; errors: string[] }> {
    const errors: string[] = [];
    let removedCount = 0;

    try {
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);

      const unusedFiles = await this.mediaModel.find({
        usageCount: 0,
        createdAt: { $lt: thresholdDate },
        deletedAt: null,
      }).lean();

      this.logger.log(`Found ${unusedFiles.length} unused files to cleanup`);

      for (const file of unusedFiles) {
        try {
          // حذف من Bunny.net
          await this.uploadService.deleteFile(file.storedFilename);
          
          // حذف من قاعدة البيانات
          await this.mediaModel.deleteOne({ _id: file._id });
          
          removedCount++;
          this.logger.log(`Removed unused file: ${file.storedFilename}`);
        } catch (error) {
          const errorMsg = `Failed to remove unused file ${file.storedFilename}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          this.logger.error(errorMsg);
        }
      }

      this.logger.log(`Unused files cleanup completed. Removed: ${removedCount}, Errors: ${errors.length}`);
    } catch (error) {
      this.logger.error('Unused files cleanup process failed:', error);
      errors.push(`Unused files cleanup process failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return { removedCount, errors };
  }
}
