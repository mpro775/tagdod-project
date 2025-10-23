import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersAdminController } from './users.admin.controller';
import { User, UserSchema } from '../schemas/user.schema';
import { Capabilities, CapabilitiesSchema } from '../../capabilities/schemas/capabilities.schema';
import { AuthModule } from '../../auth/auth.module';
import { SharedModule } from '../../../shared/shared.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Capabilities.name, schema: CapabilitiesSchema },
    ]),
    AuthModule,
    SharedModule,
  ],
  controllers: [UsersAdminController],
  providers: [],
  exports: [MongooseModule],
})
export class UsersAdminModule {}
