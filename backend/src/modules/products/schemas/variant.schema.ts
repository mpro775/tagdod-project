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

  // التسعير
  @Prop({ required: true })
  price!: number;

  @Prop()
  compareAtPrice?: number; // السعر قبل التخفيض

  @Prop()
  costPrice?: number; // سعر التكلفة

  // المخزون
  @Prop({ required: true, default: 0 })
  stock!: number;

  @Prop({ default: false })
  trackInventory!: boolean; // تتبع المخزون

  @Prop({ default: true })
  allowBackorder!: boolean; // السماح بالطلب عند نفاذ المخزون

  @Prop({ default: 0 })
  lowStockThreshold!: number; // تحذير عند انخفاض المخزون

  // الصور الخاصة بالـ Variant
  @Prop()
  image?: string;

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  imageId?: string;

  // الوزن والأبعاد
  @Prop()
  weight?: number; // بالجرام

  @Prop()
  length?: number; // بالسم

  @Prop()
  width?: number;

  @Prop()
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
}

export const VariantSchema = SchemaFactory.createForClass(Variant);

// Indexes
VariantSchema.index({ productId: 1, isActive: 1 });
VariantSchema.index({ sku: 1 }, { unique: true, sparse: true });
VariantSchema.index({ price: 1 });
VariantSchema.index({ stock: 1 });
VariantSchema.index({ 'attributeValues.attributeId': 1 });
VariantSchema.index({ 'attributeValues.valueId': 1 });
VariantSchema.index({ deletedAt: 1 });
VariantSchema.index({ productId: 1, deletedAt: 1, isActive: 1 });

