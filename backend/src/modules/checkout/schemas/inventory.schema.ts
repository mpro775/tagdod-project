import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type InventoryDocument = HydratedDocument<Inventory>;

@Schema({ timestamps: true })
export class Inventory {
  @Prop({ type: Types.ObjectId, ref: 'Variant', unique: true, index: true })
  variantId!: string;

  @Prop({ default: 0 }) on_hand!: number;
  @Prop({ default: 0 }) reserved!: number;
  @Prop({ default: 0 }) safety_stock!: number;
}
export const InventorySchema = SchemaFactory.createForClass(Inventory);
