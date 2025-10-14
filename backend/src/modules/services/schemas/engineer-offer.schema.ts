import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EngineerOfferDocument = HydratedDocument<EngineerOffer>;

@Schema({ timestamps: true })
export class EngineerOffer {
  @Prop({ type: Types.ObjectId, ref: 'ServiceRequest', index: true })
  requestId!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  engineerId!: string;

  @Prop({ required: true }) amount!: number;
  @Prop() note?: string;

  // المسافة بين المهندس والطلب (بالكيلومتر)
  @Prop() distanceKm?: number;

  @Prop({ default: 'OFFERED', index: true })
  status!: 'OFFERED' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
}
export const EngineerOfferSchema = SchemaFactory.createForClass(EngineerOffer);
EngineerOfferSchema.index({ requestId: 1, engineerId: 1 }, { unique: true });
