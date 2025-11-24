import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument, AuditAction, AuditResource } from '../../modules/audit/schemas/audit-log.schema';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

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
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
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

      this.logger.log(`🔐 Permission Change Audited: ${data.action} permission "${data.permission}" for user ${data.userId} by ${data.grantedBy}`);
    } catch (error) {
      this.logger.error('❌ Failed to audit permission change:', error);
      // لا نرمي الخطأ لأن فشل التسجيل لا يجب أن يوقف العملية الأساسية
    }
  }

  /**
   * تسجيل حدث مستخدم
   */
  async logUserEvent(data: {
    userId: string;
    action: 'created' | 'updated' | 'deleted' | 'suspended' | 'activated';
    performedBy?: string;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    reason?: string;
  }): Promise<void> {
    try {
      let auditAction: AuditAction;

      switch (data.action) {
        case 'created':
          auditAction = AuditAction.USER_CREATED;
          break;
        case 'updated':
          auditAction = AuditAction.USER_UPDATED;
          break;
        case 'deleted':
          auditAction = AuditAction.USER_DELETED;
          break;
        case 'suspended':
          auditAction = AuditAction.USER_SUSPENDED;
          break;
        case 'activated':
          auditAction = AuditAction.USER_ACTIVATED;
          break;
        default:
          return;
      }

      const auditEntry = new this.auditLogModel({
        userId: data.userId,
        performedBy: data.performedBy,
        action: auditAction,
        resource: AuditResource.USER,
        oldValues: data.oldValues,
        newValues: data.newValues,
        reason: data.reason,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        isSensitive: data.action === 'deleted' || data.action === 'suspended',
      });

      await auditEntry.save();

      this.logger.log(`👤 User Event Audited: ${data.action} for user ${data.userId} by ${data.performedBy || 'system'}`);
    } catch (error) {
      this.logger.error('❌ Failed to audit user event:', error);
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
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
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

      this.logger.log(`👤 Role Change Audited: ${data.action} role "${data.role}" for user ${data.userId} by ${data.changedBy}`);
    } catch (error) {
      this.logger.error('❌ Failed to audit role change:', error);
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
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
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

      this.logger.log(`🎯 Capability Decision Audited: ${data.action} capability "${data.capability}" for user ${data.userId} by ${data.decidedBy}`);
    } catch (error) {
      this.logger.error('❌ Failed to audit capability decision:', error);
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
    details?: Record<string, unknown>;
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

      this.logger.log(`👨‍💼 Admin Action Audited: ${data.action} on ${data.resource} by admin ${data.adminId}`);
    } catch (error) {
      this.logger.error('❌ Failed to audit admin action:', error);
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
    details?: Record<string, unknown>;
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

      this.logger.log(`🔐 Auth Event Audited: ${data.action} for user ${data.userId} from IP ${data.ipAddress}`);
    } catch (error) {
      this.logger.error('❌ Failed to audit auth event:', error);
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
      const query: Record<string, unknown> = {};

      if (filters.userId) query.userId = filters.userId;
      if (filters.performedBy) query.performedBy = filters.performedBy;
      if (filters.action) query.action = filters.action;
      if (filters.resource) query.resource = filters.resource;
      if (filters.resourceId) query.resourceId = filters.resourceId;
      if (filters.isSensitive !== undefined) query.isSensitive = filters.isSensitive;

      if (filters.startDate || filters.endDate) {
        query.timestamp = {} as Record<string, Date>;
        if (filters.startDate) (query.timestamp as Record<string, Date>).$gte = filters.startDate;
        if (filters.endDate) (query.timestamp as Record<string, Date>).$lte = filters.endDate;
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
      this.logger.error('❌ Failed to search audit logs:', error);
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
      const query: Record<string, unknown> = {};

      if (filters.userId) query.userId = filters.userId;
      if (filters.performedBy) query.performedBy = filters.performedBy;
      if (filters.action) query.action = filters.action;
      if (filters.resource) query.resource = filters.resource;
      if (filters.resourceId) query.resourceId = filters.resourceId;
      if (filters.isSensitive !== undefined) query.isSensitive = filters.isSensitive;

      if (filters.startDate || filters.endDate) {
        query.timestamp = {} as Record<string, Date>;
        if (filters.startDate) (query.timestamp as Record<string, Date>).$gte = filters.startDate;
        if (filters.endDate) (query.timestamp as Record<string, Date>).$lte = filters.endDate;
      }

      return await this.auditLogModel.countDocuments(query).exec();
    } catch (error) {
      this.logger.error('❌ Failed to count audit logs:', error);
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

      this.logger.log(`🧹 Cleaned up ${result.deletedCount} old audit logs`);
      return result.deletedCount;
    } catch (error) {
      this.logger.error('❌ Failed to cleanup old logs:', error);
      return 0;
    }
  }

  /**
   * تسجيل أحداث الطلبات
   */
  async logOrderEvent(data: {
    userId: string;
    orderId: string;
    action: 'created' | 'cancelled' | 'refunded' | 'status_changed' | 'updated_by_admin' | 'invoice_sent_manually';
    orderNumber: string;
    oldStatus?: string;
    newStatus?: string;
    totalAmount?: number;
    currency?: string;
    performedBy?: string;
    reason?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      let auditAction: AuditAction;

      switch (data.action) {
        case 'created':
          auditAction = AuditAction.ORDER_CREATED;
          break;
        case 'cancelled':
          auditAction = AuditAction.ORDER_CANCELLED;
          break;
        case 'refunded':
          auditAction = AuditAction.ORDER_REFUNDED;
          break;
        case 'status_changed':
          auditAction = AuditAction.ORDER_STATUS_CHANGED;
          break;
        case 'updated_by_admin':
          auditAction = AuditAction.ORDER_UPDATED_BY_ADMIN;
          break;
        case 'invoice_sent_manually':
          auditAction = AuditAction.ORDER_INVOICE_SENT_MANUALLY;
          break;
        default:
          return;
      }

      const auditEntry = new this.auditLogModel({
        userId: data.userId,
        performedBy: data.performedBy,
        action: auditAction,
        resource: AuditResource.ORDER,
        resourceId: data.orderId,
        oldValues: data.oldStatus ? { status: data.oldStatus } : undefined,
        newValues: data.newStatus ? { status: data.newStatus } : undefined,
        metadata: {
          orderNumber: data.orderNumber,
          totalAmount: data.totalAmount,
          currency: data.currency,
        },
        reason: data.reason,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        isSensitive: true, // العمليات المالية حساسة
      });

      await auditEntry.save();

      this.logger.log(`📦 Order Event Audited: ${data.action} for order ${data.orderNumber} by ${data.performedBy || data.userId}`);
    } catch (error) {
      this.logger.error('❌ Failed to audit order event:', error);
    }
  }

  /**
   * تسجيل أحداث المدفوعات
   */
  async logPaymentEvent(data: {
    userId: string;
    orderId: string;
    action: 'initiated' | 'completed' | 'failed' | 'refunded' | 'status_changed';
    paymentMethod: string;
    amount: number;
    currency: string;
    transactionId?: string;
    failureReason?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      let auditAction: AuditAction;

      switch (data.action) {
        case 'initiated':
          auditAction = AuditAction.PAYMENT_INITIATED;
          break;
        case 'completed':
          auditAction = AuditAction.PAYMENT_COMPLETED;
          break;
        case 'failed':
          auditAction = AuditAction.PAYMENT_FAILED;
          break;
        case 'refunded':
          auditAction = AuditAction.PAYMENT_REFUNDED;
          break;
        case 'status_changed':
          auditAction = AuditAction.PAYMENT_STATUS_CHANGED;
          break;
        default:
          return;
      }

      const auditEntry = new this.auditLogModel({
        userId: data.userId,
        action: auditAction,
        resource: AuditResource.PAYMENT,
        resourceId: data.orderId,
        metadata: {
          paymentMethod: data.paymentMethod,
          amount: data.amount,
          currency: data.currency,
          transactionId: data.transactionId,
          failureReason: data.failureReason,
        },
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        isSensitive: true, // العمليات المالية حساسة
      });

      await auditEntry.save();

      this.logger.log(`💳 Payment Event Audited: ${data.action} for order ${data.orderId} - Amount: ${data.amount} ${data.currency}`);
    } catch (error) {
      this.logger.error('❌ Failed to audit payment event:', error);
    }
  }

  /**
   * تسجيل أحداث الكوبونات
   */
  async logCouponEvent(data: {
    userId?: string;
    couponCode: string;
    action: 'applied' | 'application_failed' | 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated';
    orderId?: string;
    discountAmount?: number;
    failureReason?: string;
    performedBy?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      let auditAction: AuditAction;

      switch (data.action) {
        case 'applied':
          auditAction = AuditAction.COUPON_APPLIED;
          break;
        case 'application_failed':
          auditAction = AuditAction.COUPON_APPLICATION_FAILED;
          break;
        case 'created':
          auditAction = AuditAction.COUPON_CREATED;
          break;
        case 'updated':
          auditAction = AuditAction.COUPON_UPDATED;
          break;
        case 'deleted':
          auditAction = AuditAction.COUPON_DELETED;
          break;
        case 'activated':
          auditAction = AuditAction.COUPON_ACTIVATED;
          break;
        case 'deactivated':
          auditAction = AuditAction.COUPON_DEACTIVATED;
          break;
        default:
          return;
      }

      const auditEntry = new this.auditLogModel({
        userId: data.userId || data.performedBy,
        performedBy: data.performedBy,
        action: auditAction,
        resource: AuditResource.COUPON,
        resourceId: data.couponCode,
        metadata: {
          orderId: data.orderId,
          discountAmount: data.discountAmount,
          failureReason: data.failureReason,
        },
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        isSensitive: data.action === 'applied' || data.action === 'created' || data.action === 'deleted',
      });

      await auditEntry.save();

      this.logger.log(`🎫 Coupon Event Audited: ${data.action} for coupon ${data.couponCode}${data.orderId ? ` on order ${data.orderId}` : ''}`);
    } catch (error) {
      this.logger.error('❌ Failed to audit coupon event:', error);
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
      case 'order':
        return AuditResource.ORDER;
      case 'payment':
        return AuditResource.PAYMENT;
      case 'coupon':
        return AuditResource.COUPON;
      default:
        return AuditResource.SYSTEM;
    }
  }
}
