import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
export type VariantPriceDocument = HydratedDocument<VariantPrice>;
@Schema({ timestamps: true })
export class VariantPrice {
  @Prop({ type: Types.ObjectId, ref: 'Variant', index: true }) variantId!: string;
  @Prop({ required: true }) currency!: string; // YER/SAR/USD
  @Prop({ required: true }) amount!: number;
  @Prop() compareAt?: number;
  @Prop() wholesaleAmount?: number;
  @Prop() moq?: number;
}
export const VariantPriceSchema = SchemaFactory.createForClass(VariantPrice);
VariantPriceSchema.index({ variantId: 1, currency: 1 }, { unique: true });
