import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SupportMessageDocument = HydratedDocument<SupportMessage>;

export enum MessageType {
  USER_MESSAGE = 'user_message',
  ADMIN_REPLY = 'admin_reply',
  SYSTEM_MESSAGE = 'system_message',
}

@Schema({ timestamps: true })
export class SupportMessage {
  @Prop({ type: Types.ObjectId, ref: 'SupportTicket', required: true, index: true })
  ticketId!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId!: string;

  @Prop({
    type: String,
    enum: MessageType,
    required: true,
    index: true
  })
  messageType!: MessageType;

  @Prop({ required: true })
  content!: string;

  @Prop({ type: [String], default: [] })
  attachments!: string[]; // URLs to uploaded files

  @Prop({ default: false })
  isInternal!: boolean; // For admin-only messages

  /** تاريخ قراءة الرسالة من الأدمن (لحساب غير المقروءة في لوحة التحكم) */
  @Prop({ type: Date, default: null })
  readByAdminAt?: Date | null;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, unknown>;
}

export const SupportMessageSchema = SchemaFactory.createForClass(SupportMessage);

// Indexes for better query performance
SupportMessageSchema.index({ ticketId: 1, createdAt: 1 });
SupportMessageSchema.index({ senderId: 1, createdAt: -1 });
