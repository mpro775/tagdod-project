import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SystemSettingDocument = SystemSetting & Document;

@Schema({ timestamps: true })
export class SystemSetting {
  @Prop({ required: true, unique: true, index: true })
  key: string;

  @Prop({ type: Object, required: true })
  value: any;

  @Prop({ 
    required: true, 
    enum: ['general', 'email', 'payment', 'shipping', 'security', 'notifications', 'seo', 'advanced'],
    default: 'general',
    index: true 
  })
  category: string;

  @Prop({ default: 'string' })
  type: string; // string, number, boolean, object, array

  @Prop()
  description: string;

  @Prop({ default: false })
  isPublic: boolean; // Whether this setting can be accessed publicly

  @Prop({ index: true })
  updatedBy: string;
}

export const SystemSettingSchema = SchemaFactory.createForClass(SystemSetting);

// Create indexes
SystemSettingSchema.index({ category: 1, key: 1 });
SystemSettingSchema.index({ isPublic: 1 });

