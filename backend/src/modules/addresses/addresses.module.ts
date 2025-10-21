import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';
import { Address, AddressSchema } from './schemas/address.schema';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../../shared/shared.module';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Address.name, schema: AddressSchema }]),
    AuthModule,
    SharedModule,
  ],
  controllers: [AddressesController],
  providers: [AddressesService],
  exports: [MongooseModule, AddressesService],
})
export class AddressesModule {}
