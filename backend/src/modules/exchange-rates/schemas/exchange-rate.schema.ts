import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
export type ExchangeRateDocument = ExchangeRate & Document;

@Schema({ timestamps: true })
export class ExchangeRate {
  @Prop({ required: true })
  fromCurrency!: string; // العملة الأساسية (مثل USD)

  @Prop({ required: true })
  toCurrency!: string; // العملة المستهدفة (مثل SAR)

  @Prop({ required: true })
  rate!: number; // سعر الصرف

  @Prop({ required: true })
  baseRate!: number; // السعر الأساسي (1 USD = baseRate SAR)

  @Prop()
  buyRate?: number; // سعر الشراء

  @Prop()
  sellRate?: number; // سعر البيع

  @Prop()
  spread?: number; // الفرق بين سعر الشراء والبيع

  @Prop({ 
    enum: ['manual', 'automatic', 'api'],
    default: 'manual'
  })
  source!: string; // مصدر السعر

  @Prop()
  apiProvider?: string; // مزود API (إذا كان مصدره API)

  @Prop()
  lastUpdatedBy?: string; // آخر من قام بالتحديث

  @Prop()
  lastUpdatedAt?: Date; // وقت آخر تحديث

  @Prop({ default: true })
  isActive!: boolean; // هل السعر نشط

  @Prop()
  effectiveDate?: Date; // تاريخ بدء السريان

  @Prop()
  expiryDate?: Date; // تاريخ انتهاء السريان

  @Prop()
  notes?: string; // ملاحظات

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  metadata?: Record<string, unknown>;
  @Prop()
  createdAt!: Date;

  @Prop()
  updatedAt!: Date;
}

export const ExchangeRateSchema = SchemaFactory.createForClass(ExchangeRate);

// Indexes
ExchangeRateSchema.index({ fromCurrency: 1, toCurrency: 1, isActive: 1 });
ExchangeRateSchema.index({ source: 1, isActive: 1 });
ExchangeRateSchema.index({ lastUpdatedAt: -1 });
ExchangeRateSchema.index({ effectiveDate: 1, expiryDate: 1 });
ExchangeRateSchema.index({ fromCurrency: 1, toCurrency: 1, effectiveDate: 1 });