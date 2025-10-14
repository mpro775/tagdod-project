import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AttributeDocument = HydratedDocument<Attribute>;

export enum AttributeType {
  SELECT = 'select',       // اختيار واحد (مثل: اللون)
  MULTISELECT = 'multiselect', // اختيار متعدد
  TEXT = 'text',           // نص حر
  NUMBER = 'number',       // رقم
  BOOLEAN = 'boolean',     // نعم/لا
}

@Schema({ timestamps: true })
export class Attribute {
  @Prop({ required: true })
  name!: string; // الاسم بالعربية (مثل: "اللون")

  @Prop({ required: true, unique: true })
  nameEn!: string; // الاسم بالإنجليزية (مثل: "Color")

  @Prop({ required: true, unique: true })
  slug!: string; // مثل: "color"

  @Prop({ type: String, enum: Object.values(AttributeType), required: true })
  type!: AttributeType;

  @Prop({ default: '' })
  description?: string; // وصف السمة

  // الترتيب والعرض
  @Prop({ default: 0 })
  order!: number; // ترتيب العرض

  @Prop({ default: true })
  isActive!: boolean; // نشطة أم لا

  @Prop({ default: true })
  isFilterable!: boolean; // قابلة للفلترة في الواجهة

  @Prop({ default: false })
  isRequired!: boolean; // إلزامية عند إنشاء منتج

  @Prop({ default: false })
  showInFilters!: boolean; // عرض في الفلاتر الجانبية

  // المجموعة (للتنظيم)
  @Prop({ type: Types.ObjectId, ref: 'AttributeGroup', default: null })
  groupId?: string | null;

  // الاستخدام
  @Prop({ default: 0 })
  usageCount!: number; // عدد المنتجات التي تستخدم هذه السمة

  // Soft Delete
  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  deletedBy?: string;
}

export const AttributeSchema = SchemaFactory.createForClass(Attribute);

// Indexes
AttributeSchema.index({ slug: 1 });
AttributeSchema.index({ nameEn: 1 });
AttributeSchema.index({ isActive: 1, order: 1 });
AttributeSchema.index({ isFilterable: 1 });
AttributeSchema.index({ groupId: 1 });
AttributeSchema.index({ deletedAt: 1 });

