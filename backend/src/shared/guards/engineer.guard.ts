import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Capabilities } from '../../modules/capabilities/schemas/capabilities.schema';

@Injectable()
export class EngineerGuard implements CanActivate {
  constructor(@InjectModel(Capabilities.name) private caps: Model<Capabilities>) {}
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user?.sub) return false;
    const c = await this.caps.findOne({ userId: user.sub }).lean();
    return !!(c && c.engineer_capable && c.engineer_status === 'approved');
  }
}
