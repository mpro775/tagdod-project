import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type VariantDocument = HydratedDocument<Variant>;

@Schema({ _id: false })
export class VariantAttribute {
  @Prop({ type: Types.ObjectId, ref: 'Attribute', required: true })
  attributeId!: string;

  @Prop({ type: Types.ObjectId, ref: 'AttributeValue', required: true })
  valueId!: string;

  @Prop() // للعرض السريع بدون populate
  name?: string; // مثل: "اللون"

  @Prop() // للعرض السريع بدون populate
  value?: string; // مثل: "أحمر"
}

@Schema({ timestamps: true })
export class Variant {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, index: true })
  productId!: string;

  @Prop({ unique: true, sparse: true })
  sku?: string; // Stock Keeping Unit فريد

  // السمات (Attribute Combination)
  @Prop({ type: [VariantAttribute], default: [] })
  attributeValues!: VariantAttribute[];

  // التسعير (مبسط - بالدولار فقط)
  @Prop({ required: true, min: 0 })
  basePriceUSD!: number;

  @Prop({ min: 0 })
  compareAtPriceUSD?: number; // السعر قبل التخفيض

  @Prop({ min: 0 })
  costPriceUSD?: number; // سعر التكلفة

  // المخزون (مبسط)
  @Prop({ required: true, default: 0, min: 0 })
  stock!: number;

  @Prop({ default: 0, min: 0 })
  minStock!: number; // الحد الأدنى للمخزون

  @Prop({ default: false })
  trackInventory!: boolean; // تتبع المخزون

  @Prop({ default: true })
  allowBackorder!: boolean; // السماح بالطلب عند نفاذ المخزون

  // الصور الخاصة بالـ Variant
  @Prop({ type: Types.ObjectId, ref: 'Media' })
  imageId?: string;

  // الوزن والأبعاد
  @Prop({ min: 0 })
  weight?: number; // بالجرام

  @Prop({ min: 0 })
  length?: number; // بالسم

  @Prop({ min: 0 })
  width?: number;

  @Prop({ min: 0 })
  height?: number;

  // الحالة
  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: true })
  isAvailable!: boolean; // متاح للبيع

  // الإحصائيات
  @Prop({ default: 0 })
  salesCount!: number;

  // Soft Delete
  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  deletedBy?: string;
}

export const VariantSchema = SchemaFactory.createForClass(Variant);

// Virtual getters للتوافق مع الفرونت اند
VariantSchema.virtual('price').get(function() {
  return this.basePriceUSD;
});

VariantSchema.virtual('compareAtPrice').get(function() {
  return this.compareAtPriceUSD;
});

VariantSchema.virtual('costPrice').get(function() {
  return this.costPriceUSD;
});

// تأكد من أن virtuals يتم تضمينها في JSON و Object
VariantSchema.set('toJSON', { virtuals: true });
VariantSchema.set('toObject', { virtuals: true });

// Custom validators to prevent NaN values
VariantSchema.path('stock').validate(function(value: number) {
  return !isNaN(value) && isFinite(value) && value >= 0;
}, 'Stock must be a valid non-negative number');

VariantSchema.path('minStock').validate(function(value: number) {
  return !isNaN(value) && isFinite(value) && value >= 0;
}, 'MinStock must be a valid non-negative number');

VariantSchema.path('basePriceUSD').validate(function(value: number) {
  return !isNaN(value) && isFinite(value) && value >= 0;
}, 'BasePriceUSD must be a valid non-negative number');

// Pre-save hook to sanitize numeric fields
VariantSchema.pre('save', function(next) {
  // Sanitize stock
  if (typeof this.stock !== 'number' || isNaN(this.stock) || !isFinite(this.stock)) {
    this.stock = 0;
  }
  
  // Sanitize minStock
  if (typeof this.minStock !== 'number' || isNaN(this.minStock) || !isFinite(this.minStock)) {
    this.minStock = 0;
  }
  
  // Sanitize basePriceUSD
  if (typeof this.basePriceUSD !== 'number' || isNaN(this.basePriceUSD) || !isFinite(this.basePriceUSD)) {
    this.basePriceUSD = 0;
  }
  
  next();
});

// Indexes (مبسطة)
VariantSchema.index({ productId: 1, isActive: 1 });
VariantSchema.index({ sku: 1 }, { unique: true, sparse: true });
VariantSchema.index({ basePriceUSD: 1 });
VariantSchema.index({ stock: 1 });
VariantSchema.index({ 'attributeValues.attributeId': 1 });
VariantSchema.index({ 'attributeValues.valueId': 1 });
VariantSchema.index({ deletedAt: 1 });
VariantSchema.index({ productId: 1, deletedAt: 1, isActive: 1 });
VariantSchema.index({ trackInventory: 1, stock: 1 });

