import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ContactRequestDocument = HydratedDocument<ContactRequest>;

export enum ContactRequestType {
  GENERAL = 'general',
  TECHNICAL_SUPPORT = 'technical_support',
  SERVICE_CENTER = 'service_center',
  MAINTENANCE = 'maintenance',
  CONTRACTING = 'contracting',
  PARTNERSHIP = 'partnership',
  OTHER = 'other',
}

export enum ContactRequestSource {
  LANDING_PAGE = 'landing_page',
  WEBSITE = 'website',
  MOBILE_APP = 'mobile_app',
  ADMIN = 'admin',
}

export enum ContactRequestStatus {
  NEW = 'new',
  IN_REVIEW = 'in_review',
  CONTACTED = 'contacted',
  CONVERTED = 'converted',
  CLOSED = 'closed',
}

@Schema({ timestamps: true })
export class ContactRequest {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  phone!: string;

  @Prop()
  email?: string;

  @Prop()
  city?: string;

  @Prop({ type: String, enum: Object.values(ContactRequestType), default: ContactRequestType.GENERAL })
  requestType!: ContactRequestType;

  @Prop()
  subject?: string;

  @Prop({ required: true })
  message!: string;

  @Prop({ type: String, enum: Object.values(ContactRequestSource), default: ContactRequestSource.LANDING_PAGE })
  source!: ContactRequestSource;

  @Prop({ type: String, enum: Object.values(ContactRequestStatus), default: ContactRequestStatus.NEW })
  status!: ContactRequestStatus;

  @Prop()
  assignedTo?: string;

  @Prop()
  notes?: string;
}

export const ContactRequestSchema = SchemaFactory.createForClass(ContactRequest);

ContactRequestSchema.index({ status: 1 });
ContactRequestSchema.index({ requestType: 1 });
ContactRequestSchema.index({ source: 1 });
ContactRequestSchema.index({ createdAt: -1 });
ContactRequestSchema.index({ phone: 1 });
ContactRequestSchema.index({ email: 1 });
