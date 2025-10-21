import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument, AuditAction, AuditResource } from '../../modules/audit/schemas/audit-log.schema';

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  /**
   * تسجيل تغيير صلاحية
   */
  async logPermissionChange(data: {
    userId: string;
    permission: string;
    action: 'grant' | 'revoke';
    grantedBy: string;
    reason?: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
  }): Promise<void> {
    try {
      const auditEntry = new this.auditLogModel({
        userId: data.userId,
        performedBy: data.grantedBy,
        action: data.action === 'grant' ? AuditAction.PERMISSION_GRANTED : AuditAction.PERMISSION_REVOKED,
        resource: AuditResource.PERMISSION,
        resourceId: data.permission,
        oldValues: data.oldValues,
        newValues: data.newValues,
        metadata: { permission: data.permission },
        reason: data.reason,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        sessionId: data.sessionId,
        isSensitive: true, // تغييرات الصلاحيات حساسة
      });

      await auditEntry.save();

      console.log('🔐 Permission Change Audited:', {
        userId: data.userId,
        permission: data.permission,
        action: data.action,
        performedBy: data.grantedBy,
      });
    } catch (error) {
      console.error('❌ Failed to audit permission change:', error);
      // لا نرمي الخطأ لأن فشل التسجيل لا يجب أن يوقف العملية الأساسية
    }
  }

  /**
   * تسجيل تغيير دور
   */
  async logRoleChange(data: {
    userId: string;
    role: string;
    action: 'assign' | 'remove';
    changedBy: string;
    reason?: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
  }): Promise<void> {
    try {
      const auditEntry = new this.auditLogModel({
        userId: data.userId,
        performedBy: data.changedBy,
        action: data.action === 'assign' ? AuditAction.ROLE_ASSIGNED : AuditAction.ROLE_REMOVED,
        resource: AuditResource.ROLE,
        resourceId: data.role,
        oldValues: data.oldValues,
        newValues: data.newValues,
        metadata: { role: data.role },
        reason: data.reason,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        sessionId: data.sessionId,
        isSensitive: true, // تغييرات الأدوار حساسة
      });

      await auditEntry.save();

      console.log('👤 Role Change Audited:', {
        userId: data.userId,
        role: data.role,
        action: data.action,
        performedBy: data.changedBy,
      });
    } catch (error) {
      console.error('❌ Failed to audit role change:', error);
    }
  }

  /**
   * تسجيل موافقة/رفض capability
   */
  async logCapabilityDecision(data: {
    userId: string;
    capability: string;
    action: 'approve' | 'reject';
    decidedBy: string;
    reason?: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
  }): Promise<void> {
    try {
      const auditEntry = new this.auditLogModel({
        userId: data.userId,
        performedBy: data.decidedBy,
        action: data.action === 'approve' ? AuditAction.CAPABILITY_APPROVED : AuditAction.CAPABILITY_REJECTED,
        resource: AuditResource.CAPABILITY,
        resourceId: data.capability,
        oldValues: data.oldValues,
        newValues: data.newValues,
        metadata: { capability: data.capability },
        reason: data.reason,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        sessionId: data.sessionId,
        isSensitive: true,
      });

      await auditEntry.save();

      console.log('🎯 Capability Decision Audited:', {
        userId: data.userId,
        capability: data.capability,
        action: data.action,
        performedBy: data.decidedBy,
      });
    } catch (error) {
      console.error('❌ Failed to audit capability decision:', error);
    }
  }

  /**
   * تسجيل عملية أدمن عامة
   */
  async logAdminAction(data: {
    adminId: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    reason?: string;
  }): Promise<void> {
    try {
      const auditEntry = new this.auditLogModel({
        userId: data.adminId,
        performedBy: data.adminId,
        action: AuditAction.ADMIN_ACTION,
        resource: this.mapResource(data.resource),
        resourceId: data.resourceId,
        metadata: {
          action: data.action,
          details: data.details
        },
        reason: data.reason,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        sessionId: data.sessionId,
        isSensitive: true,
      });

      await auditEntry.save();

      console.log('👨‍💼 Admin Action Audited:', {
        adminId: data.adminId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
      });
    } catch (error) {
      console.error('❌ Failed to audit admin action:', error);
    }
  }

  /**
   * تسجيل عملية مصادقة
   */
  async logAuthEvent(data: {
    userId: string;
    action: 'login_success' | 'login_failed' | 'logout' | 'password_change' | 'password_reset';
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    details?: any;
  }): Promise<void> {
    try {
      let auditAction: AuditAction;

      switch (data.action) {
        case 'login_success':
          auditAction = AuditAction.LOGIN_SUCCESS;
          break;
        case 'login_failed':
          auditAction = AuditAction.LOGIN_FAILED;
          break;
        case 'logout':
          auditAction = AuditAction.LOGOUT;
          break;
        case 'password_change':
          auditAction = AuditAction.PASSWORD_CHANGED;
          break;
        case 'password_reset':
          auditAction = AuditAction.PASSWORD_RESET;
          break;
        default:
          return; // لا نسجل أحداث غير معروفة
      }

      const auditEntry = new this.auditLogModel({
        userId: data.userId,
        action: auditAction,
        resource: AuditResource.AUTH,
        metadata: data.details,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        sessionId: data.sessionId,
        isSensitive: data.action.includes('password') || data.action === 'login_failed',
      });

      await auditEntry.save();

      console.log('🔐 Auth Event Audited:', {
        userId: data.userId,
        action: data.action,
        ipAddress: data.ipAddress,
      });
    } catch (error) {
      console.error('❌ Failed to audit auth event:', error);
    }
  }

  /**
   * البحث في سجلات التدقيق
   */
  async searchAuditLogs(filters: {
    userId?: string;
    performedBy?: string;
    action?: AuditAction;
    resource?: AuditResource;
    resourceId?: string;
    startDate?: Date;
    endDate?: Date;
    isSensitive?: boolean;
    limit?: number;
    skip?: number;
  }): Promise<AuditLogDocument[]> {
    try {
      const query: any = {};

      if (filters.userId) query.userId = filters.userId;
      if (filters.performedBy) query.performedBy = filters.performedBy;
      if (filters.action) query.action = filters.action;
      if (filters.resource) query.resource = filters.resource;
      if (filters.resourceId) query.resourceId = filters.resourceId;
      if (filters.isSensitive !== undefined) query.isSensitive = filters.isSensitive;

      if (filters.startDate || filters.endDate) {
        query.timestamp = {};
        if (filters.startDate) query.timestamp.$gte = filters.startDate;
        if (filters.endDate) query.timestamp.$lte = filters.endDate;
      }

      return await this.auditLogModel
        .find(query)
        .populate('userId', 'phone firstName lastName')
        .populate('performedBy', 'phone firstName lastName')
        .sort({ timestamp: -1 })
        .limit(filters.limit || 50)
        .skip(filters.skip || 0)
        .exec();
    } catch (error) {
      console.error('❌ Failed to search audit logs:', error);
      return [];
    }
  }

  /**
   * عد السجلات حسب الفلاتر
   */
  async countAuditLogs(filters: {
    userId?: string;
    performedBy?: string;
    action?: AuditAction;
    resource?: AuditResource;
    resourceId?: string;
    startDate?: Date;
    endDate?: Date;
    isSensitive?: boolean;
  }): Promise<number> {
    try {
      const query: any = {};

      if (filters.userId) query.userId = filters.userId;
      if (filters.performedBy) query.performedBy = filters.performedBy;
      if (filters.action) query.action = filters.action;
      if (filters.resource) query.resource = filters.resource;
      if (filters.resourceId) query.resourceId = filters.resourceId;
      if (filters.isSensitive !== undefined) query.isSensitive = filters.isSensitive;

      if (filters.startDate || filters.endDate) {
        query.timestamp = {};
        if (filters.startDate) query.timestamp.$gte = filters.startDate;
        if (filters.endDate) query.timestamp.$lte = filters.endDate;
      }

      return await this.auditLogModel.countDocuments(query).exec();
    } catch (error) {
      console.error('❌ Failed to count audit logs:', error);
      return 0;
    }
  }

  /**
   * تنظيف السجلات القديمة
   */
  async cleanupOldLogs(daysToKeep: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await this.auditLogModel.deleteMany({
        timestamp: { $lt: cutoffDate },
        isSensitive: false, // نحتفظ بالسجلات الحساسة لفترة أطول
      });

      console.log(`🧹 Cleaned up ${result.deletedCount} old audit logs`);
      return result.deletedCount;
    } catch (error) {
      console.error('❌ Failed to cleanup old logs:', error);
      return 0;
    }
  }

  /**
   * تحويل string resource إلى enum
   */
  private mapResource(resource: string): AuditResource {
    switch (resource.toLowerCase()) {
      case 'user':
        return AuditResource.USER;
      case 'permission':
        return AuditResource.PERMISSION;
      case 'role':
        return AuditResource.ROLE;
      case 'capability':
        return AuditResource.CAPABILITY;
      case 'auth':
        return AuditResource.AUTH;
      case 'admin':
        return AuditResource.ADMIN;
      default:
        return AuditResource.SYSTEM;
    }
  }
}
