import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTejoPromptDto, UpdateTejoPromptDto } from './dto/tejo-prompt.dto';
import {
  TejoPrompt,
  TejoPromptDocument,
  TejoPromptStatus,
} from './schemas/tejo-prompt.schema';

@Injectable()
export class TejoPromptService {
  constructor(
    @InjectModel(TejoPrompt.name)
    private readonly tejoPromptModel: Model<TejoPromptDocument>,
  ) {}

  async listPrompts(): Promise<TejoPromptDocument[]> {
    return this.tejoPromptModel.find().sort({ updatedAt: -1 }).exec();
  }

  async getPromptById(id: string): Promise<TejoPromptDocument | null> {
    return this.tejoPromptModel.findById(id).exec();
  }

  async getActivePrompt(): Promise<TejoPromptDocument | null> {
    return this.tejoPromptModel.findOne({ status: TejoPromptStatus.ACTIVE }).sort({ updatedAt: -1 }).exec();
  }

  async createPrompt(dto: CreateTejoPromptDto, userId: string): Promise<TejoPromptDocument> {
    const currentVersion = await this.tejoPromptModel.countDocuments({ name: dto.name });

    const prompt = new this.tejoPromptModel({
      name: dto.name,
      body: dto.body,
      modelHint: dto.modelHint,
      metadata: dto.metadata || {},
      version: currentVersion + 1,
      status: dto.activate ? TejoPromptStatus.ACTIVE : TejoPromptStatus.DRAFT,
      activatedBy: dto.activate ? userId : undefined,
      activatedAt: dto.activate ? new Date() : undefined,
    });

    const saved = await prompt.save();

    if (dto.activate) {
      await this.activatePrompt(saved._id.toString(), userId);
      return (await this.tejoPromptModel.findById(saved._id).exec()) as TejoPromptDocument;
    }

    return saved;
  }

  async updatePrompt(id: string, dto: UpdateTejoPromptDto, userId: string): Promise<TejoPromptDocument | null> {
    const update: Record<string, unknown> = {
      ...(dto.name ? { name: dto.name } : {}),
      ...(dto.body ? { body: dto.body } : {}),
      ...(dto.modelHint ? { modelHint: dto.modelHint } : {}),
      ...(dto.metadata ? { metadata: dto.metadata } : {}),
      ...(dto.status ? { status: dto.status } : {}),
    };

    const prompt = await this.tejoPromptModel.findByIdAndUpdate(id, update, { new: true }).exec();

    if (!prompt) {
      return null;
    }

    if (dto.activate) {
      await this.activatePrompt(id, userId);
      return this.tejoPromptModel.findById(id).exec();
    }

    return prompt;
  }

  async activatePrompt(id: string, userId: string): Promise<void> {
    await this.tejoPromptModel.updateMany(
      { _id: { $ne: id }, status: TejoPromptStatus.ACTIVE },
      { $set: { status: TejoPromptStatus.ARCHIVED } },
    );

    await this.tejoPromptModel.updateOne(
      { _id: id },
      {
        $set: {
          status: TejoPromptStatus.ACTIVE,
          activatedBy: userId,
          activatedAt: new Date(),
        },
      },
    );
  }
}

