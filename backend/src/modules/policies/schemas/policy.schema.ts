import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PolicyDocument = HydratedDocument<Policy>;

export enum PolicyType {
  TERMS = 'terms',
  PRIVACY = 'privacy',
}

@Schema({ timestamps: true })
export class Policy {
  @Prop({
    required: true,
    unique: true,
    enum: Object.values(PolicyType),
    index: true,
  })
  type!: PolicyType;

  @Prop({ required: true })
  titleAr!: string;

  @Prop({ required: true })
  titleEn!: string;

  @Prop({ required: true, type: String })
  contentAr!: string;

  @Prop({ required: true, type: String })
  contentEn!: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ index: true })
  lastUpdatedBy!: string;
}

export const PolicySchema = SchemaFactory.createForClass(Policy);

// Performance indexes
PolicySchema.index({ type: 1, isActive: 1 });
PolicySchema.index({ lastUpdatedBy: 1 });
