import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerServicesController } from './customer.controller';
import { EngineerServicesController } from './engineer.controller';
import { AdminServicesController } from './admin.controller';
import { ServicesService } from './services.service';
import { ServiceRequest, ServiceRequestSchema } from './schemas/service-request.schema';
import { EngineerOffer, EngineerOfferSchema } from './schemas/engineer-offer.schema';
import { Address, AddressSchema } from '../addresses/schemas/address.schema';
import { Capabilities, CapabilitiesSchema } from '../capabilities/schemas/capabilities.schema';
import { EngineerGuard } from '../../shared/guards/engineer.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ServiceRequest.name, schema: ServiceRequestSchema },
      { name: EngineerOffer.name, schema: EngineerOfferSchema },
      { name: Address.name, schema: AddressSchema },
      { name: Capabilities.name, schema: CapabilitiesSchema },
    ]),
    AuthModule,
  ],
  controllers: [CustomerServicesController, EngineerServicesController, AdminServicesController],
  providers: [ServicesService, EngineerGuard],
  exports: [MongooseModule, ServicesService],
})
export class ServicesModule {}
