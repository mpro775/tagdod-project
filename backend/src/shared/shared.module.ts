import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../modules/users/schemas/user.schema';
import { AuditLog, AuditLogSchema } from '../modules/audit/schemas/audit-log.schema';
import { PermissionService } from './services/permission.service';
import { AuditService } from './services/audit.service';
import { WebSocketService } from './websocket/websocket.service';
import { WebSocketAuthGuard } from './websocket/websocket-auth.guard';
import { AuthModule } from '../modules/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: AuditLog.name, schema: AuditLogSchema }, // Required for AuditService
    ]),
    forwardRef(() => AuthModule), // Required for WebSocketAuthGuard to access TokensService
  ],
  providers: [
    AuditService,
    PermissionService,
    WebSocketService,
    WebSocketAuthGuard,
  ],
  exports: [
    MongooseModule, // تصدير MongooseModule لاستخدام User model في Guards
    AuditService,
    PermissionService,
    WebSocketService,
    WebSocketAuthGuard,
  ],
})
export class SharedModule {}
