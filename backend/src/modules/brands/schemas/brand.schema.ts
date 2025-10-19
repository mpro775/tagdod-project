import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BrandDocument = HydratedDocument<Brand>;

@Schema({ timestamps: true })
export class Brand {
  @Prop({ required: true, trim: true })
  name!: string; // الاسم بالعربية

  @Prop({ required: true, trim: true })
  nameEn!: string; // الاسم بالإنجليزية

  @Prop({ required: true, unique: true })
  slug!: string;

  @Prop({ required: true })
  image!: string;

  @Prop({ default: '' })
  description?: string; // الوصف بالعربية

  @Prop({ default: '' })
  descriptionEn?: string; // الوصف بالإنجليزية

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: 0 })
  sortOrder!: number;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, unknown>;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);

// Indexes
BrandSchema.index({ slug: 1 });
BrandSchema.index({ name: 1 });
BrandSchema.index({ nameEn: 1 });
BrandSchema.index({ isActive: 1, sortOrder: 1 });
BrandSchema.index({ name: 'text', nameEn: 'text', description: 'text', descriptionEn: 'text' });

