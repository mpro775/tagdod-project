import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SystemLogDocument = SystemLog & Document;

@Schema({ timestamps: true })
export class SystemLog {
  @Prop({ required: true, index: true })
  level: string; // info, debug, warn, error

  @Prop({ required: true })
  message: string;

  @Prop({ index: true })
  context: string; // Module or service name

  @Prop({ type: Object })
  data: Record<string, any>;

  @Prop({ default: Date.now, index: true })
  timestamp: Date;

  @Prop()
  userId: string;

  @Prop()
  requestId: string;

  @Prop()
  correlationId: string;
}

export const SystemLogSchema = SchemaFactory.createForClass(SystemLog);

// Create indexes
SystemLogSchema.index({ level: 1, timestamp: -1 });
SystemLogSchema.index({ context: 1, timestamp: -1 });
SystemLogSchema.index({ timestamp: -1 });

// TTL index - automatically delete logs older than 90 days
SystemLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

