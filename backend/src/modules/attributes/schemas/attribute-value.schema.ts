import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AttributeValueDocument = HydratedDocument<AttributeValue>;

@Schema({ timestamps: true })
export class AttributeValue {
  @Prop({ type: Types.ObjectId, ref: 'Attribute', required: true, index: true })
  attributeId!: string;

  @Prop({ required: true })
  value!: string; // القيمة بالعربية (مثل: "أحمر")

  @Prop()
  valueEn?: string; // القيمة بالإنجليزية (مثل: "Red")

  @Prop({ required: true })
  slug!: string; // مثل: "red"

  // معلومات إضافية حسب النوع
  @Prop()
  hexCode?: string; // للألوان (مثل: "#FF0000")

  @Prop()
  imageUrl?: string; // صورة للقيمة (مثل: نسيج، باترن)

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  imageId?: string; // من مستودع الصور

  @Prop({ default: '' })
  description?: string;

  // الترتيب والعرض
  @Prop({ default: 0 })
  order!: number;

  @Prop({ default: true })
  isActive!: boolean;

  // الاستخدام
  @Prop({ default: 0 })
  usageCount!: number; // عدد الـ variants التي تستخدم هذه القيمة

  // Soft Delete
  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  deletedBy?: string;
}

export const AttributeValueSchema = SchemaFactory.createForClass(AttributeValue);

// Indexes
AttributeValueSchema.index({ attributeId: 1, order: 1 });
AttributeValueSchema.index({ attributeId: 1, slug: 1 }, { unique: true });
AttributeValueSchema.index({ deletedAt: 1 });
AttributeValueSchema.index({ attributeId: 1, isActive: 1, order: 1 });

