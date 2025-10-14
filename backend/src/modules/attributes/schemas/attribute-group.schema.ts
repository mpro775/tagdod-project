import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AttributeGroupDocument = HydratedDocument<AttributeGroup>;

@Schema({ timestamps: true })
export class AttributeGroup {
  @Prop({ required: true })
  name!: string; // مثل: "المواصفات العامة"

  @Prop({ required: true, unique: true })
  nameEn!: string;

  @Prop({ required: true, unique: true })
  slug!: string;

  @Prop({ default: '' })
  description?: string;

  @Prop({ default: 0 })
  order!: number;

  @Prop({ default: true })
  isActive!: boolean;
}

export const AttributeGroupSchema = SchemaFactory.createForClass(AttributeGroup);

AttributeGroupSchema.index({ slug: 1 });
AttributeGroupSchema.index({ order: 1 });

