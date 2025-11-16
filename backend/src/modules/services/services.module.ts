import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerServicesController } from './customer.controller';
import { EngineerServicesController } from './engineer.controller';
import { AdminServicesController } from './admin.controller';
import { ServicesService } from './services.service';
import { DistanceService } from './services/distance.service';
import { ServicesPermissionGuard } from './guards/services-permission.guard';
import { ServiceRequest, ServiceRequestSchema } from './schemas/service-request.schema';
import { EngineerOffer, EngineerOfferSchema } from './schemas/engineer-offer.schema';
import { Address, AddressSchema } from '../addresses/schemas/address.schema';
import { Capabilities, CapabilitiesSchema } from '../capabilities/schemas/capabilities.schema';
import { EngineerGuard } from '../../shared/guards/engineer.guard';
import { AuthModule } from '../auth/auth.module';
import { NotificationsCompleteModule } from '../notifications/notifications-complete.module';
import { AddressesModule } from '../addresses/addresses.module';
import { SharedModule } from '../../shared/shared.module';
import { UploadModule } from '../upload/upload.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ServiceRequest.name, schema: ServiceRequestSchema },
      { name: EngineerOffer.name, schema: EngineerOfferSchema },
      { name: Address.name, schema: AddressSchema },
      { name: Capabilities.name, schema: CapabilitiesSchema },
    ]),
    AuthModule,
    NotificationsCompleteModule,
    AddressesModule,
    SharedModule,
    UploadModule,
  ],
  controllers: [CustomerServicesController, EngineerServicesController, AdminServicesController],
  providers: [ServicesService, DistanceService, ServicesPermissionGuard, EngineerGuard],
  exports: [MongooseModule, ServicesService],
})
export class ServicesModule {}
