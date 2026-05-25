import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Queue } from 'bull';
import { FilterQuery, Model, Types } from 'mongoose';
import { SMSAdapter } from '../notifications/adapters/sms.adapter';
import { CapabilityStatus, User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { CreateSmsCampaignDto } from './dto/create-sms-campaign.dto';
import { ListSmsCampaignRecipientsDto } from './dto/list-sms-campaign-recipients.dto';
import { ListSmsCampaignsDto } from './dto/list-sms-campaigns.dto';
import { PreviewSmsCampaignDto } from './dto/preview-sms-campaign.dto';
import { SendTestSmsDto } from './dto/send-test-sms.dto';
import {
  SMS_CAMPAIGN_QUEUE,
  SMS_CAMPAIGN_SEND_JOB,
  SmsCampaignStatus,
  SmsCampaignTarget,
  SmsProviderName,
  SmsRecipientStatus,
} from './sms-campaign.constants';
import { SmsCampaign, SmsCampaignDocument } from './schemas/sms-campaign.schema';
import {
  SmsCampaignRecipient,
  SmsCampaignRecipientDocument,
} from './schemas/sms-campaign-recipient.schema';
import { SmsCampaignTest, SmsCampaignTestDocument } from './schemas/sms-campaign-test.schema';
import { calculateSmsSegments } from './utils/sms-segments.util';
import { normalizeYemeniPhone } from './utils/sms-phone.util';
import { buildTargetQuery } from './utils/sms-target-query.util';

interface PreparedRecipient {
  userId: Types.ObjectId;
  userName?: string;
  phone: string;
  normalizedPhone: string;
}

@Injectable()
export class SmsCampaignsService {
  constructor(
    @InjectModel(SmsCampaign.name)
    private readonly campaignModel: Model<SmsCampaignDocument>,
    @InjectModel(SmsCampaignRecipient.name)
    private readonly recipientModel: Model<SmsCampaignRecipientDocument>,
    @InjectModel(SmsCampaignTest.name)
    private readonly testModel: Model<SmsCampaignTestDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectQueue(SMS_CAMPAIGN_QUEUE)
    private readonly smsQueue: Queue,
    private readonly smsAdapter: SMSAdapter,
    private readonly configService: ConfigService,
  ) {}

  private ensureEnabled(): void {
    if (this.configService.get<boolean>('SMS_CAMPAIGNS_ENABLED') === false) {
      throw new ServiceUnavailableException('SMS campaigns are disabled');
    }
  }

  private maxMessageLength(): number {
    return this.configService.get<number>('SMS_CAMPAIGN_MAX_MESSAGE_LENGTH') || 500;
  }

  private maxRecipients(): number {
    return this.configService.get<number>('SMS_CAMPAIGN_MAX_RECIPIENTS') || 50000;
  }

  private getUserName(user: Partial<User>): string | undefined {
    return [user.firstName, user.lastName].filter(Boolean).join(' ') || undefined;
  }

  private async prepareRecipients(dto: PreviewSmsCampaignDto): Promise<{
    totalMatchedUsers: number;
    validRecipients: PreparedRecipient[];
    invalidSamples: Array<{ userId: string; phone?: string; reason: string }>;
    duplicateSamples: Array<{ phone: string; normalizedPhone: string }>;
    invalidRecipients: number;
    duplicatePhones: number;
  }> {
    const query = buildTargetQuery(dto);
    const users = await this.userModel
      .find(query)
      .select('_id firstName lastName phone')
      .limit(this.maxRecipients() + 1)
      .lean();

    if (users.length > this.maxRecipients()) {
      throw new BadRequestException(`SMS campaign recipients exceed ${this.maxRecipients()}`);
    }

    const seenPhones = new Set<string>();
    const validRecipients: PreparedRecipient[] = [];
    const invalidSamples: Array<{ userId: string; phone?: string; reason: string }> = [];
    const duplicateSamples: Array<{ phone: string; normalizedPhone: string }> = [];
    let invalidRecipients = 0;
    let duplicatePhones = 0;

    for (const user of users) {
      const normalized = normalizeYemeniPhone(user.phone);
      if (!normalized.valid || !normalized.normalized) {
        invalidRecipients++;
        if (invalidSamples.length < 10) {
          invalidSamples.push({
            userId: String(user._id),
            phone: user.phone,
            reason: normalized.reason || 'INVALID_PHONE',
          });
        }
        continue;
      }

      if (seenPhones.has(normalized.normalized)) {
        duplicatePhones++;
        if (duplicateSamples.length < 10) {
          duplicateSamples.push({ phone: user.phone, normalizedPhone: normalized.normalized });
        }
        continue;
      }

      seenPhones.add(normalized.normalized);
      validRecipients.push({
        userId: user._id,
        userName: this.getUserName(user),
        phone: user.phone,
        normalizedPhone: normalized.normalized,
      });
    }

    return {
      totalMatchedUsers: users.length,
      validRecipients,
      invalidSamples,
      duplicateSamples,
      invalidRecipients,
      duplicatePhones,
    };
  }

  async preview(dto: PreviewSmsCampaignDto) {
    this.ensureEnabled();
    if (dto.message.length > this.maxMessageLength()) {
      throw new BadRequestException(`Message length exceeds ${this.maxMessageLength()} characters`);
    }

    const prepared = await this.prepareRecipients(dto);
    const segments = calculateSmsSegments(dto.message);

    return {
      totalMatchedUsers: prepared.totalMatchedUsers,
      totalRecipients: prepared.validRecipients.length,
      validRecipients: prepared.validRecipients.length,
      invalidRecipients: prepared.invalidRecipients,
      duplicatePhones: prepared.duplicatePhones,
      encoding: segments.encoding,
      messageLength: segments.length,
      segmentsPerMessage: segments.segments,
      estimatedTotalSmsParts: prepared.validRecipients.length * segments.segments,
      invalidSamples: prepared.invalidSamples,
      duplicateSamples: prepared.duplicateSamples,
      sampleRecipients: prepared.validRecipients.slice(0, 10),
    };
  }

  async sendTest(dto: SendTestSmsDto, createdBy: string) {
    this.ensureEnabled();
    if (dto.message.length > this.maxMessageLength()) {
      throw new BadRequestException(`Message length exceeds ${this.maxMessageLength()} characters`);
    }

    const normalized = normalizeYemeniPhone(dto.phone);
    if (!normalized.valid || !normalized.normalized) {
      throw new BadRequestException(normalized.reason || 'INVALID_PHONE');
    }

    const result = await this.smsAdapter.sendSMS({
      to: normalized.normalized,
      message: dto.message,
    });

    const test = await this.testModel.create({
      createdBy: new Types.ObjectId(createdBy),
      phone: dto.phone,
      normalizedPhone: normalized.normalized,
      message: dto.message,
      success: result.success,
      providerMessageId: result.messageId,
      errorMessage: result.error,
    });

    return {
      success: result.success,
      testId: test._id,
      providerMessageId: result.messageId,
      errorMessage: result.error,
    };
  }

  async create(dto: CreateSmsCampaignDto, createdBy: string) {
    this.ensureEnabled();
    if (!dto.confirmSend) {
      throw new BadRequestException('confirmSend is required to create an SMS campaign');
    }
    if (dto.message.length > this.maxMessageLength()) {
      throw new BadRequestException(`Message length exceeds ${this.maxMessageLength()} characters`);
    }

    const requireTest =
      this.configService.get<boolean>('SMS_CAMPAIGN_REQUIRE_TEST_BEFORE_SEND') !== false;
    if (requireTest) {
      const lastSuccessfulTest = await this.testModel.exists({
        createdBy: new Types.ObjectId(createdBy),
        message: dto.message,
        success: true,
      });
      if (!lastSuccessfulTest) {
        throw new BadRequestException('A successful test SMS is required before sending');
      }
    }

    const prepared = await this.prepareRecipients(dto);
    if (prepared.validRecipients.length === 0) {
      throw new BadRequestException('No valid recipients matched this campaign');
    }

    const segments = calculateSmsSegments(dto.message);
    const campaign = await this.campaignModel.create({
      title: dto.title,
      message: dto.message,
      target: dto.target,
      filters: dto.filters || {},
      status: SmsCampaignStatus.QUEUED,
      provider: SmsProviderName.ALAWAEL,
      createdBy: new Types.ObjectId(createdBy),
      totalMatchedUsers: prepared.totalMatchedUsers,
      totalRecipients: prepared.validRecipients.length,
      validRecipients: prepared.validRecipients.length,
      invalidRecipients: prepared.invalidRecipients,
      duplicatePhones: prepared.duplicatePhones,
      queuedCount: prepared.validRecipients.length,
      encoding: segments.encoding,
      messageLength: segments.length,
      segmentsPerMessage: segments.segments,
      estimatedTotalSmsParts: prepared.validRecipients.length * segments.segments,
      testSent: true,
    });

    const recipientDocs = prepared.validRecipients.map((recipient) => ({
      campaignId: campaign._id,
      userId: recipient.userId,
      userName: recipient.userName,
      phone: recipient.phone,
      normalizedPhone: recipient.normalizedPhone,
      message: dto.message,
      status: SmsRecipientStatus.QUEUED,
      provider: SmsProviderName.ALAWAEL,
    }));

    await this.recipientModel.insertMany(recipientDocs, { ordered: false });

    const job = await this.smsQueue.add(
      SMS_CAMPAIGN_SEND_JOB,
      { campaignId: String(campaign._id) },
      {
        attempts: 1,
        removeOnComplete: true,
        removeOnFail: 20,
      },
    );

    await this.campaignModel.updateOne(
      { _id: campaign._id },
      { $set: { lastJobId: String(job.id) } },
    );

    return this.findOne(String(campaign._id));
  }

  async list(dto: ListSmsCampaignsDto) {
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const query: FilterQuery<SmsCampaign> = {};

    if (dto.status) query.status = dto.status;
    if (dto.q) {
      query.$or = [
        { title: { $regex: dto.q, $options: 'i' } },
        { message: { $regex: dto.q, $options: 'i' } },
      ];
    }
    if (dto.from || dto.to) {
      query.createdAt = {};
      if (dto.from) query.createdAt.$gte = new Date(dto.from);
      if (dto.to) query.createdAt.$lte = new Date(dto.to);
    }

    const [campaigns, total, stats] = await Promise.all([
      this.campaignModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.campaignModel.countDocuments(query),
      this.campaignModel.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    return {
      campaigns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total,
        sending: stats
          .filter((item) => [SmsCampaignStatus.QUEUED, SmsCampaignStatus.SENDING].includes(item._id))
          .reduce((sum, item) => sum + item.count, 0),
        completed: stats.find((item) => item._id === SmsCampaignStatus.COMPLETED)?.count || 0,
        failedOrStopped: stats
          .filter((item) =>
            [SmsCampaignStatus.FAILED, SmsCampaignStatus.PAUSED, SmsCampaignStatus.CANCELLED].includes(
              item._id,
            ),
          )
          .reduce((sum, item) => sum + item.count, 0),
      },
    };
  }

  async findOne(id: string) {
    const campaign = await this.campaignModel.findById(id).lean();
    if (!campaign) {
      throw new NotFoundException('SMS campaign not found');
    }
    return campaign;
  }

  async listRecipients(campaignId: string, dto: ListSmsCampaignRecipientsDto) {
    await this.findOne(campaignId);
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const query: FilterQuery<SmsCampaignRecipient> = {
      campaignId: new Types.ObjectId(campaignId),
    };

    if (dto.status) query.status = dto.status;
    if (dto.q) {
      query.$or = [
        { phone: { $regex: dto.q, $options: 'i' } },
        { normalizedPhone: { $regex: dto.q, $options: 'i' } },
        { userName: { $regex: dto.q, $options: 'i' } },
      ];
    }

    const [recipients, total] = await Promise.all([
      this.recipientModel
        .find(query)
        .sort({ createdAt: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.recipientModel.countDocuments(query),
    ]);

    return {
      recipients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async pause(id: string) {
    await this.campaignModel.updateOne(
      { _id: id, status: { $in: [SmsCampaignStatus.QUEUED, SmsCampaignStatus.SENDING] } },
      { $set: { status: SmsCampaignStatus.PAUSED, pausedAt: new Date() } },
    );
    return this.findOne(id);
  }

  async resume(id: string) {
    const campaign = await this.findOne(id);
    if (campaign.status !== SmsCampaignStatus.PAUSED) {
      throw new BadRequestException('Only paused campaigns can be resumed');
    }
    await this.campaignModel.updateOne(
      { _id: id },
      { $set: { status: SmsCampaignStatus.QUEUED }, $unset: { pausedAt: 1 } },
    );
    const job = await this.smsQueue.add(SMS_CAMPAIGN_SEND_JOB, { campaignId: id }, { attempts: 1 });
    await this.campaignModel.updateOne({ _id: id }, { $set: { lastJobId: String(job.id) } });
    return this.findOne(id);
  }

  async cancel(id: string) {
    await this.findOne(id);
    await this.campaignModel.updateOne(
      { _id: id },
      { $set: { status: SmsCampaignStatus.CANCELLED, cancelledAt: new Date() } },
    );
    await this.recipientModel.updateMany(
      { campaignId: new Types.ObjectId(id), status: SmsRecipientStatus.QUEUED },
      {
        $set: {
          status: SmsRecipientStatus.SKIPPED,
          skippedAt: new Date(),
          errorMessage: 'Campaign cancelled',
        },
      },
    );
    await this.recalculateCounts(id);
    return this.findOne(id);
  }

  async retryFailed(id: string) {
    const campaign = await this.findOne(id);
    if (campaign.status === SmsCampaignStatus.CANCELLED) {
      throw new BadRequestException('Cancelled campaigns cannot be retried');
    }

    const failedCount = await this.recipientModel.countDocuments({
      campaignId: new Types.ObjectId(id),
      status: SmsRecipientStatus.FAILED,
    });
    if (!failedCount) {
      throw new BadRequestException('No failed recipients to retry');
    }

    await this.recipientModel.updateMany(
      { campaignId: new Types.ObjectId(id), status: SmsRecipientStatus.FAILED },
      {
        $set: { status: SmsRecipientStatus.QUEUED },
        $unset: { errorMessage: 1, errorCode: 1, failedAt: 1 },
      },
    );
    await this.campaignModel.updateOne(
      { _id: id },
      { $set: { status: SmsCampaignStatus.QUEUED, completedAt: null, failedAt: null } },
    );
    await this.recalculateCounts(id);
    const job = await this.smsQueue.add(
      SMS_CAMPAIGN_SEND_JOB,
      { campaignId: id, retryFailedOnly: true },
      { attempts: 1 },
    );
    await this.campaignModel.updateOne({ _id: id }, { $set: { lastJobId: String(job.id) } });
    return this.findOne(id);
  }

  async exportCsv(id: string): Promise<string> {
    await this.findOne(id);
    const recipients = await this.recipientModel
      .find({ campaignId: new Types.ObjectId(id) })
      .sort({ createdAt: 1 })
      .lean();
    const rows = [
      ['phone', 'normalizedPhone', 'userName', 'status', 'attempts', 'providerMessageId', 'errorMessage'],
      ...recipients.map((recipient) => [
        recipient.phone || '',
        recipient.normalizedPhone || '',
        recipient.userName || '',
        recipient.status || '',
        String(recipient.attempts || 0),
        recipient.providerMessageId || '',
        recipient.errorMessage || '',
      ]),
    ];

    return rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(','),
      )
      .join('\n');
  }

  async recalculateCounts(campaignId: string): Promise<void> {
    const counts = await this.recipientModel.aggregate([
      { $match: { campaignId: new Types.ObjectId(campaignId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const get = (status: SmsRecipientStatus) =>
      counts.find((item) => item._id === status)?.count || 0;

    await this.campaignModel.updateOne(
      { _id: campaignId },
      {
        $set: {
          queuedCount: get(SmsRecipientStatus.QUEUED),
          sendingCount: get(SmsRecipientStatus.SENDING),
          sentCount: get(SmsRecipientStatus.SENT),
          failedCount: get(SmsRecipientStatus.FAILED),
          skippedCount: get(SmsRecipientStatus.SKIPPED),
        },
      },
    );
  }
}
