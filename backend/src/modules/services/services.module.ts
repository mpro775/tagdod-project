import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerServicesController } from './customer.controller';
import { EngineerServicesController } from './engineer.controller';
import { AdminServicesController } from './admin.controller';
import { ServicesService } from './services.service';
import { ServicesCronService } from './services.cron';
import { DistanceService } from './services/distance.service';
import { ServicesPermissionGuard } from './guards/services-permission.guard';
import { ServiceRequest, ServiceRequestSchema } from './schemas/service-request.schema';
import { EngineerOffer, EngineerOfferSchema } from './schemas/engineer-offer.schema';
import { Address, AddressSchema } from '../addresses/schemas/address.schema';
import { Capabilities, CapabilitiesSchema } from '../capabilities/schemas/capabilities.schema';
import { EngineerProfile, EngineerProfileSchema } from '../users/schemas/engineer-profile.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { EngineerGuard } from '../../shared/guards/engineer.guard';
import { AuthModule } from '../auth/auth.module';
import { NotificationsCompleteModule } from '../notifications/notifications-complete.module';
import { AddressesModule } from '../addresses/addresses.module';
import { UsersModule } from '../users/users.module';
import { SharedModule } from '../../shared/shared.module';
import { UploadModule } from '../upload/upload.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ServiceRequest.name, schema: ServiceRequestSchema },
      { name: EngineerOffer.name, schema: EngineerOfferSchema },
      { name: Address.name, schema: AddressSchema },
      { name: Capabilities.name, schema: CapabilitiesSchema },
      { name: EngineerProfile.name, schema: EngineerProfileSchema },
      { name: User.name, schema: UserSchema }, // Required for EngineerGuard
    ]),
    AuthModule,
    NotificationsCompleteModule,
    AddressesModule,
    forwardRef(() => UsersModule),
    SharedModule,
    UploadModule,
  ],
  controllers: [CustomerServicesController, EngineerServicesController, AdminServicesController],
  providers: [ServicesService, ServicesCronService, DistanceService, ServicesPermissionGuard, EngineerGuard],
  exports: [MongooseModule, ServicesService],
})
export class ServicesModule {}
