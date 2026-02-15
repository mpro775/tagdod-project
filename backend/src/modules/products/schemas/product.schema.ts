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

  @Prop({ unique: true, sparse: true })
  sku?: string; // Stock Keeping Unit فريد

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

  // الفيديوهات
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Media' }], default: [] })
  videoIds!: string[]; // فيديوهات المنتج

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

  @Prop({ default: false })
  isBestseller!: boolean; // الأكثر مبيعاً

  // الإحصائيات
  @Prop({ default: 0 })
  viewsCount!: number; // عدد المشاهدات

  @Prop({ default: 0 })
  salesCount!: number; // عدد المبيعات

  @Prop({ default: 0 })
  variantsCount!: number; // عدد الـ variants

  @Prop({ default: 0 })
  reviewsCount!: number; // عدد التقييمات الحقيقية

  @Prop({ default: 0 })
  averageRating!: number; // متوسط التقييم الحقيقي

  // التقييم اليدوي (للأدمن)
  @Prop({ default: false })
  useManualRating!: boolean; // استخدام التقييم اليدوي بدلاً من الحقيقي

  @Prop({ default: 0, min: 0, max: 5 })
  manualRating!: number; // التقييم اليدوي (0-5)

  @Prop({ default: 0 })
  manualReviewsCount!: number; // عدد التقييمات اليدوي (للعرض فقط)

  // 🆕 Default pricing for simple products (without variants)
  @Prop({ type: Number, min: 0 })
  basePriceUSD?: number;

  @Prop({ type: Number, min: 0 })
  basePriceSAR?: number;

  @Prop({ type: Number, min: 0 })
  basePriceYER?: number;

  @Prop({ type: Number, min: 0 })
  compareAtPriceUSD?: number;

  @Prop({ type: Number, min: 0 })
  compareAtPriceSAR?: number;

  @Prop({ type: Number, min: 0 })
  compareAtPriceYER?: number;

  @Prop({ type: Number, min: 0 })
  costPriceUSD?: number;

  @Prop({ type: Number, min: 0 })
  costPriceSAR?: number;

  @Prop({ type: Number, min: 0 })
  costPriceYER?: number;

  @Prop({ type: Date })
  lastExchangeRateSyncAt?: Date;

  @Prop({ type: String })
  exchangeRateVersion?: string;

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

  // إدارة المخزون للمنتجات البسيطة (بدون Variants)
  @Prop({ default: 0, min: 0 })
  stock?: number;

  @Prop({ default: 0, min: 0 })
  minStock?: number;

  @Prop({ default: 0, min: 0 })
  maxStock?: number;

  @Prop({ default: false })
  trackStock?: boolean;

  @Prop({ default: false })
  allowBackorder?: boolean;

  // الحد الأدنى والأقصى للطلب
  @Prop({ default: 1, min: 1 })
  minOrderQuantity?: number; // الحد الأدنى للطلب

  @Prop({ default: 0, min: 0 }) // 0 يعني لا يوجد حد أقصى
  maxOrderQuantity?: number; // الحد الأقصى للطلب

  // المنتجات الشبيهة
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Product' }], default: [] })
  relatedProducts!: string[]; // IDs of related/similar products

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
ProductSchema.index({ sku: 1 }, { unique: true, sparse: true });
ProductSchema.index({ status: 1, isActive: 1, order: -1 });
ProductSchema.index({ isFeatured: 1, status: 1 });
ProductSchema.index({ isNew: 1, status: 1 });
ProductSchema.index({ deletedAt: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ salesCount: -1 });
ProductSchema.index({ viewsCount: -1 });

// Virtual for isAvailable
ProductSchema.virtual('isAvailable').get(function() {
  // إذا كان المنتج غير نشط، غير متاح
  if (!this.isActive || this.status !== ProductStatus.ACTIVE) {
    return false;
  }

  // إذا كان المنتج لديه variants، نحتاج للتحقق من variants
  // سيتم التحقق الفعلي في service layer
  if (this.variantsCount > 0) {
    return true; // افتراضي true، سيتم التحقق الفعلي في service
  }

  // للمنتجات البسيطة (بدون variants)
  // إذا كان المخزون صفر، المنتج غير متاح بغض النظر عن trackStock
  const stock = this.stock ?? 0;
  if (stock === 0) {
    return false;
  }

  // إذا كان trackStock مفعل، نتحقق من المخزون
  if (this.trackStock) {
    return stock > 0;
  }

  // إذا لم يكن trackStock مفعل والمخزون أكبر من صفر، المنتج متاح
  return true;
});

// تأكد من أن virtuals يتم تضمينها في JSON و Object
ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

