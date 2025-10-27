import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditController } from './audit.controller';
import { User, UserSchema } from '../users/schemas/user.schema';
import { SharedModule } from '../../shared/shared.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema }, // Required for RolesGuard
    ]),
    SharedModule, // Required for AuditService and PermissionService
    AuthModule, // Required for JwtAuthGuard
  ],
  controllers: [AuditController],
})
export class AuditModule {}
