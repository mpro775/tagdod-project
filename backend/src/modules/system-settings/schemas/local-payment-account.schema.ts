import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LocalPaymentAccountDocument = LocalPaymentAccount & Document;

export enum PaymentAccountType {
  BANK = 'bank',
  WALLET = 'wallet',
}

export enum PaymentAccountNumberingMode {
  SHARED = 'shared',
  PER_CURRENCY = 'per_currency',
}

@Schema({ _id: true })
export class ProviderCurrencyAccount {
  @Prop({
    required: true,
    enum: ['YER', 'SAR', 'USD'],
  })
  currency!: string;

  @Prop({ required: true })
  accountNumber!: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: 0 })
  displayOrder!: number;

  @Prop()
  notes?: string;
}

export const ProviderCurrencyAccountSchema =
  SchemaFactory.createForClass(ProviderCurrencyAccount);

@Schema({ timestamps: true })
export class LocalPaymentAccount {
  @Prop({ required: true, index: true, unique: true })
  providerName!: string; // اسم البنك/المحفظة (مثل: الكريمي، M-pesa، إلخ)

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  iconMediaId?: Types.ObjectId | string; // مرجع إلى الوسائط (الأيقونة)

  @Prop({ required: true, enum: PaymentAccountType })
  type!: PaymentAccountType; // bank أو wallet

  @Prop({ required: true, enum: PaymentAccountNumberingMode })
  numberingMode!: PaymentAccountNumberingMode;

  @Prop({ type: [String], enum: ['YER', 'SAR', 'USD'], default: [] })
  supportedCurrencies!: string[];

  @Prop()
  sharedAccountNumber?: string;

  @Prop({ type: [ProviderCurrencyAccountSchema], default: [] })
  accounts!: ProviderCurrencyAccount[];

  @Prop({ default: true })
  isActive!: boolean; // هل المزوّد مفعل

  @Prop()
  notes?: string; // ملاحظات إضافية

  @Prop({ default: 0 })
  displayOrder!: number; // ترتيب العرض (للبنك نفسه)

  @Prop()
  updatedBy?: string; // آخر من قام بالتحديث
}

export const LocalPaymentAccountSchema =
  SchemaFactory.createForClass(LocalPaymentAccount);

// Indexes للأداء
LocalPaymentAccountSchema.index({ providerName: 1 }, { unique: true });
LocalPaymentAccountSchema.index({ providerName: 1, numberingMode: 1 });
LocalPaymentAccountSchema.index({ isActive: 1, displayOrder: 1 });
LocalPaymentAccountSchema.index({ providerName: 1, 'accounts.currency': 1 });

