import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AddressesController } from './addresses.controller';
import { AddressesAdminController } from './addresses.admin.controller';
import { AddressesService } from './addresses.service';
import { Address, AddressSchema } from './schemas/address.schema';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../../shared/shared.module';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Address.name, schema: AddressSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuthModule,
    SharedModule,
  ],
  controllers: [
    AddressesController,
    AddressesAdminController, // Admin routes
  ],
  providers: [AddressesService],
  exports: [MongooseModule, AddressesService],
})
export class AddressesModule {}
