import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum ExchangeRateSyncJobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum ExchangeRateSyncJobReason {
  RATE_UPDATE = 'rate_update',
  MANUAL = 'manual',
}

export type ExchangeRateSyncJobError = {
  productId?: string;
  variantId?: string;
  message: string;
  occurredAt: Date;
};

@Schema({ timestamps: true, collection: 'exchange_rate_sync_jobs', versionKey: false })
export class ExchangeRateSyncJob {
  @Prop({
    type: String,
    enum: Object.values(ExchangeRateSyncJobStatus),
    default: ExchangeRateSyncJobStatus.PENDING,
  })
  status!: ExchangeRateSyncJobStatus;

  @Prop({
    type: String,
    enum: Object.values(ExchangeRateSyncJobReason),
    default: ExchangeRateSyncJobReason.RATE_UPDATE,
  })
  reason!: ExchangeRateSyncJobReason;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  triggeredBy?: Types.ObjectId;

  @Prop({ type: String })
  exchangeRateVersion?: string;

  @Prop({ type: Number, default: 0 })
  totalProducts!: number;

  @Prop({ type: Number, default: 0 })
  processedProducts!: number;

  @Prop({ type: Number, default: 0 })
  processedVariants!: number;

  @Prop({ type: Number, default: 0 })
  failedProducts!: number;

  @Prop({ type: Number, default: 0 })
  failedVariants!: number;

  @Prop({ type: String })
  lastProcessedProductId?: string;

  @Prop({ type: Date })
  startedAt?: Date;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({ type: Date })
  failedAt?: Date;

  @Prop({ type: Date, default: Date.now })
  enqueuedAt!: Date;

  @Prop({
    type: [
      {
        productId: { type: String },
        variantId: { type: String },
        message: { type: String, required: true },
        occurredAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  errors!: ExchangeRateSyncJobError[];
}

export type ExchangeRateSyncJobDocument = HydratedDocument<ExchangeRateSyncJob>;

export const ExchangeRateSyncJobSchema = SchemaFactory.createForClass(ExchangeRateSyncJob);

ExchangeRateSyncJobSchema.index({ status: 1, createdAt: -1 });

