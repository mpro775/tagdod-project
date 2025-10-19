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
}

// User Capabilities
export interface UserCapabilities {
  userId: string;
  customer_capable: boolean;
  engineer_capable: boolean;
  engineer_status?: 'pending' | 'approved' | 'rejected';
  wholesale_capable: boolean;
  wholesale_status?: 'pending' | 'approved' | 'rejected';
  wholesale_discount_percent?: number;
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

  // Roles & Permissions
  isAdmin: boolean;
  roles: UserRole[];
  permissions: string[];

  // Status
  status: UserStatus;

  // Soft Delete
  deletedAt?: Date | null;
  deletedBy?: string;
  suspendedReason?: string;
  suspendedBy?: string;
  suspendedAt?: Date;

  // Relations
  capabilities?: UserCapabilities | null;
}

// DTOs - متطابقة مع الباك إند

export interface CreateUserDto {
  phone: string;
  firstName?: string;
  lastName?: string;
  gender?: 'male' | 'female' | 'other';
  jobTitle?: string;
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
  password?: string;
  roles?: UserRole[];
  permissions?: string[];
  status?: UserStatus;
  isAdmin?: boolean;
  capabilityRequest?: 'engineer' | 'wholesale';
  wholesaleDiscountPercent?: number;
}

export interface ListUsersParams extends ListParams {
  status?: UserStatus;
  role?: UserRole;
  isAdmin?: boolean;
  includeDeleted?: boolean;
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
  wholesale: number;
}
