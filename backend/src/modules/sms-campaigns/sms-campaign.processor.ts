import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { InjectQueue } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { Model, Types } from 'mongoose';
import { SMSAdapter } from '../notifications/adapters/sms.adapter';
import {
  SMS_CAMPAIGN_QUEUE,
  SMS_CAMPAIGN_SEND_JOB,
  SmsCampaignJobData,
  SmsCampaignStatus,
  SmsRecipientStatus,
} from './sms-campaign.constants';
import { SmsCampaign, SmsCampaignDocument } from './schemas/sms-campaign.schema';
import {
  SmsCampaignRecipient,
  SmsCampaignRecipientDocument,
} from './schemas/sms-campaign-recipient.schema';
import { SmsCampaignsService } from './sms-campaigns.service';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Processor(SMS_CAMPAIGN_QUEUE)
export class SmsCampaignProcessor {
  private readonly logger = new Logger(SmsCampaignProcessor.name);

  constructor(
    @InjectModel(SmsCampaign.name)
    private readonly campaignModel: Model<SmsCampaignDocument>,
    @InjectModel(SmsCampaignRecipient.name)
    private readonly recipientModel: Model<SmsCampaignRecipientDocument>,
    @InjectQueue(SMS_CAMPAIGN_QUEUE)
    private readonly smsQueue: Queue,
    private readonly smsAdapter: SMSAdapter,
    private readonly configService: ConfigService,
    private readonly campaignsService: SmsCampaignsService,
  ) {}

  @Process(SMS_CAMPAIGN_SEND_JOB)
  async handleCampaign(job: Job<SmsCampaignJobData>): Promise<void> {
    const { campaignId } = job.data;
    const campaign = await this.campaignModel.findById(campaignId);
    if (!campaign) {
      this.logger.warn(`SMS campaign ${campaignId} was not found`);
      return;
    }

    if (campaign.status === SmsCampaignStatus.CANCELLED) {
      await this.skipQueued(campaignId, 'Campaign cancelled');
      return;
    }

    if (campaign.status === SmsCampaignStatus.PAUSED) {
      return;
    }

    const batchSize = this.configService.get<number>('SMS_CAMPAIGN_BATCH_SIZE') || 50;
    const batchDelayMs = this.configService.get<number>('SMS_CAMPAIGN_BATCH_DELAY_MS') || 1000;
    const rateLimit = this.configService.get<number>('SMS_CAMPAIGN_RATE_LIMIT_PER_SECOND') || 5;
    const perMessageDelayMs = Math.ceil(1000 / Math.max(rateLimit, 1));

    await this.campaignModel.updateOne(
      { _id: campaign._id },
      {
        $set: {
          status: SmsCampaignStatus.SENDING,
          startedAt: campaign.startedAt || new Date(),
          lastJobId: String(job.id),
        },
        $inc: { jobRunCount: 1 },
      },
    );

    const recipients = await this.recipientModel
      .find({
        campaignId: new Types.ObjectId(campaignId),
        status: SmsRecipientStatus.QUEUED,
      })
      .sort({ createdAt: 1 })
      .limit(batchSize)
      .exec();

    for (const recipient of recipients) {
      const latestCampaign = await this.campaignModel
        .findById(campaignId)
        .select('status')
        .lean();

      if (latestCampaign?.status === SmsCampaignStatus.PAUSED) {
        await this.campaignsService.recalculateCounts(campaignId);
        return;
      }

      if (latestCampaign?.status === SmsCampaignStatus.CANCELLED) {
        await this.skipQueued(campaignId, 'Campaign cancelled');
        await this.campaignsService.recalculateCounts(campaignId);
        return;
      }

      await this.sendRecipient(recipient);
      if (perMessageDelayMs > 0) {
        await sleep(perMessageDelayMs);
      }
    }

    await this.campaignsService.recalculateCounts(campaignId);
    const remaining = await this.recipientModel.countDocuments({
      campaignId: new Types.ObjectId(campaignId),
      status: SmsRecipientStatus.QUEUED,
    });

    if (remaining > 0) {
      const nextJob = await this.smsQueue.add(
        SMS_CAMPAIGN_SEND_JOB,
        { campaignId, retryFailedOnly: job.data.retryFailedOnly },
        { attempts: 1, delay: batchDelayMs, removeOnComplete: true, removeOnFail: 20 },
      );
      await this.campaignModel.updateOne(
        { _id: campaignId, status: SmsCampaignStatus.SENDING },
        { $set: { status: SmsCampaignStatus.QUEUED, lastJobId: String(nextJob.id) } },
      );
      return;
    }

    const failed = await this.recipientModel.countDocuments({
      campaignId: new Types.ObjectId(campaignId),
      status: SmsRecipientStatus.FAILED,
    });
    await this.campaignModel.updateOne(
      { _id: campaignId, status: { $ne: SmsCampaignStatus.CANCELLED } },
      {
        $set: {
          status: failed > 0 ? SmsCampaignStatus.FAILED : SmsCampaignStatus.COMPLETED,
          completedAt: new Date(),
          failedAt: failed > 0 ? new Date() : undefined,
        },
      },
    );
  }

  private async sendRecipient(recipient: SmsCampaignRecipientDocument): Promise<void> {
    const now = new Date();
    await this.recipientModel.updateOne(
      { _id: recipient._id, status: SmsRecipientStatus.QUEUED },
      {
        $set: {
          status: SmsRecipientStatus.SENDING,
          lastAttemptAt: now,
        },
        $inc: { attempts: 1 },
      },
    );

    const result = await this.smsAdapter.sendSMS({
      to: recipient.normalizedPhone,
      message: recipient.message,
    });

    if (result.success) {
      await this.recipientModel.updateOne(
        { _id: recipient._id },
        {
          $set: {
            status: SmsRecipientStatus.SENT,
            sentAt: new Date(),
            providerMessageId: result.messageId,
          },
          $unset: { errorMessage: 1, errorCode: 1, failedAt: 1 },
        },
      );
      return;
    }

    await this.recipientModel.updateOne(
      { _id: recipient._id },
      {
        $set: {
          status: SmsRecipientStatus.FAILED,
          failedAt: new Date(),
          errorMessage: (result.error || 'SMS provider failed').slice(0, 500),
          errorCode: 'PROVIDER_FAILED',
        },
      },
    );
  }

  private async skipQueued(campaignId: string, reason: string): Promise<void> {
    await this.recipientModel.updateMany(
      { campaignId: new Types.ObjectId(campaignId), status: SmsRecipientStatus.QUEUED },
      {
        $set: {
          status: SmsRecipientStatus.SKIPPED,
          skippedAt: new Date(),
          errorMessage: reason,
        },
      },
    );
  }
}
