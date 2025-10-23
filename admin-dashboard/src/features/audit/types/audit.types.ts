import { BaseEntity, ListParams } from '@/shared/types/common.types';

// Enums matching backend
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
}

export enum AuditResource {
  USER = 'user',
  PERMISSION = 'permission',
  ROLE = 'role',
  CAPABILITY = 'capability',
  SYSTEM = 'system',
  AUTH = 'auth',
  ADMIN = 'admin',
}

// Main Audit Log interface
export interface AuditLog extends BaseEntity {
  userId: string;
  performedBy?: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  oldValues?: any;
  newValues?: any;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
  isSensitive?: boolean;
  sessionId?: string;
  timestamp: string;
  
  // Populated fields
  user?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  performedByUser?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

// Filter parameters for audit logs
export interface AuditLogFilters extends ListParams {
  userId?: string;
  performedBy?: string;
  action?: AuditAction;
  resource?: AuditResource;
  resourceId?: string;
  startDate?: string;
  endDate?: string;
  isSensitive?: boolean;
}

// Audit statistics
export interface AuditStats {
  totalLogs: number;
  sensitiveLogs: number;
  permissionChanges: number;
  roleChanges: number;
  capabilityDecisions: number;
  adminActions: number;
  authEvents: number;
  period: {
    startDate?: string;
    endDate?: string;
  };
}

// API Response types
export interface AuditLogsResponse {
  data: AuditLog[];
  meta: {
    total: number;
    limit: number;
    skip: number;
    hasMore: boolean;
  };
}

export interface AuditStatsResponse {
  data: AuditStats;
}

export interface AuditActionsResponse {
  data: AuditAction[];
}

export interface AuditResourcesResponse {
  data: AuditResource[];
}

// Action labels for display
export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  [AuditAction.USER_CREATED]: 'إنشاء مستخدم',
  [AuditAction.USER_UPDATED]: 'تحديث مستخدم',
  [AuditAction.USER_DELETED]: 'حذف مستخدم',
  [AuditAction.USER_SUSPENDED]: 'تعليق مستخدم',
  [AuditAction.USER_ACTIVATED]: 'تفعيل مستخدم',
  [AuditAction.LOGIN_SUCCESS]: 'تسجيل دخول ناجح',
  [AuditAction.LOGIN_FAILED]: 'فشل تسجيل الدخول',
  [AuditAction.LOGOUT]: 'تسجيل خروج',
  [AuditAction.PASSWORD_CHANGED]: 'تغيير كلمة المرور',
  [AuditAction.PASSWORD_RESET]: 'إعادة تعيين كلمة المرور',
  [AuditAction.PERMISSION_GRANTED]: 'منح صلاحية',
  [AuditAction.PERMISSION_REVOKED]: 'سحب صلاحية',
  [AuditAction.ROLE_ASSIGNED]: 'تعيين دور',
  [AuditAction.ROLE_REMOVED]: 'إزالة دور',
  [AuditAction.CAPABILITY_APPROVED]: 'موافقة على قدرة',
  [AuditAction.CAPABILITY_REJECTED]: 'رفض قدرة',
  [AuditAction.ADMIN_ACTION]: 'إجراء إداري',
  [AuditAction.SYSTEM_BACKUP]: 'نسخ احتياطي للنظام',
  [AuditAction.SYSTEM_MAINTENANCE]: 'صيانة النظام',
  [AuditAction.DATA_MIGRATION]: 'ترحيل البيانات',
};

// Resource labels for display
export const AUDIT_RESOURCE_LABELS: Record<AuditResource, string> = {
  [AuditResource.USER]: 'مستخدم',
  [AuditResource.PERMISSION]: 'صلاحية',
  [AuditResource.ROLE]: 'دور',
  [AuditResource.CAPABILITY]: 'قدرة',
  [AuditResource.SYSTEM]: 'نظام',
  [AuditResource.AUTH]: 'مصادقة',
  [AuditResource.ADMIN]: 'إدارة',
};

// Action colors for UI
export const AUDIT_ACTION_COLORS: Record<AuditAction, string> = {
  [AuditAction.USER_CREATED]: 'success',
  [AuditAction.USER_UPDATED]: 'info',
  [AuditAction.USER_DELETED]: 'error',
  [AuditAction.USER_SUSPENDED]: 'warning',
  [AuditAction.USER_ACTIVATED]: 'success',
  [AuditAction.LOGIN_SUCCESS]: 'success',
  [AuditAction.LOGIN_FAILED]: 'error',
  [AuditAction.LOGOUT]: 'info',
  [AuditAction.PASSWORD_CHANGED]: 'warning',
  [AuditAction.PASSWORD_RESET]: 'info',
  [AuditAction.PERMISSION_GRANTED]: 'success',
  [AuditAction.PERMISSION_REVOKED]: 'error',
  [AuditAction.ROLE_ASSIGNED]: 'success',
  [AuditAction.ROLE_REMOVED]: 'error',
  [AuditAction.CAPABILITY_APPROVED]: 'success',
  [AuditAction.CAPABILITY_REJECTED]: 'error',
  [AuditAction.ADMIN_ACTION]: 'primary',
  [AuditAction.SYSTEM_BACKUP]: 'info',
  [AuditAction.SYSTEM_MAINTENANCE]: 'warning',
  [AuditAction.DATA_MIGRATION]: 'info',
};

// Severity levels for actions
export const AUDIT_ACTION_SEVERITY: Record<AuditAction, 'low' | 'medium' | 'high' | 'critical'> = {
  [AuditAction.USER_CREATED]: 'medium',
  [AuditAction.USER_UPDATED]: 'low',
  [AuditAction.USER_DELETED]: 'high',
  [AuditAction.USER_SUSPENDED]: 'high',
  [AuditAction.USER_ACTIVATED]: 'medium',
  [AuditAction.LOGIN_SUCCESS]: 'low',
  [AuditAction.LOGIN_FAILED]: 'medium',
  [AuditAction.LOGOUT]: 'low',
  [AuditAction.PASSWORD_CHANGED]: 'medium',
  [AuditAction.PASSWORD_RESET]: 'medium',
  [AuditAction.PERMISSION_GRANTED]: 'high',
  [AuditAction.PERMISSION_REVOKED]: 'high',
  [AuditAction.ROLE_ASSIGNED]: 'high',
  [AuditAction.ROLE_REMOVED]: 'high',
  [AuditAction.CAPABILITY_APPROVED]: 'medium',
  [AuditAction.CAPABILITY_REJECTED]: 'medium',
  [AuditAction.ADMIN_ACTION]: 'critical',
  [AuditAction.SYSTEM_BACKUP]: 'medium',
  [AuditAction.SYSTEM_MAINTENANCE]: 'high',
  [AuditAction.DATA_MIGRATION]: 'critical',
};
