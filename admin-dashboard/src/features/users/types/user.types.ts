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
  merchant_capable: boolean;
  merchant_status: CapabilityStatus;
  merchant_discount_percent: number;
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
  capabilityRequest?: 'engineer' | 'merchant';
  merchantDiscountPercent?: number;
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
  capabilityRequest?: 'engineer' | 'merchant';
  merchantDiscountPercent?: number;
}

export interface ListUsersParams extends ListParams {
  status?: UserStatus;
  role?: UserRole;
  verificationStatus?: 'all' | 'verified' | 'unverified';
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
  merchantStatus?: CapabilityStatus;
  updatedAt?: Date | string;
}

export interface ApproveVerificationDto {
  reason?: string;
}

// Engineer Profile Types
export interface EngineerRating {
  score: number; // 1-5
  comment: string;
  customerId: string;
  customerName?: string;
  serviceRequestId?: string;
  orderId?: string;
  ratedAt: Date | string;
}

export interface CommissionTransaction {
  transactionId: string;
  type: 'commission' | 'withdrawal' | 'refund';
  amount: number;
  orderId?: string;
  couponCode?: string;
  description?: string;
  createdAt: Date | string;
}

export interface EngineerProfileAdmin extends BaseEntity {
  userId: string;
  bio?: string;
  avatarUrl?: string;
  whatsappNumber?: string;
  cvFileUrl?: string;
  jobTitle?: string;
  ratings: EngineerRating[];
  totalRatings: number;
  averageRating: number;
  ratingDistribution: number[]; // [5stars, 4stars, 3stars, 2stars, 1star]
  totalCompletedServices: number;
  totalEarnings: number;
  walletBalance: number;
  commissionTransactions: CommissionTransaction[];
  specialties?: string[];
  yearsOfExperience?: number;
  certifications?: string[];
  languages?: string[];
}

export interface UpdateEngineerProfileAdminDto {
  bio?: string;
  avatarUrl?: string;
  whatsappNumber?: string;
  jobTitle?: string;
  specialties?: string[];
  yearsOfExperience?: number;
  certifications?: string[];
  languages?: string[];
}

export interface ManageWalletDto {
  type: 'add' | 'deduct' | 'withdraw';
  amount: number;
  reason: string;
}

export interface SyncStatsDto {
  syncRatings?: boolean;
  syncStatistics?: boolean;
}

export interface GetRatingsQueryDto {
  page?: number;
  limit?: number;
  sortBy?: 'recent' | 'top' | 'oldest';
  minScore?: number;
}

/**
 * تحديد الدور الأساسي للمستخدم بناءً على مصفوفة الأدوار
 * يعطي الأولوية للدور الأساسي (engineer, merchant, admin, super_admin) بدلاً من user
 */
export function getPrimaryRole(roles?: UserRole[] | string[]): UserRole {
  if (!roles || roles.length === 0) {
    return UserRole.USER;
  }

  // البحث عن الدور الأساسي (engineer أو merchant) أولاً
  if (roles.includes(UserRole.ENGINEER)) {
    return UserRole.ENGINEER;
  }
  if (roles.includes(UserRole.MERCHANT)) {
    return UserRole.MERCHANT;
  }
  if (roles.includes(UserRole.ADMIN)) {
    return UserRole.ADMIN;
  }
  if (roles.includes(UserRole.SUPER_ADMIN)) {
    return UserRole.SUPER_ADMIN;
  }

  // إذا لم نجد دور أساسي، نستخدم الأول في المصفوفة
  return (roles[0] as UserRole) || UserRole.USER;
}
