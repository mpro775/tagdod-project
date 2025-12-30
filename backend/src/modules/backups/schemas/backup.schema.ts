import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BackupDocument = Backup & Document;

export enum BackupStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum BackupType {
  FULL = 'full',
  INCREMENTAL = 'incremental',
}

@Schema({ timestamps: true })
export class Backup {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  filename!: string;

  @Prop()
  localPath?: string; // المسار المحلي (قبل الرفع)

  @Prop()
  bunnyPath?: string; // المسار في Bunny Storage

  @Prop()
  bunnyUrl?: string; // رابط CDN للنسخة الاحتياطية

  @Prop({ required: true, default: 0 })
  size!: number; // حجم الملف بالبايت

  @Prop({
    type: String,
    enum: BackupStatus,
    default: BackupStatus.PENDING,
    index: true,
  })
  status!: BackupStatus;

  @Prop({
    type: String,
    enum: BackupType,
    default: BackupType.FULL,
  })
  type!: BackupType;

  @Prop()
  errorMessage?: string;

  @Prop()
  createdBy?: string; // userId للمستخدم الذي أنشأ النسخة يدوياً

  @Prop({ default: false, index: true })
  isAutomatic!: boolean; // هل تم إنشاؤها تلقائياً أم يدوياً

  @Prop()
  scheduledAt?: Date; // وقت الجدولة المحدد

  @Prop()
  completedAt?: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>; // معلومات إضافية (عدد المجموعات، إلخ)
}

export const BackupSchema = SchemaFactory.createForClass(Backup);

// Create indexes
BackupSchema.index({ status: 1, createdAt: -1 });
BackupSchema.index({ isAutomatic: 1, createdAt: -1 });
BackupSchema.index({ createdAt: -1 });

