import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type UserDocument = HydratedDocument<User>;

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  MODERATOR = 'moderator',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  phone!: string;

  @Prop() firstName?: string;
  @Prop() lastName?: string;
  @Prop() gender?: 'male'|'female'|'other';
  @Prop() jobTitle?: string; // المسمى الوظيفي للمهندس
  @Prop() passwordHash?: string;
  
  // نظام الصلاحيات الجديد
  @Prop({ default: false }) isAdmin!: boolean; // للتوافق مع الكود القديم
  @Prop({ type: [String], default: ['user'] }) roles!: UserRole[]; // الأدوار
  @Prop({ type: [String], default: [] }) permissions!: string[]; // الصلاحيات المخصصة
  
  // حالة الحساب
  @Prop({ type: String, enum: Object.values(UserStatus), default: UserStatus.ACTIVE })
  status!: UserStatus;
  
  // Soft Delete
  @Prop({ type: Date, default: null }) deletedAt?: Date | null;
  @Prop() deletedBy?: string; // userId of admin who deleted
  @Prop() suspendedReason?: string; // سبب الإيقاف
  @Prop() suspendedBy?: string; // userId of admin who suspended
  @Prop({ type: Date }) suspendedAt?: Date;
}
export const UserSchema = SchemaFactory.createForClass(User);

// Performance indexes
UserSchema.index({ phone: 1 });
UserSchema.index({ isAdmin: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ phone: 1, isAdmin: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ deletedAt: 1 });
UserSchema.index({ roles: 1 });
UserSchema.index({ status: 1, deletedAt: 1, createdAt: -1 });
