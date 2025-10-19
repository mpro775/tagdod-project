import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerSupportController } from './customer.controller';
import { AdminSupportController } from './admin.controller';
import { SupportService } from './support.service';
import { SupportTicket, SupportTicketSchema } from './schemas/support-ticket.schema';
import { SupportMessage, SupportMessageSchema } from './schemas/support-message.schema';
import { CannedResponse, CannedResponseSchema } from './schemas/canned-response.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SupportTicket.name, schema: SupportTicketSchema },
      { name: SupportMessage.name, schema: SupportMessageSchema },
      { name: CannedResponse.name, schema: CannedResponseSchema },
    ]),
    AuthModule,
  ],
  controllers: [CustomerSupportController, AdminSupportController],
  providers: [SupportService],
  exports: [SupportService], // Export for use in other modules
})
export class SupportModule {}
