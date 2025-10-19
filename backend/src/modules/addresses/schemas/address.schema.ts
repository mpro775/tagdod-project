import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AddressDocument = HydratedDocument<Address>;

@Schema({ timestamps: true })
export class Address {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  label!: string; // مثل: المنزل، المكتب، عند أمي

  @Prop({ required: true, trim: true })
  line1!: string; // العنوان الرئيسي (الشارع، رقم المبنى)

  @Prop({ required: true, trim: true })
  city!: string; // المدينة

  @Prop({ type: Object, required: true })
  coords!: { lat: number; lng: number }; // الإحداثيات (إجباري)

  @Prop({ trim: true })
  notes?: string; // ملاحظات/تعليمات التسليم

  @Prop({ default: false })
  isDefault!: boolean; // العنوان الافتراضي

  @Prop({ default: true })
  isActive!: boolean; // فعّال أم لا

  @Prop({ type: Date })
  deletedAt?: Date; // Soft delete

  @Prop({ type: Types.ObjectId, ref: 'User' })
  deletedBy?: Types.ObjectId;

  @Prop({ type: Date })
  lastUsedAt?: Date; // آخر مرة استخدم فيها

  @Prop({ default: 0 })
  usageCount!: number; // عدد مرات الاستخدام
}

export const AddressSchema = SchemaFactory.createForClass(Address);

// Performance indexes
AddressSchema.index({ userId: 1, isDefault: 1 });
AddressSchema.index({ userId: 1, deletedAt: 1 });
AddressSchema.index({ userId: 1, isActive: 1, createdAt: -1 });
AddressSchema.index({ city: 1 });
AddressSchema.index({ coords: '2dsphere' });
AddressSchema.index({ lastUsedAt: -1 });
