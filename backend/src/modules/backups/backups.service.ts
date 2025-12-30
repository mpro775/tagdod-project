import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  unlinkSync,
  rmSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import axios from 'axios';
import {
  Backup,
  BackupDocument,
  BackupStatus,
  BackupType,
} from './schemas/backup.schema';
import { FileStorageService } from '../analytics/services/file-storage.service';

const execAsync = promisify(exec);

@Injectable()
export class BackupsService {
  private readonly logger = new Logger(BackupsService.name);
  private readonly backupDir: string;
  private readonly bunnyFolder: string;
  private readonly maxBackups: number = 30; // الاحتفاظ بـ 30 نسخة كحد أقصى

  constructor(
    @InjectModel(Backup.name) private backupModel: Model<BackupDocument>,
    private configService: ConfigService,
    private fileStorageService: FileStorageService,
  ) {
    // تحديد مجلد النسخ الاحتياطي
    this.backupDir =
      this.configService.get<string>('BACKUP_DIR') ||
      join(process.cwd(), 'backups', 'mongo');

    // تحديد مجلد Bunny
    this.bunnyFolder =
      this.configService.get<string>('BACKUP_BUNNY_FOLDER') ||
      'database-backups';

    // إنشاء المجلد إذا لم يكن موجوداً
    if (!existsSync(this.backupDir)) {
      mkdirSync(this.backupDir, { recursive: true });
      this.logger.log(`Created backup directory: ${this.backupDir}`);
    }
  }

  /**
   * إنشاء نسخة احتياطية يدوياً
   */
  async createBackup(userId?: string): Promise<BackupDocument> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `backup-${timestamp}`;
    const backupPath = join(this.backupDir, backupName);
    const compressedFile = `${backupPath}.tar.gz`;

    // إنشاء سجل النسخ الاحتياطي
    const backup = new this.backupModel({
      name: backupName,
      filename: `${backupName}.tar.gz`,
      localPath: compressedFile,
      size: 0,
      status: BackupStatus.IN_PROGRESS,
      type: BackupType.FULL,
      createdBy: userId,
      isAutomatic: false,
    });

    await backup.save();

    try {
      this.logger.log(`Starting backup: ${backupName}`);

      // التحقق من وجود mongodump
      try {
        await execAsync('which mongodump');
      } catch {
        throw new Error(
          'mongodump command not found. Please install MongoDB Database Tools.',
        );
      }

      // التحقق من وجود MONGO_URI
      const mongoUri = this.configService.get<string>('MONGO_URI');
      if (!mongoUri) {
        throw new Error('MONGO_URI environment variable is not set');
      }

      // إنشاء مجلد النسخ الاحتياطي
      if (!existsSync(backupPath)) {
        mkdirSync(backupPath, { recursive: true });
      }

      // تنفيذ mongodump
      const dumpCommand = `mongodump --uri="${mongoUri}" --out="${backupPath}" --gzip`;
      this.logger.log(`Executing mongodump...`);

      await execAsync(dumpCommand, {
        maxBuffer: 1024 * 1024 * 100, // 100MB buffer
      });

      // ضغط النسخة الاحتياطية
      const tarCommand = `tar -czf "${compressedFile}" -C "${this.backupDir}" "${backupName}"`;
      this.logger.log(`Compressing backup...`);
      await execAsync(tarCommand);

      // حذف المجلد غير المضغوط
      rmSync(backupPath, { recursive: true, force: true });

      // الحصول على حجم الملف
      const stats = statSync(compressedFile);
      const size = stats.size;

      // تحديث السجل
      backup.size = size;
      backup.localPath = compressedFile;

      // رفع إلى Bunny
      this.logger.log(`Uploading backup to Bunny Storage...`);
      const uploadResult = await this.uploadToBunny(compressedFile, backupName);

      backup.bunnyPath = uploadResult.path;
      backup.bunnyUrl = uploadResult.url;
      backup.status = BackupStatus.COMPLETED;
      backup.completedAt = new Date();
      backup.metadata = {
        collections: await this.getCollectionCount(backupPath),
      };

      await backup.save();

      this.logger.log(
        `Backup completed successfully: ${backupName} (${this.formatSize(size)})`,
      );
      this.logger.log(`Bunny URL: ${uploadResult.url}`);

      // حذف النسخة المحلية بعد الرفع الناجح
      this.logger.log(`Deleting local backup file...`);
      if (existsSync(compressedFile)) {
        unlinkSync(compressedFile);
        this.logger.log(`Local backup file deleted: ${compressedFile}`);
      }

      // تنظيف النسخ القديمة
      await this.cleanupOldBackups();

      return backup;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Backup failed: ${errorMessage}`, errorStack);

      backup.status = BackupStatus.FAILED;
      backup.errorMessage = errorMessage;
      await backup.save();

      // حذف الملفات الفاشلة
      try {
        if (existsSync(backupPath)) {
          rmSync(backupPath, { recursive: true, force: true });
        }
        if (existsSync(compressedFile)) {
          unlinkSync(compressedFile);
        }
      } catch (cleanupError) {
        const cleanupErrorMessage = cleanupError instanceof Error ? cleanupError.message : String(cleanupError);
        this.logger.error(
          `Failed to cleanup failed backup: ${cleanupErrorMessage}`,
        );
      }

      throw error;
    }
  }

  /**
   * رفع النسخة الاحتياطية إلى Bunny Storage
   */
  private async uploadToBunny(
    filePath: string,
    backupName: string,
  ): Promise<{ url: string; path: string }> {
    try {
      const fileBuffer = readFileSync(filePath);
      const filename = `${backupName}.tar.gz`;
      const mimeType = 'application/gzip';

      const result = await this.fileStorageService.uploadBuffer(
        fileBuffer,
        filename,
        mimeType,
        this.bunnyFolder,
      );

      return {
        url: result.url,
        path: result.path,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to upload to Bunny: ${errorMessage}`);
      throw new Error(`Failed to upload backup to Bunny: ${errorMessage}`);
    }
  }

  /**
   * إنشاء نسخة احتياطية تلقائية
   */
  async createAutomaticBackup(): Promise<BackupDocument> {
    const backup = await this.createBackup();
    backup.isAutomatic = true;
    await backup.save();
    return backup;
  }

  /**
   * الحصول على جميع النسخ الاحتياطية
   */
  async getAllBackups(limit = 50, skip = 0): Promise<{
    backups: BackupDocument[];
    total: number;
  }> {
    const [backups, total] = await Promise.all([
      this.backupModel
        .find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .exec(),
      this.backupModel.countDocuments().exec(),
    ]);

    return { backups, total };
  }

  /**
   * الحصول على نسخة احتياطية واحدة
   */
  async getBackup(id: string): Promise<BackupDocument> {
    const backup = await this.backupModel.findById(id).exec();
    if (!backup) {
      throw new Error('Backup not found');
    }
    return backup;
  }

  /**
   * حذف نسخة احتياطية
   */
  async deleteBackup(id: string): Promise<void> {
    const backup = await this.getBackup(id);

    // حذف من Bunny
    if (backup.bunnyPath) {
      try {
        await this.fileStorageService.deleteFile(backup.bunnyPath);
        this.logger.log(`Deleted backup from Bunny: ${backup.bunnyPath}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.warn(
          `Failed to delete from Bunny (continuing): ${errorMessage}`,
        );
      }
    }

    // حذف الملف المحلي إن وجد
    if (backup.localPath && existsSync(backup.localPath)) {
      try {
        unlinkSync(backup.localPath);
        this.logger.log(`Deleted local backup file: ${backup.localPath}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.warn(
          `Failed to delete local file (continuing): ${errorMessage}`,
        );
      }
    }

    // حذف السجل
    await this.backupModel.findByIdAndDelete(id).exec();
    this.logger.log(`Deleted backup record: ${id}`);
  }

  /**
   * استعادة قاعدة البيانات من نسخة احتياطية
   */
  async restoreBackup(id: string): Promise<void> {
    const backup = await this.getBackup(id);

    if (backup.status !== BackupStatus.COMPLETED) {
      throw new Error('Cannot restore from incomplete backup');
    }

    if (!backup.bunnyUrl && !backup.bunnyPath) {
      throw new Error('Backup file not found in Bunny Storage');
    }

    try {
      this.logger.log(`Starting restore from backup: ${backup.name}`);

      // التحقق من وجود mongorestore
      try {
        await execAsync('which mongorestore');
      } catch {
        throw new Error(
          'mongorestore command not found. Please install MongoDB Database Tools.',
        );
      }

      const mongoUri = this.configService.get<string>('MONGO_URI');
      if (!mongoUri) {
        throw new Error('MONGO_URI environment variable is not set');
      }

      // تحميل الملف من Bunny
      const downloadPath = join(this.backupDir, `restore-${Date.now()}.tar.gz`);
      const extractPath = join(this.backupDir, `restore-${Date.now()}`);

      try {
        mkdirSync(extractPath, { recursive: true });

        // تحميل الملف من Bunny
        const bunnyUrl = backup.bunnyUrl || this.getBunnyUrl(backup.bunnyPath!);
        const response = await axios.get(bunnyUrl, {
          responseType: 'arraybuffer',
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        });

        // حفظ الملف
        writeFileSync(downloadPath, response.data);

        // استخراج الأرشيف
        const extractCommand = `tar -xzf "${downloadPath}" -C "${extractPath}"`;
        await execAsync(extractCommand);

        // العثور على مجلد النسخ الاحتياطي المستخرج
        const extractedDirs = readdirSync(extractPath);
        const backupDataPath = join(extractPath, extractedDirs[0]);

        // تنفيذ mongorestore
        const restoreCommand = `mongorestore --uri="${mongoUri}" --drop "${backupDataPath}"`;
        this.logger.log(`Executing restore...`);
        await execAsync(restoreCommand, {
          maxBuffer: 1024 * 1024 * 100,
        });

        // تنظيف الملفات المستخرجة
        rmSync(extractPath, { recursive: true, force: true });
        if (existsSync(downloadPath)) {
          unlinkSync(downloadPath);
        }

        this.logger.log(
          `Restore completed successfully from: ${backup.name}`,
        );
      } catch (downloadError) {
        // تنظيف في حالة الخطأ
        if (existsSync(extractPath)) {
          rmSync(extractPath, { recursive: true, force: true });
        }
        if (existsSync(downloadPath)) {
          unlinkSync(downloadPath);
        }
        throw downloadError;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Restore failed: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  /**
   * الحصول على رابط Bunny من المسار
   */
  private getBunnyUrl(bunnyPath: string): string {
    const cdnHostname = this.configService.get<string>('BUNNY_CDN_HOSTNAME');
    const storageZone = this.configService.get<string>('BUNNY_STORAGE_ZONE');
    const hostname = this.configService.get<string>('BUNNY_HOSTNAME') || 'storage.bunnycdn.com';

    if (cdnHostname) {
      const cdnHost = cdnHostname.replace(/^https?:\/\//, '');
      return `https://${cdnHost}/${bunnyPath}`;
    } else {
      const rawHost = hostname.replace(/^https?:\/\//, '');
      return `https://${rawHost}/${storageZone}/${bunnyPath}`;
    }
  }

  /**
   * تنظيف النسخ القديمة
   */
  private async cleanupOldBackups(): Promise<void> {
    const backups = await this.backupModel
      .find({ status: BackupStatus.COMPLETED })
      .sort({ createdAt: -1 })
      .exec();

    if (backups.length > this.maxBackups) {
      const toDelete = backups.slice(this.maxBackups);

      for (const backup of toDelete) {
        try {
          await this.deleteBackup(backup._id.toString());
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          this.logger.error(
            `Failed to delete old backup ${backup._id}: ${errorMessage}`,
          );
        }
      }

      this.logger.log(`Cleaned up ${toDelete.length} old backups`);
    }
  }

  /**
   * الحصول على إحصائيات النسخ الاحتياطي
   */
  async getBackupStats(): Promise<{
    total: number;
    completed: number;
    failed: number;
    totalSize: number;
    lastBackup?: Date;
  }> {
    const [total, completed, failed, backups] = await Promise.all([
      this.backupModel.countDocuments().exec(),
      this.backupModel
        .countDocuments({ status: BackupStatus.COMPLETED })
        .exec(),
      this.backupModel.countDocuments({ status: BackupStatus.FAILED }).exec(),
      this.backupModel
        .find({ status: BackupStatus.COMPLETED })
        .sort({ createdAt: -1 })
        .limit(1)
        .lean()
        .exec(),
    ]);

    const totalSize = await this.backupModel.aggregate([
      { $match: { status: BackupStatus.COMPLETED } },
      { $group: { _id: null, total: { $sum: '$size' } } },
    ]);

    // الوصول إلى createdAt من النتيجة
    const lastBackupDoc = backups[0] as any;
    const lastBackupDate = lastBackupDoc?.createdAt 
      ? (lastBackupDoc.createdAt instanceof Date 
          ? lastBackupDoc.createdAt 
          : new Date(lastBackupDoc.createdAt))
      : undefined;

    return {
      total,
      completed,
      failed,
      totalSize: totalSize[0]?.total || 0,
      lastBackup: lastBackupDate,
    };
  }

  /**
   * مساعد: تنسيق حجم الملف
   */
  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * مساعد: الحصول على عدد المجموعات
   */
  private async getCollectionCount(backupPath: string): Promise<number> {
    try {
      if (!existsSync(backupPath)) return 0;
      const dirs = readdirSync(backupPath, { withFileTypes: true });
      return dirs.filter((d) => d.isDirectory()).length;
    } catch {
      return 0;
    }
  }
}

