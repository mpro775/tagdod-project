import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SupportTicketDocument = HydratedDocument<SupportTicket>;

export enum SupportCategory {
  TECHNICAL = 'technical',
  BILLING = 'billing',
  PRODUCTS = 'products',
  SERVICES = 'services',
  ACCOUNT = 'account',
  OTHER = 'other',
}

export enum SupportPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum SupportStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  WAITING_FOR_USER = 'waiting_for_user',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

@Schema({ timestamps: true })
export class SupportTicket {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({
    type: String,
    enum: SupportCategory,
    default: SupportCategory.OTHER,
    index: true
  })
  category!: SupportCategory;

  @Prop({
    type: String,
    enum: SupportPriority,
    default: SupportPriority.MEDIUM,
    index: true
  })
  priority!: SupportPriority;

  @Prop({
    type: String,
    enum: SupportStatus,
    default: SupportStatus.OPEN,
    index: true
  })
  status!: SupportStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  assignedTo!: string | null;

  @Prop({ type: [String], default: [] })
  attachments!: string[]; // URLs to uploaded files

  @Prop({ type: [String], default: [] })
  tags!: string[]; // وسوم للتصنيف

  @Prop({ default: false })
  isArchived!: boolean;

  // Timing
  @Prop()
  firstResponseAt?: Date; // أول رد من الدعم

  @Prop()
  lastMessageAt?: Date; // تاريخ آخر رسالة (لترتيب التذاكر حسب آخر نشاط)

  @Prop()
  resolvedAt?: Date;

  @Prop()
  closedAt?: Date;

  // SLA Tracking
  @Prop({ default: 24 }) // 24 hours default
  slaHours!: number; // الوقت المتوقع للحل

  @Prop()
  slaDueDate?: Date; // تاريخ انتهاء SLA

  @Prop({ default: false })
  slaBreached!: boolean; // هل تم تجاوز SLA

  // Rating & Feedback
  @Prop({ min: 1, max: 5 })
  rating?: number; // تقييم العميل (1-5)

  @Prop()
  feedback?: string; // ملاحظات العميل

  @Prop()
  feedbackAt?: Date; // متى تم التقييم

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, unknown>; // Additional data like orderId, productId, etc.
}

export const SupportTicketSchema = SchemaFactory.createForClass(SupportTicket);

// Indexes for better query performance
SupportTicketSchema.index({ userId: 1, createdAt: -1 });
SupportTicketSchema.index({ status: 1, priority: 1, createdAt: -1 });
SupportTicketSchema.index({ lastMessageAt: -1 });
SupportTicketSchema.index({ assignedTo: 1, status: 1 });
SupportTicketSchema.index({ category: 1, status: 1 });
SupportTicketSchema.index({ title: 'text', description: 'text' });
