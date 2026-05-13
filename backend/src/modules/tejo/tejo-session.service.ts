import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TejoSession, TejoSessionDocument, TejoSessionStatus } from './schemas/tejo-session.schema';

@Injectable()
export class TejoSessionService {
  constructor(
    @InjectModel(TejoSession.name)
    private readonly sessionModel: Model<TejoSessionDocument>,
  ) {}

  async create(data: {
    userId: string;
    channel: string;
    locale?: string;
    storefrontHost?: string;
  }): Promise<TejoSessionDocument> {
    const session = new this.sessionModel({
      userId: data.userId,
      channel: data.channel,
      locale: data.locale || 'ar',
      storefrontHost: data.storefrontHost,
      status: TejoSessionStatus.ACTIVE,
    });
    return session.save();
  }

  async findById(id: string): Promise<TejoSessionDocument | null> {
    return this.sessionModel.findById(id).exec();
  }

  async findByUserId(userId: string, channel: string): Promise<TejoSessionDocument | null> {
    return this.sessionModel
      .findOne({
        userId,
        channel,
        status: {
          $in: [
            TejoSessionStatus.ACTIVE,
            TejoSessionStatus.ESCALATION_SUGGESTED,
            TejoSessionStatus.ESCALATED,
          ],
        },
      })
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .exec();
  }

  async update(id: string, data: Partial<TejoSessionDocument>): Promise<TejoSessionDocument | null> {
    return this.sessionModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async incrementMessageCount(id: string): Promise<void> {
    await this.sessionModel.updateOne(
      { _id: id },
      { $inc: { messageCount: 1 }, $set: { lastMessageAt: new Date() } },
    );
  }

  async touchAfterMessage(id: string, preview: string): Promise<void> {
    await this.sessionModel.updateOne(
      { _id: id },
      {
        $inc: { messageCount: 1 },
        $set: {
          lastMessageAt: new Date(),
          lastMessagePreview: preview.slice(0, 160),
        },
      },
    );
  }

  async findByUserIdPaginated(
    userId: string,
    channel?: string,
    page = 1,
    limit = 20,
  ): Promise<{ sessions: TejoSessionDocument[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = { userId };

    if (channel) {
      query.channel = channel;
    }

    const [sessions, total] = await Promise.all([
      this.sessionModel
        .find(query)
        .sort({ lastMessageAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.sessionModel.countDocuments(query),
    ]);

    return {
      sessions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAllPaginated(
    filters: {
      status?: string;
      channel?: string;
      handoffSuggested?: boolean;
    } = {},
    page = 1,
    limit = 20,
  ): Promise<{ sessions: TejoSessionDocument[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = {};

    if (filters.status) query.status = filters.status;
    if (filters.channel) query.channel = filters.channel;
    if (filters.handoffSuggested !== undefined) query.handoffSuggested = filters.handoffSuggested;

    const [sessions, total] = await Promise.all([
      this.sessionModel
        .find(query)
        .sort({ lastMessageAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'firstName lastName email phone')
        .populate('supportTicketId', 'title status')
        .exec(),
      this.sessionModel.countDocuments(query),
    ]);

    return {
      sessions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    escalated: number;
    escalationSuggested: number;
    resolved: number;
    closed: number;
  }> {
    const stats = await this.sessionModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', TejoSessionStatus.ACTIVE] }, 1, 0] } },
          escalated: { $sum: { $cond: [{ $eq: ['$status', TejoSessionStatus.ESCALATED] }, 1, 0] } },
          escalationSuggested: {
            $sum: { $cond: [{ $eq: ['$status', TejoSessionStatus.ESCALATION_SUGGESTED] }, 1, 0] },
          },
          resolved: { $sum: { $cond: [{ $eq: ['$status', TejoSessionStatus.RESOLVED] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ['$status', TejoSessionStatus.CLOSED] }, 1, 0] } },
        },
      },
    ]);

    const base = stats[0] || { total: 0, active: 0, escalated: 0, escalationSuggested: 0, resolved: 0, closed: 0 };

    return {
      total: base.total,
      active: base.active,
      escalated: base.escalated,
      escalationSuggested: base.escalationSuggested,
      resolved: base.resolved,
      closed: base.closed,
    };
  }
}
