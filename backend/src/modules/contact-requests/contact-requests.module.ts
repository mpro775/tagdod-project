import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactRequest, ContactRequestSchema } from './schemas/contact-request.schema';
import { ContactRequestsService } from './contact-requests.service';
import { ContactRequestsPublicController } from './contact-requests.public.controller';
import { ContactRequestsAdminController } from './contact-requests.admin.controller';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ContactRequest.name, schema: ContactRequestSchema }]),
    forwardRef(() => AuthModule),
    SharedModule,
  ],
  controllers: [ContactRequestsPublicController, ContactRequestsAdminController],
  providers: [ContactRequestsService],
  exports: [ContactRequestsService],
})
export class ContactRequestsModule {}
