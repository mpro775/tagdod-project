import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TejoAnalyticsSummary } from './tejo.types';
import { TejoConversation, TejoConversationDocument } from './schemas/tejo-conversation.schema';

type ConversationMetricsRow = {
  latencyMs?: number;
  confidence?: number;
  handoffTriggered?: boolean;
  metadata?: {
    retrieval?: {
      retrievalFailed?: boolean;
    };
  };
};

@Injectable()
export class TejoAnalyticsService {
  constructor(
    @InjectModel(TejoConversation.name)
    private readonly tejoConversationModel: Model<TejoConversationDocument>,
  ) {}

  async getSummary(): Promise<TejoAnalyticsSummary> {
    const rows = await this.tejoConversationModel
      .find()
      .select('latencyMs confidence handoffTriggered metadata.retrieval.retrievalFailed')
      .lean<ConversationMetricsRow[]>();

    const totalQueries = rows.length;
    if (totalQueries === 0) {
      return {
        totalQueries: 0,
        handoffCount: 0,
        handoffRate: 0,
        avgLatencyMs: 0,
        latencyP50Ms: 0,
        latencyP95Ms: 0,
        avgConfidence: 0,
        successRate: 0,
        deflectionRate: 0,
        errorRate: 0,
        confidenceDistribution: {
          low: 0,
          medium: 0,
          high: 0,
        },
      };
    }

    const latencies = rows.map((row) => this.toFiniteNumber(row.latencyMs)).sort((a, b) => a - b);
    const confidences = rows.map((row) => this.toBounded(this.toFiniteNumber(row.confidence), 0, 1));

    let handoffCount = 0;
    let successCount = 0;
    let retrievalFailureCount = 0;
    let lowConfidenceCount = 0;
    let mediumConfidenceCount = 0;
    let highConfidenceCount = 0;

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      const confidence = confidences[index];
      const retrievalFailed = Boolean(row.metadata?.retrieval?.retrievalFailed);

      if (row.handoffTriggered) {
        handoffCount += 1;
      }

      if (confidence >= 0.55 && !retrievalFailed) {
        successCount += 1;
      }

      if (retrievalFailed) {
        retrievalFailureCount += 1;
      }

      if (confidence < 0.4) {
        lowConfidenceCount += 1;
      } else if (confidence < 0.7) {
        mediumConfidenceCount += 1;
      } else {
        highConfidenceCount += 1;
      }
    }

    const avgLatencyMs = latencies.reduce((sum, value) => sum + value, 0) / totalQueries;
    const avgConfidence = confidences.reduce((sum, value) => sum + value, 0) / totalQueries;

    return {
      totalQueries,
      handoffCount,
      handoffRate: handoffCount / totalQueries,
      avgLatencyMs: Number(avgLatencyMs.toFixed(2)),
      latencyP50Ms: this.percentile(latencies, 0.5),
      latencyP95Ms: this.percentile(latencies, 0.95),
      avgConfidence: Number(avgConfidence.toFixed(4)),
      successRate: successCount / totalQueries,
      deflectionRate: (totalQueries - handoffCount) / totalQueries,
      errorRate: retrievalFailureCount / totalQueries,
      confidenceDistribution: {
        low: lowConfidenceCount,
        medium: mediumConfidenceCount,
        high: highConfidenceCount,
      },
    };
  }

  async listConversations(page = 1, limit = 20): Promise<{
    data: TejoConversationDocument[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.tejoConversationModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.tejoConversationModel.countDocuments(),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getConversationById(id: string): Promise<TejoConversationDocument | null> {
    return this.tejoConversationModel.findById(id).exec();
  }

  private percentile(values: number[], ratio: number): number {
    if (values.length === 0) {
      return 0;
    }

    const safeRatio = this.toBounded(ratio, 0, 1);
    const position = Math.ceil(safeRatio * values.length) - 1;
    const index = Math.max(0, Math.min(values.length - 1, position));
    return Number(values[index].toFixed(2));
  }

  private toFiniteNumber(value: unknown): number {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  }

  private toBounded(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }
}
