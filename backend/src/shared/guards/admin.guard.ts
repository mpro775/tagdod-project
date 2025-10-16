import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserRole } from '../../modules/users/schemas/user.schema';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    
    // التحقق من isAdmin للتوافق مع الكود القديم
    if (user?.isAdmin) {
      return true;
    }
    
    // التحقق من الأدوار الجديدة
    if (user?.roles && Array.isArray(user.roles)) {
      return user.roles.some((role: UserRole) => 
        [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(role)
      );
    }
    
    
    return false;
  }
}
