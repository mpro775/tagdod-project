import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ExchangeRateDocument = HydratedDocument<ExchangeRate>;

export enum Currency {
  USD = 'USD',
  YER = 'YER', // الريال اليمني
  SAR = 'SAR', // الريال السعودي
}

@Schema({ timestamps: true })
export class ExchangeRate {
  @Prop({ required: true, enum: Currency })
  fromCurrency!: Currency;

  @Prop({ required: true, enum: Currency })
  toCurrency!: Currency;

  @Prop({ required: true, min: 0 })
  rate!: number; // كم وحدة من العملة الهدف تساوي 1 دولار

  @Prop({ default: true })
  isActive!: boolean;

  @Prop()
  effectiveDate?: Date; // تاريخ بدء سريان السعر

  @Prop()
  expiryDate?: Date; // تاريخ انتهاء السعر

  @Prop()
  notes?: string; // ملاحظات إضافية
}

export const ExchangeRateSchema = SchemaFactory.createForClass(ExchangeRate);

// فهرسة للبحث السريع
ExchangeRateSchema.index({ fromCurrency: 1, toCurrency: 1, isActive: 1 });
ExchangeRateSchema.index({ effectiveDate: 1, expiryDate: 1 });
ExchangeRateSchema.index({ createdAt: -1 });
