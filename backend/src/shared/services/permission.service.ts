import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserRole } from '../../modules/users/schemas/user.schema';
import { AuditService } from './audit.service';

@Injectable()
export class PermissionService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private auditService: AuditService,
  ) {}

  /**
   * التحقق من صلاحية محددة لمستخدم
   */
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) return false;

      // Super admin has all permissions
      if (user.roles?.includes(UserRole.SUPER_ADMIN)) {
        return true;
      }

      // Check user permissions
      return user.permissions?.includes(permission) || false;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * التحقق من دور محدد لمستخدم
   */
  async hasRole(userId: string, role: UserRole): Promise<boolean> {
    try {
      const user = await this.userModel.findById(userId);
      return user?.roles?.includes(role) || false;
    } catch (error) {
      console.error('Error checking role:', error);
      return false;
    }
  }

  /**
   * التحقق من أي من الأدوار المحددة
   */
  async hasAnyRole(userId: string, roles: UserRole[]): Promise<boolean> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user?.roles) return false;

      return roles.some(role => user.roles.includes(role));
    } catch (error) {
      console.error('Error checking any role:', error);
      return false;
    }
  }

  /**
   * التحقق من جميع الأدوار المحددة
   */
  async hasAllRoles(userId: string, roles: UserRole[]): Promise<boolean> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user?.roles) return false;

      return roles.every(role => user.roles.includes(role));
    } catch (error) {
      console.error('Error checking all roles:', error);
      return false;
    }
  }

  /**
   * منح صلاحية لمستخدم
   */
  async grantPermission(
    userId: string,
    permission: string,
    grantedBy: string,
    reason?: string,
  ): Promise<boolean> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) return false;

      // Check if permission already exists
      if (user.permissions?.includes(permission)) {
        return true; // Already has permission
      }

      // Add permission
      await this.userModel.updateOne(
        { _id: new Types.ObjectId(userId) },
        { $addToSet: { permissions: permission } }
      );

      // Log the action
      await this.auditService.logPermissionChange({
        userId,
        permission,
        action: 'grant',
        grantedBy,
        reason,
      });

      return true;
    } catch (error) {
      console.error('Error granting permission:', error);
      return false;
    }
  }

  /**
   * سحب صلاحية من مستخدم
   */
  async revokePermission(
    userId: string,
    permission: string,
    revokedBy: string,
    reason?: string,
  ): Promise<boolean> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) return false;

      // Remove permission
      await this.userModel.updateOne(
        { _id: new Types.ObjectId(userId) },
        { $pull: { permissions: permission } }
      );

      // Log the action
      await this.auditService.logPermissionChange({
        userId,
        permission,
        action: 'revoke',
        grantedBy: revokedBy,
        reason,
      });

      return true;
    } catch (error) {
      console.error('Error revoking permission:', error);
      return false;
    }
  }

  /**
   * تعيين الأدوار لمستخدم
   */
  async setRoles(
    userId: string,
    roles: UserRole[],
    changedBy: string,
    reason?: string,
  ): Promise<boolean> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) return false;

      const oldRoles = user.roles || [];
      user.roles = roles;
      await user.save();

      // Log role changes
      for (const role of roles) {
        if (!oldRoles.includes(role)) {
          await this.auditService.logRoleChange({
            userId,
            role,
            action: 'assign',
            changedBy,
            reason,
          });
        }
      }

      for (const role of oldRoles) {
        if (!roles.includes(role)) {
          await this.auditService.logRoleChange({
            userId,
            role,
            action: 'remove',
            changedBy,
            reason,
          });
        }
      }

      return true;
    } catch (error) {
      console.error('Error setting roles:', error);
      return false;
    }
  }

  /**
   * إضافة دور لمستخدم
   */
  async addRole(
    userId: string,
    role: UserRole,
    addedBy: string,
    reason?: string,
  ): Promise<boolean> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) return false;

      if (user.roles?.includes(role)) {
        return true; // Already has role
      }

      await this.userModel.updateOne(
        { _id: new Types.ObjectId(userId) },
        { $addToSet: { roles: role } }
      );

      await this.auditService.logRoleChange({
        userId,
        role,
        action: 'assign',
        changedBy: addedBy,
        reason,
      });

      return true;
    } catch (error) {
      console.error('Error adding role:', error);
      return false;
    }
  }

  /**
   * إزالة دور من مستخدم
   */
  async removeRole(
    userId: string,
    role: UserRole,
    removedBy: string,
    reason?: string,
  ): Promise<boolean> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) return false;

      await this.userModel.updateOne(
        { _id: new Types.ObjectId(userId) },
        { $pull: { roles: role } }
      );

      await this.auditService.logRoleChange({
        userId,
        role,
        action: 'remove',
        changedBy: removedBy,
        reason,
      });

      return true;
    } catch (error) {
      console.error('Error removing role:', error);
      return false;
    }
  }

  /**
   * الحصول على جميع صلاحيات المستخدم
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    try {
      const user = await this.userModel.findById(userId);
      return user?.permissions || [];
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }
  }

  /**
   * الحصول على جميع أدوار المستخدم
   */
  async getUserRoles(userId: string): Promise<UserRole[]> {
    try {
      const user = await this.userModel.findById(userId);
      return user?.roles || [];
    } catch (error) {
      console.error('Error getting user roles:', error);
      return [];
    }
  }

  /**
   * التحقق من صلاحية الأدمن
   */
  async isAdmin(userId: string): Promise<boolean> {
    return this.hasAnyRole(userId, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);
  }

  /**
   * التحقق من صلاحية السوبر أدمن
   */
  async isSuperAdmin(userId: string): Promise<boolean> {
    return this.hasRole(userId, UserRole.SUPER_ADMIN);
  }
}
