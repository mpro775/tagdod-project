import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersAdminController } from './users.admin.controller';
import { User, UserSchema } from '../schemas/user.schema';
import { Capabilities, CapabilitiesSchema } from '../../capabilities/schemas/capabilities.schema';
import { TokensService } from '../../auth/tokens.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Capabilities.name, schema: CapabilitiesSchema },
    ]),
  ],
  controllers: [UsersAdminController],
  providers: [TokensService],
  exports: [MongooseModule],
})
export class UsersAdminModule {}
