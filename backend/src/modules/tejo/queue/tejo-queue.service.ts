import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Job, JobCounts, Queue } from 'bull';
import {
  TEJO_EMBEDDINGS_QUEUE,
  TEJO_EMBEDDING_REINDEX_JOB,
} from './tejo-queue.constants';
import { TejoReindexScope } from '../dto/tejo-reindex.dto';

export interface TejoEmbeddingReindexJobData {
  scope: TejoReindexScope;
  full: boolean;
  reason?: string;
  triggeredBy?: string;
}

@Injectable()
export class TejoQueueService {
  constructor(
    @InjectQueue(TEJO_EMBEDDINGS_QUEUE)
    private readonly tejoEmbeddingsQueue: Queue<TejoEmbeddingReindexJobData>,
  ) {}

  async enqueueReindex(data: TejoEmbeddingReindexJobData): Promise<Job<TejoEmbeddingReindexJobData>> {
    return this.tejoEmbeddingsQueue.add(TEJO_EMBEDDING_REINDEX_JOB, data, {
      attempts: 2,
      removeOnComplete: 50,
      removeOnFail: 100,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  async getQueueStats(): Promise<JobCounts> {
    return this.tejoEmbeddingsQueue.getJobCounts();
  }
}

