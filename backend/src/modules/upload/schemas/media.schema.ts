import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MediaDocument = HydratedDocument<Media>;

export enum MediaCategory {
  BANNER = 'banner',           // بانرات
  PRODUCT = 'product',         // منتجات
  CATEGORY = 'category',       // فئات
  BRAND = 'brand',            // براند
  OTHER = 'other',            // أخرى
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
}

@Schema({ timestamps: true })
export class Media {
  @Prop({ required: true })
  url!: string; // رابط الصورة

  @Prop({ required: true })
  filename!: string; // اسم الملف الأصلي

  @Prop({ required: true })
  storedFilename!: string; // اسم الملف المخزن

  @Prop({ required: true })
  name!: string; // الاسم الوصفي الذي يضعه الأدمن

  @Prop({ type: String, enum: Object.values(MediaCategory), required: true })
  category!: MediaCategory; // الفئة

  @Prop({ type: String, enum: Object.values(MediaType), default: MediaType.IMAGE })
  type!: MediaType; // نوع الملف

  @Prop()
  mimeType!: string; // نوع MIME

  @Prop()
  size!: number; // حجم الملف بالبايت

  @Prop()
  width?: number; // عرض الصورة (للصور فقط)

  @Prop()
  height?: number; // ارتفاع الصورة (للصور فقط)

  @Prop()
  fileHash?: string; // hash للملف للكشف عن التكرار

  @Prop({ default: '' })
  description?: string; // وصف اختياري

  @Prop({ type: [String], default: [] })
  tags?: string[]; // وسوم للبحث

  @Prop({ type: Types.ObjectId, ref: 'User' })
  uploadedBy!: string; // من قام بالرفع

  @Prop({ default: 0 })
  usageCount!: number; // عدد مرات استخدام الصورة

  @Prop({ type: [String], default: [] })
  usedIn?: string[]; // أين تم استخدامها (productId, categoryId, etc.)

  @Prop({ default: false })
  isPublic!: boolean; // هل الصورة عامة أم خاصة

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null; // Soft delete

  @Prop({ type: Types.ObjectId, ref: 'User' })
  deletedBy?: string;
}

export const MediaSchema = SchemaFactory.createForClass(Media);

// Indexes للأداء
MediaSchema.index({ category: 1, createdAt: -1 });
MediaSchema.index({ name: 'text', description: 'text', tags: 'text' }); // Full-text search
MediaSchema.index({ fileHash: 1 }, { sparse: true });
MediaSchema.index({ uploadedBy: 1, createdAt: -1 });
MediaSchema.index({ deletedAt: 1 });
MediaSchema.index({ category: 1, deletedAt: 1, createdAt: -1 });

