import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExchangeRateDocument = ExchangeRate & Document;

@Schema({ timestamps: true })
export class ExchangeRate {
  @Prop({ required: true, default: 1 })
  usdToYer!: number; // 1 دولار = كم ريال يمني

  @Prop({ required: true, default: 3.75 })
  usdToSar!: number; // 1 دولار = كم ريال سعودي

  @Prop()
  lastUpdatedBy?: string; // آخر من قام بالتحديث

  @Prop()
  lastUpdatedAt?: Date; // وقت آخر تحديث

  @Prop()
  notes?: string; // ملاحظات
}

export const ExchangeRateSchema = SchemaFactory.createForClass(ExchangeRate);

// إنشاء index واحد فقط
ExchangeRateSchema.index({ lastUpdatedAt: -1 });
