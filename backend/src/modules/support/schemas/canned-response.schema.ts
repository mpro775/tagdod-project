import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { SupportCategory } from './support-ticket.schema';

export type CannedResponseDocument = HydratedDocument<CannedResponse>;

@Schema({ timestamps: true })
export class CannedResponse {
  @Prop({ required: true })
  title!: string; // عنوان الرد

  @Prop({ required: true })
  content!: string; // محتوى الرد

  @Prop({ required: true })
  contentEn!: string; // محتوى بالإنجليزية

  @Prop({ type: String, enum: SupportCategory })
  category?: SupportCategory; // فئة اختيارية

  @Prop({ type: [String], default: [] })
  tags!: string[]; // وسوم للبحث

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: 0 })
  usageCount!: number; // عدد مرات الاستخدام

  @Prop()
  shortcut?: string; // اختصار للوصول السريع (مثل: /welcome)

  createdAt?: Date;
  updatedAt?: Date;
}

export const CannedResponseSchema = SchemaFactory.createForClass(CannedResponse);

// Indexes
CannedResponseSchema.index({ title: 'text', content: 'text', tags: 'text' });
CannedResponseSchema.index({ category: 1, isActive: 1 });
CannedResponseSchema.index({ shortcut: 1 }, { unique: true, sparse: true });

