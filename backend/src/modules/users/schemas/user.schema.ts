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

export enum CapabilityStatus {
  NONE = 'none',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
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
  
  // معلومات الموقع
  @Prop({ default: 'صنعاء' }) city?: string; // المدينة (للمهندسين وطلبات الخدمات)

  // نظام الصلاحيات الموحد
  @Prop({ type: [String], default: ['user'] }) roles!: UserRole[]; // الأدوار
  @Prop({ type: [String], default: [] }) permissions!: string[]; // الصلاحيات المخصصة

  // Capabilities - توحيد مع النظام القديم
  @Prop({ default: true }) customer_capable!: boolean;
  @Prop({ default: false }) engineer_capable!: boolean;
  @Prop({ type: String, enum: Object.values(CapabilityStatus), default: CapabilityStatus.NONE })
  engineer_status!: CapabilityStatus;
  @Prop({ default: false }) wholesale_capable!: boolean;
  @Prop({ type: String, enum: Object.values(CapabilityStatus), default: CapabilityStatus.NONE })
  wholesale_status!: CapabilityStatus;
  @Prop({ default: 0, min: 0, max: 100 }) wholesale_discount_percent!: number;
  @Prop({ default: false }) admin_capable!: boolean;
  @Prop({ type: String, enum: Object.values(CapabilityStatus), default: CapabilityStatus.NONE })
  admin_status!: CapabilityStatus;

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

  // Capabilities helper methods
  isCustomer(): boolean {
    return this.customer_capable === true;
  }

  isEngineer(): boolean {
    return this.engineer_capable === true && this.engineer_status === CapabilityStatus.APPROVED;
  }

  isEngineerPending(): boolean {
    return this.engineer_status === CapabilityStatus.PENDING;
  }

  isWholesale(): boolean {
    return this.wholesale_capable === true && this.wholesale_status === CapabilityStatus.APPROVED;
  }

  isWholesalePending(): boolean {
    return this.wholesale_status === CapabilityStatus.PENDING;
  }

  isAdminCapability(): boolean {
    return this.admin_capable === true && this.admin_status === CapabilityStatus.APPROVED;
  }

  isAdminPending(): boolean {
    return this.admin_status === CapabilityStatus.PENDING;
  }

  // Update capability status
  approveEngineer(): void {
    this.engineer_capable = true;
    this.engineer_status = CapabilityStatus.APPROVED;
    if (!this.roles.includes(UserRole.ENGINEER)) {
      this.roles.push(UserRole.ENGINEER);
    }
  }

  rejectEngineer(): void {
    this.engineer_capable = false;
    this.engineer_status = CapabilityStatus.REJECTED;
    this.roles = this.roles.filter(role => role !== UserRole.ENGINEER);
  }

  approveWholesale(discountPercent: number = 0): void {
    this.wholesale_capable = true;
    this.wholesale_status = CapabilityStatus.APPROVED;
    this.wholesale_discount_percent = discountPercent;
    if (!this.roles.includes(UserRole.MERCHANT)) {
      this.roles.push(UserRole.MERCHANT);
    }
  }

  rejectWholesale(): void {
    this.wholesale_capable = false;
    this.wholesale_status = CapabilityStatus.REJECTED;
    this.wholesale_discount_percent = 0;
    this.roles = this.roles.filter(role => role !== UserRole.MERCHANT);
  }

  approveAdmin(): void {
    this.admin_capable = true;
    this.admin_status = CapabilityStatus.APPROVED;
    if (!this.roles.includes(UserRole.ADMIN)) {
      this.roles.push(UserRole.ADMIN);
    }
  }

  rejectAdmin(): void {
    this.admin_capable = false;
    this.admin_status = CapabilityStatus.REJECTED;
    this.roles = this.roles.filter(role => role !== UserRole.ADMIN);
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
