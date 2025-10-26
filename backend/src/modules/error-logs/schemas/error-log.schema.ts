import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ErrorLogDocument = ErrorLog & Document;

@Schema({ timestamps: true })
export class ErrorLog {
  @Prop({ required: true, enum: ['error', 'warn', 'fatal', 'debug'], index: true })
  level!: string;

  @Prop({ 
    required: true, 
    enum: ['database', 'api', 'authentication', 'validation', 'business_logic', 'external_service', 'system', 'unknown'],
    index: true 
  })
  category!: string;

  @Prop({ required: true, text: true })
  message!: string;

  @Prop({ type: String })
  stack!: string;

  @Prop({ type: Object })
  metadata!: Record<string, unknown>;

  @Prop({ index: true })
  userId!: string;

  @Prop({ index: true })
  endpoint!: string;

  @Prop()
  method!: string;

  @Prop()
  statusCode!: number;

  @Prop({ default: 1 })
  occurrences!: number;

  @Prop({ default: Date.now, index: true })
  firstOccurrence!: Date;

  @Prop({ default: Date.now, index: true })
  lastOccurrence!: Date;

  @Prop({ default: false, index: true })
  resolved!: boolean;

  @Prop()
  resolvedAt!: Date;

  @Prop()
  resolvedBy!: string;

  @Prop()
  notes!: string;

  // Create a hash for deduplication
  @Prop({ index: true })
  hash!: string;

  // Timestamps (added automatically by { timestamps: true })
  createdAt!: Date;
  updatedAt!: Date;
}

export const ErrorLogSchema = SchemaFactory.createForClass(ErrorLog);

// Create compound indexes
ErrorLogSchema.index({ level: 1, category: 1 });
ErrorLogSchema.index({ createdAt: -1 });
ErrorLogSchema.index({ resolved: 1, createdAt: -1 });
ErrorLogSchema.index({ hash: 1 });

// TTL index - automatically delete logs older than 180 days (6 months)
ErrorLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 });

// Text index for full-text search
ErrorLogSchema.index({ message: 'text', stack: 'text' });

