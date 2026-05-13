import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TejoMessage, TejoMessageDocument, TejoMessageRole } from './schemas/tejo-message.schema';

@Injectable()
export class TejoMessageService {
  constructor(
    @InjectModel(TejoMessage.name)
    private readonly messageModel: Model<TejoMessageDocument>,
  ) {}

  async create(data: {
    sessionId: string;
    userId: string;
    role: string;
    content: string;
    metadata?: Record<string, unknown>;
    payload?: Record<string, unknown> | null;
  }): Promise<TejoMessageDocument> {
    const message = new this.messageModel({
      sessionId: data.sessionId,
      userId: data.userId,
      role: data.role,
      content: data.content,
      metadata: data.metadata || {},
      payload: data.payload || null,
    });
    return message.save();
  }

  async findBySessionId(
    sessionId: string,
    page = 1,
    limit = 50,
  ): Promise<{ messages: TejoMessageDocument[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const [messages, total] = await Promise.all([
      this.messageModel
        .find({ sessionId })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.messageModel.countDocuments({ sessionId }),
    ]);

    return {
      messages,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBySessionIdRecent(sessionId: string, limit = 20): Promise<TejoMessageDocument[]> {
    return this.messageModel
      .find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async countBySessionId(sessionId: string): Promise<number> {
    return this.messageModel.countDocuments({ sessionId });
  }

  async countRetrievalFailuresBySessionId(sessionId: string): Promise<number> {
    return this.messageModel.countDocuments({
      sessionId,
      role: TejoMessageRole.ASSISTANT,
      'metadata.retrievalFailed': true,
    });
  }
}
