import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsCompleteModule } from '../notifications/notifications-complete.module';
import { User, UserSchema } from '../users/schemas/user.schema';
import {
  SMS_CAMPAIGN_QUEUE,
} from './sms-campaign.constants';
import { SmsCampaignsAdminController } from './sms-campaigns.admin.controller';
import { SmsCampaignProcessor } from './sms-campaign.processor';
import { SmsCampaignsService } from './sms-campaigns.service';
import { SmsCampaign, SmsCampaignSchema } from './schemas/sms-campaign.schema';
import {
  SmsCampaignRecipient,
  SmsCampaignRecipientSchema,
} from './schemas/sms-campaign-recipient.schema';
import { SmsCampaignTest, SmsCampaignTestSchema } from './schemas/sms-campaign-test.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SmsCampaign.name, schema: SmsCampaignSchema },
      { name: SmsCampaignRecipient.name, schema: SmsCampaignRecipientSchema },
      { name: SmsCampaignTest.name, schema: SmsCampaignTestSchema },
      { name: User.name, schema: UserSchema },
    ]),
    BullModule.registerQueue({
      name: SMS_CAMPAIGN_QUEUE,
      defaultJobOptions: {
        attempts: 1,
        removeOnComplete: true,
        removeOnFail: 20,
      },
    }),
    forwardRef(() => NotificationsCompleteModule),
  ],
  controllers: [SmsCampaignsAdminController],
  providers: [SmsCampaignsService, SmsCampaignProcessor],
  exports: [SmsCampaignsService],
})
export class SmsCampaignsModule {}
