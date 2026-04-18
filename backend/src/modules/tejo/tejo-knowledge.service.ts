import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateTejoKnowledgeDto,
  UpdateTejoKnowledgeDto,
} from './dto/tejo-knowledge.dto';
import { TejoLlmRouterService } from './adapters/tejo-llm-router.service';
import { TejoKbEmbedding, TejoKbEmbeddingDocument } from './schemas/tejo-kb-embedding.schema';

@Injectable()
export class TejoKnowledgeService {
  constructor(
    @InjectModel(TejoKbEmbedding.name)
    private readonly kbEmbeddingModel: Model<TejoKbEmbeddingDocument>,
    private readonly llmRouterService: TejoLlmRouterService,
  ) {}

  async listKnowledge(page = 1, limit = 20, q?: string): Promise<{
    data: TejoKbEmbeddingDocument[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(200, Math.max(1, Number(limit) || 20));
    const skip = (safePage - 1) * safeLimit;

    const filter: Record<string, unknown> = {};
    if (q && q.trim().length > 0) {
      const pattern = q.trim();
      filter.$or = [{ key: { $regex: pattern, $options: 'i' } }, { text: { $regex: pattern, $options: 'i' } }];
    }

    const [data, total] = await Promise.all([
      this.kbEmbeddingModel
        .find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .exec(),
      this.kbEmbeddingModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page: safePage,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  async getKnowledgeByKey(key: string): Promise<TejoKbEmbeddingDocument> {
    const found = await this.kbEmbeddingModel.findOne({ key }).exec();
    if (!found) {
      throw new NotFoundException(`Knowledge key "${key}" not found`);
    }
    return found;
  }

  async createKnowledge(
    dto: CreateTejoKnowledgeDto,
    userId: string,
  ): Promise<TejoKbEmbeddingDocument> {
    const existing = await this.kbEmbeddingModel.findOne({ key: dto.key }).exec();
    if (existing) {
      throw new ConflictException(`Knowledge key "${dto.key}" already exists`);
    }

    const embedResponse = await this.llmRouterService.embed({ texts: [dto.text] });
    const model = embedResponse.response.model;
    const vector = embedResponse.response.vectors[0] || [];

    return this.kbEmbeddingModel.create({
      key: dto.key,
      text: dto.text,
      vector,
      model,
      locale: dto.locale || 'ar,en',
      metadata: {
        ...(dto.metadata || {}),
        source: 'admin',
        updatedBy: userId,
      },
    });
  }

  async updateKnowledge(
    key: string,
    dto: UpdateTejoKnowledgeDto,
    userId: string,
  ): Promise<TejoKbEmbeddingDocument> {
    const existing = await this.getKnowledgeByKey(key);
    const updatedText = dto.text ?? existing.text;

    const embedResponse = await this.llmRouterService.embed({ texts: [updatedText] });
    const model = embedResponse.response.model;
    const vector = embedResponse.response.vectors[0] || [];

    existing.set('text', updatedText);
    existing.set('vector', vector);
    existing.set('model', model);

    if (dto.locale !== undefined) {
      existing.set('locale', dto.locale);
    }

    const nextMetadata =
      dto.metadata !== undefined
        ? {
            ...(existing.metadata || {}),
            ...dto.metadata,
            updatedBy: userId,
          }
        : {
            ...(existing.metadata || {}),
            updatedBy: userId,
          };

    existing.set('metadata', nextMetadata);

    await existing.save();
    return existing;
  }

  async deleteKnowledge(key: string): Promise<{ deleted: boolean }> {
    const result = await this.kbEmbeddingModel.deleteOne({ key }).exec();
    return { deleted: result.deletedCount > 0 };
  }
}
