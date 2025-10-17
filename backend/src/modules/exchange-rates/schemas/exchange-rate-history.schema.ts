import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ExchangeRateHistoryDocument = ExchangeRateHistory & Document;

@Schema({ timestamps: true })
export class ExchangeRateHistory {
  @Prop({ required: true })
  fromCurrency!: string;

  @Prop({ required: true })
  toCurrency!: string;

  @Prop({ required: true })
  oldRate!: number; // السعر القديم

  @Prop({ required: true })
  newRate!: number; // السعر الجديد

  @Prop({ required: true })
  changeAmount!: number; // مقدار التغيير

  @Prop({ required: true })
  changePercentage!: number; // نسبة التغيير

  @Prop({ 
    enum: ['increase', 'decrease', 'no_change'],
    required: true
  })
  changeType!: string; // نوع التغيير

  @Prop({ required: true })
  updatedBy!: string; // من قام بالتحديث

  @Prop()
  reason?: string; // سبب التغيير

  @Prop()
  source!: string; // مصدر التغيير

  @Prop()
  apiProvider?: string; // مزود API

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  metadata?: Record<string, unknown>;

  @Prop()
  createdAt!: Date;

  @Prop()
  updatedAt!: Date;
}

export const ExchangeRateHistorySchema = SchemaFactory.createForClass(ExchangeRateHistory);

// Indexes
ExchangeRateHistorySchema.index({ fromCurrency: 1, toCurrency: 1, createdAt: -1 });
ExchangeRateHistorySchema.index({ updatedBy: 1, createdAt: -1 });
ExchangeRateHistorySchema.index({ changeType: 1, createdAt: -1 });
ExchangeRateHistorySchema.index({ source: 1, createdAt: -1 });
