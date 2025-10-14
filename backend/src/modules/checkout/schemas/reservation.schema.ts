import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ReservationDocument = HydratedDocument<Reservation>;

@Schema({ timestamps: true })
export class Reservation {
  @Prop({ type: Types.ObjectId, ref: 'Variant', index: true })
  variantId!: string;

  @Prop({ type: Types.ObjectId, ref: 'Order', index: true })
  orderId!: string;

  @Prop({ required: true, min: 1 })
  qty!: number;

  @Prop({ required: true, index: true })
  expiresAt!: Date;

  @Prop({ default: 'ACTIVE', index: true })
  status!: 'ACTIVE' | 'CANCELLED' | 'COMMITTED';
}
export const ReservationSchema = SchemaFactory.createForClass(Reservation);
// TTL index for auto-expiry (deletes docs); needs worker to adjust inventory if relied upon.
ReservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
