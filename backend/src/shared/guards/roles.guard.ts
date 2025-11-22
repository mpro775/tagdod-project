import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { UserRole, User, UserStatus } from '../../modules/users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PermissionService } from '../services/permission.service';
import { UnauthorizedException, ForbiddenException } from '../exceptions/domain.exceptions';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(User.name) private userModel: Model<User>,
    private permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required roles from decorator
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Get required permissions from decorator
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles or permissions required, allow access
    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.sub) {
      throw new UnauthorizedException({ reason: 'user_not_authenticated' });
    }

    // Super admin has access to everything - check from JWT directly
    if (user.roles && Array.isArray(user.roles) && user.roles.includes(UserRole.SUPER_ADMIN)) {
      return true;
    }

    // Check if user is deleted or suspended
    const fullUser = await this.userModel.findById(user.sub).lean();
    if (!fullUser) {
      throw new UnauthorizedException({ reason: 'user_not_found' });
    }

    if (fullUser.deletedAt || fullUser.status === UserStatus.SUSPENDED) {
      throw new ForbiddenException({ reason: 'user_suspended_or_deleted', status: fullUser.status });
    }

    // Double check super admin from database
    if (await this.permissionService.isSuperAdmin(user.sub)) {
      return true;
    }

    // Check roles using PermissionService
    if (requiredRoles) {
      const hasRole = await this.permissionService.hasAnyRole(user.sub, requiredRoles);
      if (!hasRole) {
        throw new ForbiddenException({ 
          reason: 'insufficient_roles', 
          required: requiredRoles,
          userRoles: user.roles 
        });
      }
    }

    // Check permissions using PermissionService
    if (requiredPermissions) {
      for (const permission of requiredPermissions) {
        const hasPermission = await this.permissionService.hasPermission(user.sub, permission);
        if (!hasPermission) {
          throw new ForbiddenException({ 
            reason: 'insufficient_permissions', 
            required: permission,
            userPermissions: user.permissions 
          });
        }
      }
    }

    return true;
  }
}
