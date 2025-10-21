import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../modules/users/schemas/user.schema';
import { AuditLog, AuditLogSchema } from '../modules/audit/schemas/audit-log.schema';
import { PermissionService } from './services/permission.service';
import { AuditService } from './services/audit.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: AuditLog.name, schema: AuditLogSchema }, // Required for AuditService
    ]),
  ],
  providers: [
    AuditService,
    PermissionService,
  ],
  exports: [
    AuditService,
    PermissionService,
  ],
})
export class SharedModule {}
