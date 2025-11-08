import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LocalPaymentAccountDocument = LocalPaymentAccount & Document;

export enum PaymentAccountType {
  BANK = 'bank',
  WALLET = 'wallet',
}

@Schema({ timestamps: true })
export class LocalPaymentAccount {
  @Prop({ required: true, index: true })
  providerName!: string; // اسم البنك/المحفظة (مثل: الكريمي، M-pesa، إلخ)

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  iconMediaId?: Types.ObjectId | string; // مرجع إلى الوسائط (الأيقونة)

  @Prop({ required: true })
  accountNumber!: string; // رقم الحساب الخاص بهذا الحساب

  @Prop({ required: true, enum: PaymentAccountType })
  type!: PaymentAccountType; // bank أو wallet

  @Prop({ 
    required: true,
    enum: ['YER', 'SAR', 'USD'],
    index: true
  })
  currency!: string; // العملة الخاصة بهذا الحساب فقط

  @Prop({ default: true })
  isActive!: boolean; // هل الحساب مفعل

  @Prop()
  notes?: string; // ملاحظات إضافية

  @Prop({ default: 0 })
  displayOrder!: number; // ترتيب العرض (للبنك نفسه)

  @Prop()
  updatedBy?: string; // آخر من قام بالتحديث
}

export const LocalPaymentAccountSchema = SchemaFactory.createForClass(LocalPaymentAccount);

// Indexes للأداء
LocalPaymentAccountSchema.index({ providerName: 1, currency: 1 });
LocalPaymentAccountSchema.index({ providerName: 1, isActive: 1 });
LocalPaymentAccountSchema.index({ isActive: 1, currency: 1 });

