import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditController } from './audit.controller';
import { User, UserSchema } from '../users/schemas/user.schema';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema }, // Required for RolesGuard
    ]),
    SharedModule, // Required for AuditService and PermissionService
  ],
  controllers: [AuditController],
})
export class AuditModule {}
