import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type InventoryLedgerDocument = HydratedDocument<InventoryLedger>;

@Schema({ timestamps: true })
export class InventoryLedger {
  @Prop({ type: Types.ObjectId, ref: 'Variant', index: true })
  variantId?: string;

  @Prop({ type: Types.ObjectId, ref: 'Product', index: true })
  productId?: string;

  @Prop({ required: true }) change!: number; // -qty or +qty
  @Prop({ required: true }) reason!: string; // ORDER_CONFIRMED_OUT / ORDER_CANCELLED_RELEASE / ADJUSTMENT...
  @Prop() refId?: string;
}
export const InventoryLedgerSchema = SchemaFactory.createForClass(InventoryLedger);
