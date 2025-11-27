import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Currency } from '../../users/schemas/user.schema';

export type EngineerOfferDocument = HydratedDocument<EngineerOffer>;

@Schema({ timestamps: true })
export class EngineerOffer {
  @Prop({ type: Types.ObjectId, ref: 'ServiceRequest', index: true })
  requestId!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  engineerId!: string;

  @Prop({ required: true }) amount!: number;
  @Prop() note?: string;

  // نوع العملة (YER, SAR, USD)
  @Prop({
    type: String,
    enum: Currency,
    default: Currency.YER,
    required: true,
  })
  currency!: Currency;

  // المسافة بين المهندس والطلب (بالكيلومتر)
  @Prop() distanceKm?: number;

  @Prop({
    default: 'OFFERED',
    enum: ['OFFERED', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'OUTBID', 'EXPIRED'],
    index: true,
  })
  status!: 'OFFERED' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'OUTBID' | 'EXPIRED';

  @Prop({ default: 0 })
  updatesCount!: number;
}
export const EngineerOfferSchema = SchemaFactory.createForClass(EngineerOffer);
EngineerOfferSchema.index({ requestId: 1, engineerId: 1 }, { unique: true });
