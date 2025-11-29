import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, CapabilityStatus, UserRole } from '../../modules/users/schemas/user.schema';

@Injectable()
export class EngineerGuard implements CanActivate {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user?.sub) return false;
    
    // جلب المستخدم من قاعدة البيانات
    const dbUser = await this.userModel.findById(user.sub).lean();
    if (!dbUser) return false;
    
    // التحقق من صلاحية المهندس من User schema (المصدر الأساسي)
    const isEngineerFromCapability = 
      dbUser.engineer_capable === true && 
      dbUser.engineer_status === CapabilityStatus.APPROVED;
    
    // التحقق من الدور أيضاً (للتوافق مع النظام)
    const isEngineerFromRole = 
      Array.isArray(dbUser.roles) && 
      dbUser.roles.includes(UserRole.ENGINEER);
    
    return isEngineerFromCapability || isEngineerFromRole;
  }
}
