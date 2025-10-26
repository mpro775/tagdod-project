import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserRole } from '../../modules/users/schemas/user.schema';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

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
      return user.roles.some((role: UserRole) =>
        [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(role)
      );
    }

    // Deny access if no valid admin credentials found
    return false;
  }
}
