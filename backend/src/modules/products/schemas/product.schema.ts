import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

export enum ProductStatus {
  DRAFT = 'draft',           // مسودة
  ACTIVE = 'active',         // نشط
  OUT_OF_STOCK = 'out_of_stock', // نفذ من المخزون
  DISCONTINUED = 'discontinued', // متوقف
}

@Schema({ timestamps: true })
export class Product {
  // المعلومات الأساسية (ثنائي اللغة)
  @Prop({ required: true })
  name!: string; // الاسم بالعربية

  @Prop({ required: true })
  nameEn!: string; // الاسم بالإنجليزية

  @Prop({ required: true, unique: true })
  slug!: string;

  @Prop({ required: true, type: 'String' })
  description!: string; // الوصف بالعربية

  @Prop({ required: true, type: 'String' })
  descriptionEn!: string; // الوصف بالإنجليزية

  // التصنيف
  @Prop({ type: Types.ObjectId, ref: 'Category', required: true, index: true })
  categoryId!: string;

  @Prop({ index: true })
  brandId?: string; // يمكن ربطه بـ Brands Module

  @Prop()
  sku?: string; // Stock Keeping Unit

  // الصور
  @Prop()
  mainImage?: string; // الصورة الرئيسية (URL)

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  mainImageId?: string; // من مستودع الصور

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Media' }], default: [] })
  imageIds!: string[]; // صور إضافية من المستودع

  @Prop({ type: [String], default: [] })
  images!: string[]; // URLs للصور الإضافية

  // السمات
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Attribute' }], default: [] })
  attributes!: string[]; // السمات التي يستخدمها هذا المنتج

  // SEO
  @Prop()
  metaTitle?: string;

  @Prop()
  metaDescription?: string;

  @Prop({ type: [String], default: [] })
  metaKeywords?: string[];

  // الحالة والعرض
  @Prop({ type: String, enum: Object.values(ProductStatus), default: ProductStatus.DRAFT })
  status!: ProductStatus;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: false })
  isFeatured!: boolean; // منتج مميز

  @Prop({ default: false })
  isNew!: boolean; // منتج جديد

  @Prop({ default: false })
  isBestseller!: boolean; // الأكثر مبيعاً

  // الترتيب
  @Prop({ default: 0 })
  order!: number;

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

  // المخزون
  @Prop({ default: 0 })
  stock!: number; // الكمية المتاحة

  @Prop({ default: 0 })
  minStock!: number; // الحد الأدنى للمخزون

  @Prop({ default: 0 })
  maxStock!: number; // الحد الأقصى للمخزون

  @Prop({ default: false })
  trackStock!: boolean; // تتبع المخزون

  @Prop({ default: false })
  allowBackorder!: boolean; // السماح بالطلب عند نفاد المخزون

  // Soft Delete
  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  deletedBy?: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Full-text search
ProductSchema.index({ name: 'text', description: 'text' });

// Performance indexes
ProductSchema.index({ categoryId: 1, status: 1, isActive: 1 });
ProductSchema.index({ brandId: 1, status: 1 });
ProductSchema.index({ slug: 1 });
ProductSchema.index({ status: 1, isActive: 1, order: -1 });
ProductSchema.index({ isFeatured: 1, status: 1 });
ProductSchema.index({ isNew: 1, status: 1 });
ProductSchema.index({ isBestseller: 1, status: 1 });
ProductSchema.index({ deletedAt: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ salesCount: -1 });
ProductSchema.index({ viewsCount: -1 });

// Inventory indexes
ProductSchema.index({ stock: 1, minStock: 1 });
ProductSchema.index({ trackStock: 1, stock: 1 });
ProductSchema.index({ status: 1, stock: 1 });

