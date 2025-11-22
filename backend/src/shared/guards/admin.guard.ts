import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserRole } from '../../modules/users/schemas/user.schema';
import { UnauthorizedException, ForbiddenException } from '../exceptions/domain.exceptions';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    // Check if user is authenticated first
    if (!user) {
      throw new UnauthorizedException({ reason: 'user_not_authenticated' });
    }

    // السوبر أدمن له صلاحية كاملة دائماً
    if (user?.roles && Array.isArray(user.roles) && user.roles.includes(UserRole.SUPER_ADMIN)) {
      return true;
    }

    // التحقق من isAdmin من JWT payload
    if (user?.isAdmin === true) {
      return true;
    }

    // التحقق من الأدوار الجديدة
    if (user?.roles && Array.isArray(user.roles)) {
      const hasAdminRole = user.roles.some((role: UserRole) =>
        [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(role)
      );
      if (hasAdminRole) {
        return true;
      }
    }

    // Deny access if no valid admin credentials found
    throw new ForbiddenException({ 
      reason: 'admin_access_required',
      userRoles: user.roles,
      isAdmin: user.isAdmin 
    });
  }
}
