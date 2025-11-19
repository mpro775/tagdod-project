  import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AuditLogDocument = HydratedDocument<AuditLog>;

export enum AuditAction {
  // User Management
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  USER_SUSPENDED = 'user.suspended',
  USER_ACTIVATED = 'user.activated',

  // Authentication & Authorization
  LOGIN_SUCCESS = 'auth.login.success',
  LOGIN_FAILED = 'auth.login.failed',
  LOGOUT = 'auth.logout',
  PASSWORD_CHANGED = 'auth.password.changed',
  PASSWORD_RESET = 'auth.password.reset',

  // Permissions & Roles
  PERMISSION_GRANTED = 'permission.granted',
  PERMISSION_REVOKED = 'permission.revoked',
  ROLE_ASSIGNED = 'role.assigned',
  ROLE_REMOVED = 'role.removed',
  CAPABILITY_APPROVED = 'capability.approved',
  CAPABILITY_REJECTED = 'capability.rejected',

  // Admin Actions
  ADMIN_ACTION = 'admin.action',

  // System Events
  SYSTEM_BACKUP = 'system.backup',
  SYSTEM_MAINTENANCE = 'system.maintenance',
  DATA_MIGRATION = 'system.migration',

  // Orders
  ORDER_CREATED = 'order.created',
  ORDER_CANCELLED = 'order.cancelled',
  ORDER_REFUNDED = 'order.refunded',
  ORDER_STATUS_CHANGED = 'order.status.changed',
  ORDER_UPDATED_BY_ADMIN = 'order.updated.by.admin',

  // Payments
  PAYMENT_INITIATED = 'payment.initiated',
  PAYMENT_COMPLETED = 'payment.completed',
  PAYMENT_FAILED = 'payment.failed',
  PAYMENT_REFUNDED = 'payment.refunded',
  PAYMENT_STATUS_CHANGED = 'payment.status.changed',

  // Coupons
  COUPON_APPLIED = 'coupon.applied',
  COUPON_APPLICATION_FAILED = 'coupon.application.failed',
  COUPON_CREATED = 'coupon.created',
  COUPON_UPDATED = 'coupon.updated',
  COUPON_DELETED = 'coupon.deleted',
  COUPON_ACTIVATED = 'coupon.activated',
  COUPON_DEACTIVATED = 'coupon.deactivated',
}

export enum AuditResource {
  USER = 'user',
  PERMISSION = 'permission',
  ROLE = 'role',
  CAPABILITY = 'capability',
  SYSTEM = 'system',
  AUTH = 'auth',
  ADMIN = 'admin',
  ORDER = 'order',
  PAYMENT = 'payment',
  COUPON = 'coupon',
}

@Schema({ timestamps: true, collection: 'audit_logs' })
export class AuditLog {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId; // المستخدم الذي تمت عليه العملية

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  performedBy?: Types.ObjectId; // المستخدم الذي قام بالعملية

  @Prop({ type: String, enum: Object.values(AuditAction), required: true, index: true })
  action!: AuditAction;

  @Prop({ type: String, enum: Object.values(AuditResource), required: true, index: true })
  resource!: AuditResource;

  @Prop({ type: String, index: true })
  resourceId?: string; // معرف المورد المؤثر عليه

  @Prop({ type: Object })
  oldValues?: unknown; // القيم القديمة قبل التغيير

  @Prop({ type: Object })
  newValues?: unknown; // القيم الجديدة بعد التغيير

  @Prop({ type: Object })
  metadata?: unknown; // بيانات إضافية

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;

  @Prop()
  reason?: string; // سبب العملية

  @Prop({ type: Boolean, default: false })
  isSensitive?: boolean; // هل العملية حساسة

  @Prop({ type: String })
  sessionId?: string;

  @Prop({ type: Date, default: Date.now, index: true })
  timestamp!: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Indexes for performance
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ performedBy: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ resource: 1, timestamp: -1 });
AuditLogSchema.index({ resourceId: 1, timestamp: -1 });
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ isSensitive: 1, timestamp: -1 });
AuditLogSchema.index({ userId: 1, action: 1, timestamp: -1 });
