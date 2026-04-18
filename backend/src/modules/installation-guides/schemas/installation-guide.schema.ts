import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type InstallationGuideDocument = HydratedDocument<InstallationGuide>;

@Schema({ timestamps: true })
export class InstallationGuide {
  @Prop({ required: true, trim: true })
  titleAr!: string;

  @Prop({ required: true, trim: true })
  titleEn!: string;

  @Prop({ required: true, trim: true })
  tagAr!: string;

  @Prop({ required: true, trim: true })
  tagEn!: string;

  @Prop({ required: true, trim: true, type: String })
  descriptionAr!: string;

  @Prop({ required: true, trim: true, type: String })
  descriptionEn!: string;

  @Prop({ type: Types.ObjectId, ref: 'Media', required: true, index: true })
  coverImageId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  videoId!: string;

  @Prop({ type: Types.ObjectId, ref: 'Product', default: null, index: true })
  linkedProductId?: Types.ObjectId | null;

  @Prop({ type: Number, default: 0, index: true })
  sortOrder!: number;

  @Prop({ type: Boolean, default: true, index: true })
  isActive!: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  createdBy!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  lastUpdatedBy!: Types.ObjectId;
}

export const InstallationGuideSchema = SchemaFactory.createForClass(InstallationGuide);

InstallationGuideSchema.index({ isActive: 1, sortOrder: 1, createdAt: -1 });
InstallationGuideSchema.index({
  titleAr: 'text',
  titleEn: 'text',
  tagAr: 'text',
  tagEn: 'text',
});

