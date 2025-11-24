import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ServiceRequestDocument = HydratedDocument<ServiceRequest>;

@Schema({ _id: false })
export class GeoPoint {
  @Prop({ type: String, enum: ['Point'], default: 'Point' })
  type!: 'Point';

  @Prop({ type: [Number], default: [0, 0] })
  coordinates!: [number, number];
}
export const GeoPointSchema = SchemaFactory.createForClass(GeoPoint);

@Schema({ _id: false })
export class ServiceRating {
  @Prop() score?: number; // 1..5
  @Prop() comment?: string;
  @Prop() at?: Date;
}
export const ServiceRatingSchema = SchemaFactory.createForClass(ServiceRating);

@Schema({ timestamps: true })
export class ServiceRequest {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  userId!: string;

  @Prop({ required: true }) title!: string;
  @Prop() type?: string;
  @Prop() description?: string;
  @Prop({ type: [String], default: [] }) images!: string[];

  // معلومات الموقع
  @Prop({ required: true, default: 'صنعاء', index: true }) city!: string; // المدينة اليمنية
  @Prop({ type: Types.ObjectId, ref: 'Address' }) addressId?: string;

  // GeoJSON for nearby
  @Prop({ type: GeoPointSchema })
  location!: GeoPoint; // [lng, lat]

  @Prop({
    default: 'OPEN',
    enum: ['OPEN', 'OFFERS_COLLECTING', 'ASSIGNED', 'COMPLETED', 'RATED', 'CANCELLED'],
    index: true,
  })
  status!: 'OPEN' | 'OFFERS_COLLECTING' | 'ASSIGNED' | 'COMPLETED' | 'RATED' | 'CANCELLED';

  @Prop() scheduledAt?: Date;

  // After acceptance
  @Prop({ type: Types.ObjectId, ref: 'User', index: true, default: null })
  engineerId!: string | null;

  @Prop({ type: Object, default: null })
  acceptedOffer?: { offerId: string; amount: number; note?: string };

  @Prop({ type: ServiceRatingSchema, default: {} })
  rating?: ServiceRating;

  @Prop({ type: [{ note: String, at: Date }], default: [] })
  adminNotes?: Array<{ note: string; at: Date }>;

  // Cancellation fields
  @Prop() cancellationReason?: string;
  @Prop() cancelledAt?: Date;
}
export const ServiceRequestSchema = SchemaFactory.createForClass(ServiceRequest);

// Performance indexes
ServiceRequestSchema.index({ location: '2dsphere' });
ServiceRequestSchema.index({ title: 'text', description: 'text', type: 'text' });
ServiceRequestSchema.index({ userId: 1, status: 1, createdAt: -1 });
ServiceRequestSchema.index({ engineerId: 1, status: 1, createdAt: -1 });
ServiceRequestSchema.index({ status: 1, createdAt: -1 });
ServiceRequestSchema.index({ city: 1, status: 1 }); // فهرس للمدينة والحالة
ServiceRequestSchema.index({ city: 1, createdAt: -1 }); // فهرس للمدينة والتاريخ
ServiceRequestSchema.index({ scheduledAt: 1 }, { sparse: true });
ServiceRequestSchema.index({ 'rating.score': 1 }, { sparse: true });
