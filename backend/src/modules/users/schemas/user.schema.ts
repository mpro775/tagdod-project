import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum Currency {
  USD = 'USD',
  YER = 'YER', // الريال اليمني
  SAR = 'SAR', // الريال السعودي
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
  DELETED = 'deleted', // حالة محذوف منفصلة
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  MERCHANT = 'merchant',
  ENGINEER = 'engineer',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  phone!: string;

  @Prop() firstName?: string;
  @Prop() lastName?: string;
  @Prop() gender?: 'male' | 'female' | 'other';
  @Prop() jobTitle?: string; // المسمى الوظيفي للمهندس
  @Prop() passwordHash?: string;

  // نظام الصلاحيات الموحد
  @Prop({ type: [String], default: ['user'] }) roles!: UserRole[]; // الأدوار
  @Prop({ type: [String], default: [] }) permissions!: string[]; // الصلاحيات المخصصة

  // حالة الحساب
  @Prop({ type: String, enum: Object.values(UserStatus), default: UserStatus.ACTIVE })
  status!: UserStatus;

  // العملة المفضلة
  @Prop({ type: String, enum: Object.values(Currency), default: Currency.USD })
  preferredCurrency!: Currency;

  // تتبع النشاط
  @Prop({ type: Date, default: Date.now })
  lastActivityAt!: Date;

  // Soft Delete
  @Prop({ type: Date, default: null }) deletedAt?: Date | null;
  @Prop() deletedBy?: string; // userId of admin who deleted
  @Prop() suspendedReason?: string; // سبب الإيقاف
  @Prop() suspendedBy?: string; // userId of admin who suspended
  @Prop({ type: Date }) suspendedAt?: Date;

  // Helper methods
  isAdmin(): boolean {
    return this.roles?.includes(UserRole.ADMIN) || this.roles?.includes(UserRole.SUPER_ADMIN);
  }

  isSuperAdmin(): boolean {
    return this.roles?.includes(UserRole.SUPER_ADMIN);
  }

  hasRole(role: UserRole): boolean {
    return this.roles?.includes(role) || false;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    return roles.some((role) => this.roles?.includes(role));
  }

  hasPermission(permission: string): boolean {
    return this.permissions?.includes(permission) || false;
  }

  isActive(): boolean {
    return this.status === UserStatus.ACTIVE && !this.deletedAt;
  }

  isDeleted(): boolean {
    return this.deletedAt !== null || this.status === UserStatus.DELETED;
  }
}
export const UserSchema = SchemaFactory.createForClass(User);

// Performance indexes
UserSchema.index({ phone: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ status: 1 });
UserSchema.index({ deletedAt: 1 });
UserSchema.index({ roles: 1 });
UserSchema.index({ status: 1, deletedAt: 1, createdAt: -1 });
UserSchema.index({ lastActivityAt: -1 });
UserSchema.index({ status: 1, lastActivityAt: -1 });
UserSchema.index({ roles: 1, status: 1 }); // فهرس محسن للأدوار والحالة
