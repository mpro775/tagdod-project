import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
export type ProductDocument = HydratedDocument<Product>;
@Schema({ timestamps: true })
export class Product {
  @Prop({ type: Types.ObjectId, ref: 'Category', index: true }) categoryId!: string;
  @Prop({ required: true }) name!: string;
  @Prop({ required: true, unique: true }) slug!: string;
  @Prop() description?: string;
  @Prop() brandId?: string;
  @Prop({ default: 0 }) adminRating!: number;
  @Prop({ type: [String], default: [] }) tags!: string[];
  @Prop({ default: false }) isFeatured!: boolean;
  @Prop({ default: false }) isNew!: boolean;
  @Prop({ default: 'Active' }) status!: 'Active'|'Hidden';

  @Prop({ type: [{ url: String, sort: Number }], default: [] })
  images!: Array<{ url: string; sort: number }>;

  @Prop({ type: [{ name: String, value: String }], default: [] })
  specs!: Array<{ name: string; value: string }>;
}
export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ categoryId: 1, status: 1 });
ProductSchema.index({ isFeatured: 1, isNew: 1, adminRating: -1 });
