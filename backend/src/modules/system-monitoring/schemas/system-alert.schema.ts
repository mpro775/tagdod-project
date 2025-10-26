import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SystemAlertDocument = SystemAlert & Document;

@Schema({ timestamps: true })
export class SystemAlert {
  @Prop({ required: true, enum: ['warning', 'critical', 'info'], index: true })
  type: string;

  @Prop({ required: true, index: true })
  category: string; // cpu, memory, disk, database, redis, api

  @Prop({ required: true })
  message: string;

  @Prop()
  details: string;

  @Prop({ type: Object })
  metadata: Record<string, any>;

  @Prop({ default: false, index: true })
  resolved: boolean;

  @Prop()
  resolvedAt: Date;

  @Prop()
  resolvedBy: string;

  @Prop({ default: Date.now, index: true })
  timestamp: Date;
}

export const SystemAlertSchema = SchemaFactory.createForClass(SystemAlert);

// Create indexes
SystemAlertSchema.index({ type: 1, resolved: 1 });
SystemAlertSchema.index({ category: 1, timestamp: -1 });
SystemAlertSchema.index({ resolved: 1, timestamp: -1 });

