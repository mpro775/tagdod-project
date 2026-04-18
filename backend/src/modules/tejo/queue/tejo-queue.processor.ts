import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from 'bull';
import { Model } from 'mongoose';
import { Product, ProductStatus } from '../../products/schemas/product.schema';
import { TejoReindexScope } from '../dto/tejo-reindex.dto';
import { TejoLlmRouterService } from '../adapters/tejo-llm-router.service';
import {
  TEJO_EMBEDDINGS_QUEUE,
  TEJO_EMBEDDING_REINDEX_JOB,
} from './tejo-queue.constants';
import {
  TejoEmbeddingReindexJobData,
} from './tejo-queue.service';
import {
  TejoProductEmbedding,
  TejoProductEmbeddingDocument,
} from '../schemas/tejo-product-embedding.schema';
import { TejoKbEmbedding, TejoKbEmbeddingDocument } from '../schemas/tejo-kb-embedding.schema';

@Processor(TEJO_EMBEDDINGS_QUEUE)
export class TejoQueueProcessor {
  private readonly logger = new Logger(TejoQueueProcessor.name);

  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,
    @InjectModel(TejoProductEmbedding.name)
    private readonly productEmbeddingModel: Model<TejoProductEmbeddingDocument>,
    @InjectModel(TejoKbEmbedding.name)
    private readonly kbEmbeddingModel: Model<TejoKbEmbeddingDocument>,
    private readonly llmRouterService: TejoLlmRouterService,
  ) {}

  @Process(TEJO_EMBEDDING_REINDEX_JOB)
  async handleReindex(job: Job<TejoEmbeddingReindexJobData>): Promise<void> {
    const { scope = TejoReindexScope.ALL, full = false } = job.data;
    this.logger.log(`Tejo reindex job started: scope=${scope}, full=${String(full)}`);

    if (scope === TejoReindexScope.ALL || scope === TejoReindexScope.PRODUCTS) {
      await this.reindexProducts(full);
    }

    if (scope === TejoReindexScope.ALL || scope === TejoReindexScope.KB) {
      await this.reindexKb(full);
    }

    this.logger.log('Tejo reindex job completed');
  }

  private async reindexProducts(full: boolean): Promise<void> {
    const query: Record<string, unknown> = {
      status: ProductStatus.ACTIVE,
      deletedAt: null,
    };

    if (!full) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      query.updatedAt = { $gte: oneDayAgo };
    }

    const products = await this.productModel
      .find(query)
      .select('_id name nameEn description descriptionEn basePriceUSD basePriceSAR basePriceYER')
      .lean();

    if (products.length === 0) {
      return;
    }

    const texts = products.map((product) => {
      const price = [product.basePriceUSD, product.basePriceSAR, product.basePriceYER]
        .filter((value) => typeof value === 'number')
        .join(' | ');

      return [product.name, product.nameEn, product.description, product.descriptionEn, price]
        .filter(Boolean)
        .join('\n');
    });

    const { response } = await this.llmRouterService.embed({ texts });

    const operations = products.map((product, index) => ({
      updateOne: {
        filter: { productId: product._id.toString() },
        update: {
          $set: {
            productId: product._id.toString(),
            text: texts[index],
            vector: response.vectors[index] || [],
            model: response.model,
            locale: 'ar,en',
            tokenCount: texts[index].length,
          },
        },
        upsert: true,
      },
    }));

    if (operations.length > 0) {
      await this.productEmbeddingModel.bulkWrite(operations);
    }
  }

  private async reindexKb(full: boolean): Promise<void> {
    type KnowledgeReindexItem = {
      key: string;
      text: string;
      locale?: string;
      metadata?: Record<string, unknown>;
    };

    const seedEntries = [
      {
        key: 'faq_delivery',
        text: 'Delivery times depend on location and stock availability. You can follow up with support for urgent orders.',
        locale: 'en',
        metadata: { source: 'seed' },
      },
      {
        key: 'faq_installation',
        text: 'Installation requests are assigned to available engineers and scheduled after confirmation.',
        locale: 'en',
        metadata: { source: 'seed' },
      },
      {
        key: 'faq_warranty',
        text: 'Warranty coverage depends on product type and supplier policy, check product details and support ticket notes.',
        locale: 'en',
        metadata: { source: 'seed' },
      },
    ] as KnowledgeReindexItem[];

    const incrementalFilter = full
      ? {}
      : {
          updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        };

    let kbEntries = (await this.kbEmbeddingModel
      .find(incrementalFilter)
      .select('key text locale metadata')
      .lean()) as KnowledgeReindexItem[];

    if (kbEntries.length === 0 && full) {
      kbEntries = seedEntries;
    }

    if (kbEntries.length === 0) {
      return;
    }

    const { response } = await this.llmRouterService.embed({
      texts: kbEntries.map((entry) => String(entry.text || '')),
    });

    const operations = kbEntries.map((entry, index) => ({
      updateOne: {
        filter: { key: entry.key },
        update: {
          $set: {
            key: entry.key,
            text: entry.text,
            vector: response.vectors[index] || [],
            model: response.model,
            locale: entry.locale || 'ar,en',
            metadata: entry.metadata || {},
          },
        },
        upsert: true,
      },
    }));

    if (operations.length > 0) {
      await this.kbEmbeddingModel.bulkWrite(operations);
    }
  }
}

