import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UptimeRecordDocument = UptimeRecord & Document;

/**
 * Schema لتتبع سجلات التشغيل والتوقف
 */
@Schema({ timestamps: true })
export class UptimeRecord {
  @Prop({ required: true, enum: ['startup', 'shutdown', 'crash', 'restart'], index: true })
  eventType!: string; // نوع الحدث

  @Prop({ required: true, default: Date.now, index: true })
  timestamp!: Date; // وقت الحدث

  @Prop({ type: Number })
  duration!: number; // مدة التشغيل (بالثواني) في حالة shutdown

  @Prop({ type: Object })
  metadata!: {
    reason?: string; // سبب التوقف
    version?: string; // إصدار التطبيق
    nodeVersion?: string;
    pid?: number; // Process ID
    hostname?: string;
    platform?: string;
  };

  @Prop({ default: false })
  isPlanned!: boolean; // هل كان التوقف مخطط؟

  // Timestamps (added automatically)
  createdAt!: Date;
  updatedAt!: Date;
}

export const UptimeRecordSchema = SchemaFactory.createForClass(UptimeRecord);

// Create indexes
UptimeRecordSchema.index({ eventType: 1, timestamp: -1 });
UptimeRecordSchema.index({ timestamp: -1 });

// TTL index - keep uptime records for 1 year
UptimeRecordSchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

