import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { QdrantClient } from '@qdrant/js-client-rest';

type VectorPayload = {
  tenantId: string;
  sourceType: 'product' | 'kb';
  sourceId: string;
  title?: string;
  text: string;
  locale?: string;
  metadata?: Record<string, unknown>;
};

@Injectable()
export class TejoVectorStoreService {
  private readonly logger = new Logger(TejoVectorStoreService.name);
  private readonly collection: string;
  private readonly vectorSize: number;
  private readonly url?: string;
  private readonly apiKey?: string;
  private client?: QdrantClient;

  constructor() {
    this.url = process.env.QDRANT_URL;
    this.apiKey = process.env.QDRANT_API_KEY;
    this.collection = process.env.QDRANT_COLLECTION || 'tejo_knowledge';
    this.vectorSize = Number(process.env.QDRANT_VECTOR_SIZE || 384);
  }

  async ensureCollection(): Promise<void> {
    const client = this.getClient();
    const collections = await client.getCollections();
    const exists = collections.collections.some(
      (collection) => collection.name === this.collection,
    );

    if (!exists) {
      await client.createCollection(this.collection, {
        vectors: {
          size: this.vectorSize,
          distance: 'Cosine',
        },
      });
    }
  }

  async upsertPoint(id: string, vector: number[], payload: VectorPayload): Promise<void> {
    if (vector.length === 0) {
      this.logger.warn(`Skipping Qdrant upsert for ${id}: empty vector`);
      return;
    }

    await this.ensureCollection();

    await this.getClient().upsert(this.collection, {
      points: [
        {
          id: this.toPointId(id),
          vector,
          payload,
        },
      ],
    });
  }

  async upsertPoints(
    points: Array<{
      id: string;
      vector: number[];
      payload: VectorPayload;
    }>,
  ): Promise<void> {
    const validPoints = points.filter((point) => point.vector.length > 0);
    if (validPoints.length === 0) {
      return;
    }

    await this.ensureCollection();

    await this.getClient().upsert(this.collection, {
      points: validPoints.map((point) => ({
        ...point,
        id: this.toPointId(point.id),
      })),
    });
  }

  async search(params: {
    tenantId: string;
    vector: number[];
    limit?: number;
    sourceType?: 'product' | 'kb';
  }): Promise<Array<{ score: number; payload: Record<string, unknown> }>> {
    await this.ensureCollection();

    const must: any[] = [
      {
        key: 'tenantId',
        match: {
          value: params.tenantId,
        },
      },
    ];

    if (params.sourceType) {
      must.push({
        key: 'sourceType',
        match: {
          value: params.sourceType,
        },
      });
    }

    const result = await this.getClient().search(this.collection, {
      vector: params.vector,
      limit: params.limit || 8,
      with_payload: true,
      filter: {
        must,
      },
    });

    return result.map((item) => ({
      score: item.score,
      payload: (item.payload || {}) as Record<string, unknown>,
    }));
  }

  private getClient(): QdrantClient {
    if (!this.url) {
      throw new Error('QDRANT_URL is missing');
    }

    if (!this.client) {
      this.client = new QdrantClient({
        url: this.url,
        apiKey: this.apiKey,
      });
    }

    return this.client;
  }

  private toPointId(id: string): string {
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      return id;
    }

    const hash = createHash('sha1').update(id).digest('hex');
    return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-5${hash.slice(13, 16)}-a${hash.slice(
      17,
      20,
    )}-${hash.slice(20, 32)}`;
  }
}
