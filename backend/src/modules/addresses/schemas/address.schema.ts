import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AddressDocument = HydratedDocument<Address>;

export enum AddressType {
  HOME = 'home',
  WORK = 'work',
  OTHER = 'other',
}

@Schema({ timestamps: true })
export class Address {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  label!: string; // مثل: المنزل، المكتب، عند أمي

  @Prop({ type: String, enum: Object.values(AddressType), default: AddressType.HOME })
  addressType!: AddressType;

  @Prop({ required: true, trim: true })
  recipientName!: string; // اسم المستلم

  @Prop({ required: true, trim: true })
  recipientPhone!: string; // رقم المستلم

  @Prop({ required: true, trim: true })
  line1!: string; // العنوان الرئيسي (الشارع، رقم المبنى)

  @Prop({ trim: true })
  line2?: string; // تفاصيل إضافية (رقم الشقة، الدور)

  @Prop({ required: true, trim: true })
  city!: string; // المدينة

  @Prop({ trim: true })
  region?: string; // المنطقة/الحي

  @Prop({ default: 'Yemen', trim: true })
  country!: string; // الدولة

  @Prop({ trim: true })
  postalCode?: string; // الرمز البريدي

  @Prop({ type: Object })
  coords?: { lat: number; lng: number }; // الإحداثيات

  @Prop({ trim: true })
  notes?: string; // ملاحظات/تعليمات التسليم

  @Prop({ default: false })
  isDefault!: boolean; // العنوان الافتراضي

  @Prop({ default: true })
  isActive!: boolean; // فعّال أم لا

  @Prop({ trim: true })
  placeId?: string; // Google PlaceId

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
AddressSchema.index({ userId: 1, addressType: 1 });
AddressSchema.index({ city: 1, region: 1 });
AddressSchema.index({ coords: '2dsphere' }, { sparse: true });
AddressSchema.index({ placeId: 1 }, { sparse: true });
AddressSchema.index({ lastUsedAt: -1 });
