import { BaseEntity, ListParams } from '@/shared/types/common.types';

// User Role - متطابق مع الباك إند
export enum UserRole {
  // eslint-disable-next-line no-unused-vars
  USER = 'user',
  // eslint-disable-next-line no-unused-vars
  ADMIN = 'admin',
  // eslint-disable-next-line no-unused-vars
  SUPER_ADMIN = 'super_admin',
  // eslint-disable-next-line no-unused-vars
  MERCHANT = 'merchant',
  // eslint-disable-next-line no-unused-vars
  ENGINEER = 'engineer',
}

// User Status - متطابق مع الباك إند
export enum UserStatus {
  // eslint-disable-next-line no-unused-vars
  ACTIVE = 'active',
  // eslint-disable-next-line no-unused-vars
  SUSPENDED = 'suspended',
  // eslint-disable-next-line no-unused-vars
  PENDING = 'pending',
  // eslint-disable-next-line no-unused-vars
  DELETED = 'deleted',
}

// Capability Status - متطابق مع الباك إند
export enum CapabilityStatus {
  // eslint-disable-next-line no-unused-vars
  NONE = 'none',
  // eslint-disable-next-line no-unused-vars
  UNVERIFIED = 'unverified',
  // eslint-disable-next-line no-unused-vars
  PENDING = 'pending',
  // eslint-disable-next-line no-unused-vars
  APPROVED = 'approved',
  // eslint-disable-next-line no-unused-vars
  REJECTED = 'rejected',
}

// Currency - متطابق مع الباك إند
export enum Currency {
  // eslint-disable-next-line no-unused-vars
  USD = 'USD',
  // eslint-disable-next-line no-unused-vars
  SAR = 'SAR',
  // eslint-disable-next-line no-unused-vars
  AED = 'AED',
  // eslint-disable-next-line no-unused-vars
  EUR = 'EUR',
}

// User Capabilities - متطابق مع الباك إند
export interface UserCapabilities {
  userId: string;
  customer_capable: boolean;
  engineer_capable: boolean;
  engineer_status: CapabilityStatus;
  wholesale_capable: boolean;
  wholesale_status: CapabilityStatus;
  wholesale_discount_percent: number;
  admin_capable: boolean;
  admin_status: CapabilityStatus;
  createdAt: Date;
  updatedAt: Date;
}

// User Interface - متطابق مع الباك إند
export interface User extends BaseEntity {
  phone: string;
  firstName?: string;
  lastName?: string;
  gender?: 'male' | 'female' | 'other';
  jobTitle?: string;
  city?: string; // المدينة - مهمة للمهندسين

  // Roles & Permissions
  roles: UserRole[];
  permissions: string[];

  // Status
  status: UserStatus;

  // Currency
  preferredCurrency: Currency;

  // Activity tracking
  lastActivityAt: Date;

  // Soft Delete
  deletedAt?: Date | null;
  deletedBy?: string;
  deletionReason?: string; // سبب الحذف
  suspendedReason?: string;
  suspendedBy?: string;
  suspendedAt?: Date;

  // Relations
  capabilities?: UserCapabilities | null;

  // حقول التحقق (Verification)
  cvFileUrl?: string; // رابط ملف السيرة الذاتية للمهندس
  storePhotoUrl?: string; // رابط صورة المحل للتاجر
  storeName?: string; // اسم المحل للتاجر
  verificationNote?: string; // ملاحظة التحقق
}

// DTOs - متطابقة مع الباك إند

export interface CreateUserDto {
  phone: string;
  firstName?: string;
  lastName?: string;
  gender?: 'male' | 'female' | 'other';
  jobTitle?: string;
  city?: string; // المدينة - للمهندسين
  password?: string;
  roles?: UserRole[];
  permissions?: string[];
  status?: UserStatus;
  capabilityRequest?: 'engineer' | 'wholesale';
  wholesaleDiscountPercent?: number;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  gender?: 'male' | 'female' | 'other';
  jobTitle?: string;
  city?: string; // المدينة - للمهندسين
  password?: string;
  roles?: UserRole[];
  permissions?: string[];
  status?: UserStatus;
  capabilityRequest?: 'engineer' | 'wholesale';
  wholesaleDiscountPercent?: number;
}

export interface ListUsersParams extends ListParams {
  status?: UserStatus;
  role?: UserRole;
  isAdmin?: boolean;
  includeDeleted?: boolean;
}

// Deleted User - للعرض في صفحة الحسابات المحذوفة
export interface DeletedUser {
  id: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  deletionReason: string;
  deletedAt: Date | string;
  deletedBy?: string | null;
  createdAt: Date | string;
  status: UserStatus;
}

export interface ListDeletedUsersParams extends ListParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SuspendUserDto {
  reason?: string;
}

// User Statistics
export interface UserStats {
  total: number;
  active: number;
  suspended: number;
  deleted: number;
  admins: number;
  engineers: number;
  merchants: number;
  users: number;
}

// Verification Request Types
export interface VerificationRequest {
  id: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  verificationType: 'engineer' | 'merchant';
  cvFileUrl?: string;
  storePhotoUrl?: string;
  storeName?: string;
  verificationNote?: string;
  createdAt: Date | string;
}

export interface VerificationDetails extends VerificationRequest {
  jobTitle?: string;
  engineerStatus?: CapabilityStatus;
  wholesaleStatus?: CapabilityStatus;
  updatedAt?: Date | string;
}

export interface ApproveVerificationDto {
  reason?: string;
}
