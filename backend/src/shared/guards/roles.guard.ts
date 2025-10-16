import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { UserRole, User } from '../../modules/users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(User.name) private userModel: Model<User>,
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
      return false;
    }

    // Fetch full user data from database
    const fullUser = await this.userModel.findById(user.sub).lean();

    if (!fullUser) {
      return false;
    }

    // Check if user is deleted or suspended
    if (fullUser.deletedAt || fullUser.status === 'suspended') {
      return false;
    }

    // Super admin has access to everything
    if (fullUser.roles?.includes(UserRole.SUPER_ADMIN) || user.roles?.includes(UserRole.SUPER_ADMIN)) {
      return true;
    }

    // Check roles
    if (requiredRoles) {
      const hasRole = requiredRoles.some((role) => 
        fullUser.roles?.includes(role) || user.roles?.includes(role)
      );
      if (!hasRole) {
        return false;
      }
    }

    // Check permissions
    if (requiredPermissions) {
      const hasPermission = requiredPermissions.every((permission) =>
        fullUser.permissions?.includes(permission) || user.permissions?.includes(permission),
      );
      if (!hasPermission) {
        return false;
      }
    }

    return true;
  }
}
