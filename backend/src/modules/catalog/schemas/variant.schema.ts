import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
export type VariantDocument = HydratedDocument<Variant>;
@Schema({ timestamps: true })
export class Variant {
  @Prop({ type: Types.ObjectId, ref: 'Product', index: true }) productId!: string;
  @Prop({ required: true, unique: true }) sku!: string;
  @Prop({ type: Object, default: {} }) attributes!: Record<string, string>; // { 'أمبير': '10A', 'لون': 'أبيض' }
  @Prop() barcode?: string;
  @Prop({ default: 'Active' }) status!: 'Active'|'Hidden';
  @Prop({ type: [{ url: String, sort: Number }], default: [] })
  images!: Array<{ url: string; sort: number }>;
}
export const VariantSchema = SchemaFactory.createForClass(Variant);
VariantSchema.index({ productId: 1, status: 1 });
