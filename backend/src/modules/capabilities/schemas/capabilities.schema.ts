import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
export type CapabilitiesDocument = HydratedDocument<Capabilities>;
@Schema({ timestamps: true })
export class Capabilities {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true, unique: true })
  userId!: string;
  @Prop({ default: true }) customer_capable!: boolean;
  @Prop({ default: false }) engineer_capable!: boolean;
  @Prop({ default: 'none' }) engineer_status!: string; // none|unverified|pending|approved|rejected
  @Prop({ default: false }) merchant_capable!: boolean;
  @Prop({ default: 'none' }) merchant_status!: string; // none|unverified|pending|approved|rejected
  @Prop({ default: 0, min: 0, max: 100 }) merchant_discount_percent!: number; // خصم التاجر بالنسبة المئوية
  @Prop({ default: false }) admin_capable!: boolean;
  @Prop({ default: 'none' }) admin_status!: string; // none|pending|approved|rejected
}
export const CapabilitiesSchema = SchemaFactory.createForClass(Capabilities);
