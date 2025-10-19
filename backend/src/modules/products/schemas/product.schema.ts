import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

export enum ProductStatus {
  DRAFT = 'draft',           // مسودة
  ACTIVE = 'active',         // نشط
  ARCHIVED = 'archived',     // مؤرشف
}

@Schema({ 
  timestamps: true,
  suppressReservedKeysWarning: true
})
export class Product {
  // المعلومات الأساسية (ثنائي اللغة)
  @Prop({ required: true })
  name!: string; // الاسم بالعربية

  @Prop({ required: true })
  nameEn!: string; // الاسم بالإنجليزية

  @Prop({ required: true, unique: true })
  slug!: string;

  @Prop({ required: true })
  description!: string; // الوصف بالعربية

  @Prop({ required: true })
  descriptionEn!: string; // الوصف بالإنجليزية

  // التصنيف
  @Prop({ type: Types.ObjectId, ref: 'Category', required: true, index: true })
  categoryId!: string;

  @Prop({ type: Types.ObjectId, ref: 'Brand', index: true })
  brandId?: string;

  // الصور (مبسط)
  @Prop({ type: Types.ObjectId, ref: 'Media' })
  mainImageId?: string; // الصورة الرئيسية

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Media' }], default: [] })
  imageIds!: string[]; // صور إضافية

  // السمات
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Attribute' }], default: [] })
  attributes!: string[]; // السمات التي يستخدمها هذا المنتج

  // الحالة (مبسط)
  @Prop({ type: String, enum: Object.values(ProductStatus), default: ProductStatus.DRAFT })
  status!: ProductStatus;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: false })
  isFeatured!: boolean; // منتج مميز

  @Prop({ default: false })
  isNew!: boolean; // منتج جديد

  // الإحصائيات
  @Prop({ default: 0 })
  viewsCount!: number; // عدد المشاهدات

  @Prop({ default: 0 })
  salesCount!: number; // عدد المبيعات

  @Prop({ default: 0 })
  variantsCount!: number; // عدد الـ variants

  @Prop({ default: 0 })
  reviewsCount!: number; // عدد التقييمات

  @Prop({ default: 0 })
  averageRating!: number; // متوسط التقييم

  // SEO
  @Prop()
  metaTitle?: string;

  @Prop()
  metaDescription?: string;

  @Prop({ type: [String], default: [] })
  metaKeywords?: string[];

  // الترتيب
  @Prop({ default: 0 })
  order!: number;

  // Soft Delete
  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  deletedBy?: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Full-text search
ProductSchema.index({ name: 'text', description: 'text' });

// Performance indexes (مبسطة)
ProductSchema.index({ categoryId: 1, status: 1, isActive: 1 });
ProductSchema.index({ brandId: 1, status: 1 });
ProductSchema.index({ slug: 1 });
ProductSchema.index({ status: 1, isActive: 1, order: -1 });
ProductSchema.index({ isFeatured: 1, status: 1 });
ProductSchema.index({ isNew: 1, status: 1 });
ProductSchema.index({ deletedAt: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ salesCount: -1 });
ProductSchema.index({ viewsCount: -1 });

