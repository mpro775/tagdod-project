import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { ExchangeRateSyncJob, ExchangeRateSyncJobDocument, ExchangeRateSyncJobError, ExchangeRateSyncJobReason, ExchangeRateSyncJobStatus } from './schemas/exchange-rate-sync-job.schema';
import { ExchangeRatesService } from './exchange-rates.service';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Variant, VariantDocument } from '../products/schemas/variant.schema';
import { ProductPricingCalculatorService } from '../products/services/product-pricing-calculator.service';
import { ExchangeRate } from './schemas/exchange-rate.schema';
import {
  ExchangeRateException,
  ExchangeRateSyncJobNotFoundException,
  ExchangeRateSyncJobInvalidException,
  ExchangeRateSyncFailedException,
  ErrorCode,
  ProductNotFoundException,
} from '../../shared/exceptions';

const DEFAULT_BATCH_SIZE = 50;
const MAX_ERRORS_RECORDED = 50;

@Injectable()
export class ExchangeRateSyncService {
  private readonly logger = new Logger(ExchangeRateSyncService.name);
  private readonly processingJobs = new Set<string>();

  constructor(
    @InjectModel(ExchangeRateSyncJob.name)
    private readonly syncJobModel: Model<ExchangeRateSyncJobDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Variant.name)
    private readonly variantModel: Model<VariantDocument>,
    @Inject(forwardRef(() => ExchangeRatesService))
    private readonly exchangeRatesService: ExchangeRatesService,
    @Inject(forwardRef(() => ProductPricingCalculatorService))
    private readonly pricingCalculator: ProductPricingCalculatorService,
  ) {}

  async triggerSync(
    triggeredBy?: string,
    reason: ExchangeRateSyncJobReason = ExchangeRateSyncJobReason.RATE_UPDATE,
  ): Promise<ExchangeRateSyncJob> {
    const activeJob = await this.syncJobModel.findOne({
      status: { $in: [ExchangeRateSyncJobStatus.PENDING, ExchangeRateSyncJobStatus.RUNNING] },
    });

    if (activeJob) {
      this.logger.log(
        `Exchange rate sync already running (job ${activeJob._id.toString()}); returning existing job.`,
      );
      return activeJob;
    }

    const jobPayload: Partial<ExchangeRateSyncJob> = {
      status: ExchangeRateSyncJobStatus.PENDING,
      reason,
      enqueuedAt: new Date(),
    };

    if (triggeredBy && Types.ObjectId.isValid(triggeredBy)) {
      jobPayload.triggeredBy = new Types.ObjectId(triggeredBy);
    }

    const job = await this.syncJobModel.create(jobPayload);
    const jobId = job._id.toString();

    this.scheduleProcessing(jobId).catch((error) => {
      this.logger.error(`Failed to schedule exchange rate sync job ${jobId}`, error);
    });

    return job;
  }

  async listJobs(limit = 20): Promise<ExchangeRateSyncJob[]> {
    const numericLimit =
      typeof limit === 'number' && Number.isFinite(limit) ? Math.floor(limit) : 20;
    const boundedLimit = Math.min(Math.max(numericLimit, 1), 100);
    return this.syncJobModel
      .find()
      .sort({ createdAt: -1 })
      .limit(boundedLimit)
      .lean<ExchangeRateSyncJob[]>();
  }

  async getJob(jobId: string): Promise<ExchangeRateSyncJob | null> {
    if (!Types.ObjectId.isValid(jobId)) {
      return null;
    }

    return this.syncJobModel.findById(jobId).lean<ExchangeRateSyncJob | null>();
  }

  private async scheduleProcessing(jobId: string): Promise<void> {
    if (this.processingJobs.has(jobId)) {
      return;
    }

    this.processingJobs.add(jobId);

    setImmediate(() => {
      this.processJob(jobId)
        .catch((error) => {
          this.logger.error(`Exchange rate sync job ${jobId} failed`, error);
        })
        .finally(() => {
          this.processingJobs.delete(jobId);
        });
    });
  }

  private async processJob(jobId: string): Promise<void> {
    const job = await this.syncJobModel.findById(jobId);

    if (!job) {
      this.logger.warn(`Exchange rate sync job ${jobId} not found`);
      return;
    }

    if (job.status !== ExchangeRateSyncJobStatus.PENDING) {
      this.logger.log(`Exchange rate sync job ${jobId} skipped - status ${job.status}`);
      return;
    }

    const now = new Date();

    await this.syncJobModel.updateOne(
      { _id: jobId },
      {
        $set: {
          status: ExchangeRateSyncJobStatus.RUNNING,
          startedAt: now,
          processedProducts: 0,
          processedVariants: 0,
          failedProducts: 0,
          failedVariants: 0,
          errors: [],
        },
      },
    );

    let rates: ExchangeRate;
    try {
      rates = await this.exchangeRatesService.getCurrentRates();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Failed to load exchange rates for sync job', {
        error: err.message,
        stack: err.stack,
        jobId,
      });
      await this.failJob(jobId, `Failed to load exchange rates: ${this.stringifyError(error)}`);
      return;
    }

    const derivedMetadata = this.pricingCalculator.calculateDerivedPricing({}, rates);
    const exchangeRateVersion = derivedMetadata.exchangeRateVersion;

    const totalProducts = await this.productModel.countDocuments({
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    });

    await this.syncJobModel.updateOne(
      { _id: jobId },
      {
        $set: {
          exchangeRateVersion,
          totalProducts,
        },
      },
    );

    const syncSnapshot = new Date();

    try {
      await this.syncProducts(jobId, rates, exchangeRateVersion, syncSnapshot);

      await this.syncJobModel.updateOne(
        { _id: jobId },
        {
          $set: {
            status: ExchangeRateSyncJobStatus.COMPLETED,
            completedAt: new Date(),
          },
        },
      );

      this.logger.log(`Exchange rate sync job ${jobId} completed`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Exchange rate sync job failed', {
        error: err.message,
        stack: err.stack,
        jobId,
      });
      await this.failJob(jobId, this.stringifyError(error));
    }
  }

  private async syncProducts(
    jobId: string,
    rates: ExchangeRate,
    exchangeRateVersion: string | undefined,
    syncSnapshot: Date,
  ): Promise<void> {
    const batchSize = DEFAULT_BATCH_SIZE;
    let processedProducts = 0;
    let processedVariants = 0;
    let failedProducts = 0;
    let failedVariants = 0;
    let lastProcessedProductId: string | undefined;
    const errors: ExchangeRateSyncJobError[] = [];

    const baseFilter: FilterQuery<ProductDocument> = {
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    };

    while (true) {
      const query: FilterQuery<ProductDocument> = { ...baseFilter };
      if (lastProcessedProductId) {
        query._id = { $gt: new Types.ObjectId(lastProcessedProductId) };
      }

      const products = await this.productModel
        .find(query)
        .sort({ _id: 1 })
        .limit(batchSize)
        .lean<ProductDocument[]>();

      if (!products.length) {
        break;
      }

      for (const product of products) {
        const productId = product._id.toString();

        try {
          const productUpdates = await this.buildProductUpdatePayload(
            product,
            rates,
            exchangeRateVersion,
            syncSnapshot,
          );

          if (Object.keys(productUpdates).length > 0) {
            await this.productModel.updateOne(
              { _id: product._id },
              {
                $set: productUpdates,
              },
            );
          }

          const variantResult = await this.syncVariantsForProduct(
            product._id,
            rates,
            exchangeRateVersion,
            syncSnapshot,
          );

          processedVariants += variantResult.processed;
          failedVariants += variantResult.failed;
          if (variantResult.errors.length > 0) {
            errors.push(...variantResult.errors);
          }

          processedProducts += 1;
        } catch (error) {
          failedProducts += 1;
          if (errors.length < MAX_ERRORS_RECORDED) {
            errors.push({
              productId,
              message: this.stringifyError(error),
              occurredAt: new Date(),
            });
          }
          this.logger.error(
            `Failed to sync exchange rate derived prices for product ${productId}`,
            error instanceof Error ? error.stack : undefined,
          );
        }

        lastProcessedProductId = productId;
      }

      await this.syncJobModel.updateOne(
        { _id: jobId },
        {
          $set: {
            processedProducts,
            processedVariants,
            failedProducts,
            failedVariants,
            lastProcessedProductId,
            errors: errors.slice(-MAX_ERRORS_RECORDED),
          },
        },
      );
    }
  }

  private async buildProductUpdatePayload(
    product: ProductDocument,
    rates: ExchangeRate,
    exchangeRateVersion: string | undefined,
    syncSnapshot: Date,
  ): Promise<Record<string, unknown>> {
    const usdPricingExists =
      product.basePriceUSD !== undefined ||
      product.compareAtPriceUSD !== undefined ||
      product.costPriceUSD !== undefined;

    if (!usdPricingExists) {
      return exchangeRateVersion
        ? {
            exchangeRateVersion,
            lastExchangeRateSyncAt: syncSnapshot,
          }
        : {};
    }

    const derived = await this.pricingCalculator.calculateProductPricing(
      {
        basePriceUSD: product.basePriceUSD ?? undefined,
        compareAtPriceUSD: product.compareAtPriceUSD ?? undefined,
        costPriceUSD: product.costPriceUSD ?? undefined,
      },
      rates,
    );

    return {
      ...this.withoutUndefined({
        basePriceSAR: derived.basePriceSAR,
        basePriceYER: derived.basePriceYER,
        compareAtPriceSAR: derived.compareAtPriceSAR,
        compareAtPriceYER: derived.compareAtPriceYER,
        costPriceSAR: derived.costPriceSAR,
        costPriceYER: derived.costPriceYER,
        exchangeRateVersion: exchangeRateVersion ?? derived.exchangeRateVersion,
        lastExchangeRateSyncAt: syncSnapshot,
      }),
    };
  }

  private async syncVariantsForProduct(
    productId: Types.ObjectId,
    rates: ExchangeRate,
    exchangeRateVersion: string | undefined,
    syncSnapshot: Date,
  ): Promise<{
    processed: number;
    failed: number;
    errors: ExchangeRateSyncJobError[];
  }> {
    const variants = await this.variantModel
      .find({
        productId,
        $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
      })
      .lean<VariantDocument[]>();

    if (!variants.length) {
      return { processed: 0, failed: 0, errors: [] };
    }

    const bulkOps = [];
    let processed = 0;
    let failed = 0;
    const errors: ExchangeRateSyncJobError[] = [];

    for (const variant of variants) {
      const variantId = variant._id.toString();

      try {
        const derived = await this.pricingCalculator.calculateVariantPricing(
          {
            basePriceUSD: variant.basePriceUSD ?? undefined,
            compareAtPriceUSD: variant.compareAtPriceUSD ?? undefined,
            costPriceUSD: variant.costPriceUSD ?? undefined,
          },
          rates,
        );

        bulkOps.push({
          updateOne: {
            filter: { _id: variant._id },
            update: {
              $set: this.withoutUndefined({
                basePriceSAR: derived.basePriceSAR,
                basePriceYER: derived.basePriceYER,
                compareAtPriceSAR: derived.compareAtPriceSAR,
                compareAtPriceYER: derived.compareAtPriceYER,
                costPriceSAR: derived.costPriceSAR,
                costPriceYER: derived.costPriceYER,
                exchangeRateVersion: exchangeRateVersion ?? derived.exchangeRateVersion,
                lastExchangeRateSyncAt: syncSnapshot,
              }),
            },
          },
        });

        processed += 1;
      } catch (error) {
        failed += 1;
        if (errors.length < MAX_ERRORS_RECORDED) {
          errors.push({
            productId: productId.toString(),
            variantId,
            message: this.stringifyError(error),
            occurredAt: new Date(),
          });
        }
      }
    }

    if (bulkOps.length > 0) {
      await this.variantModel.bulkWrite(bulkOps, { ordered: false });
    }

    return { processed, failed, errors };
  }

  private async failJob(jobId: string, message: string): Promise<void> {
    this.logger.error(`Exchange rate sync job ${jobId} failed: ${message}`);

    await this.syncJobModel.updateOne(
      { _id: jobId },
      {
        $set: {
          status: ExchangeRateSyncJobStatus.FAILED,
          failedAt: new Date(),
        },
        $push: {
          errors: {
            $each: [
              {
                message,
                occurredAt: new Date(),
              },
            ],
            $slice: -MAX_ERRORS_RECORDED,
          },
        },
      },
    );
  }

  async retryProduct(jobId: string, productId: string): Promise<ExchangeRateSyncJob | null> {
    try {
      if (!Types.ObjectId.isValid(jobId) || !Types.ObjectId.isValid(productId)) {
        throw new ExchangeRateSyncJobInvalidException({
          jobId,
          productId,
          reason: 'invalid_identifier',
        });
      }

      const job = await this.syncJobModel.findById(jobId);
      if (!job) {
        throw new ExchangeRateSyncJobNotFoundException({ jobId });
      }

      const productObjectId = new Types.ObjectId(productId);
      const product = await this.productModel
        .findOne({
          _id: productObjectId,
          $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
        })
        .lean<ProductDocument>();

      if (!product) {
        throw new ProductNotFoundException({ productId, reason: 'deleted_or_not_found' });
      }

      const rates = await this.exchangeRatesService.getCurrentRates();
      const baseMetadata = this.pricingCalculator.calculateDerivedPricing({}, rates);
      const exchangeRateVersion = job.exchangeRateVersion ?? baseMetadata.exchangeRateVersion;
      const syncSnapshot = new Date();

      const productUpdates = await this.buildProductUpdatePayload(
        product,
        rates,
        exchangeRateVersion,
        syncSnapshot,
      );

      if (Object.keys(productUpdates).length > 0) {
        await this.productModel.updateOne(
          { _id: product._id },
          {
            $set: productUpdates,
          },
        );
      }

      const variantResult = await this.syncVariantsForProduct(
        productObjectId,
        rates,
        exchangeRateVersion,
        syncSnapshot,
      );

      const existingErrors = job.errors ?? [];
      const removedErrors = existingErrors.filter((error) => error.productId === productId);
      const remainingErrors = existingErrors.filter((error) => error.productId !== productId);

      const productLevelErrorsRemoved = removedErrors.some((error) => !error.variantId) ? 1 : 0;
      const variantErrorsRemoved = removedErrors.filter((error) => error.variantId).length;

      const updatedErrors = [...remainingErrors, ...variantResult.errors].slice(-MAX_ERRORS_RECORDED);

      const updatedProcessedProducts = job.processedProducts + 1;
      const updatedProcessedVariants = job.processedVariants + variantResult.processed;
      const updatedFailedProducts = Math.max(0, job.failedProducts - productLevelErrorsRemoved);
      const updatedFailedVariants = Math.max(
        0,
        job.failedVariants - variantErrorsRemoved + variantResult.failed,
      );

      await this.syncJobModel.updateOne(
        { _id: jobId },
        {
          $set: {
            errors: updatedErrors,
            lastProcessedProductId: productId,
            processedProducts: updatedProcessedProducts,
            processedVariants: updatedProcessedVariants,
            failedProducts: updatedFailedProducts,
            failedVariants: updatedFailedVariants,
            exchangeRateVersion: exchangeRateVersion ?? job.exchangeRateVersion,
          },
        },
      );

      return this.getJob(jobId);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Failed to retry product sync', {
        error: err.message,
        stack: err.stack,
        jobId,
        productId,
      });

      // إعادة رمي الخطأ إذا كان من نوع ExchangeRateException
      if (error instanceof ExchangeRateException || error instanceof ProductNotFoundException) {
        throw error;
      }

      throw new ExchangeRateSyncFailedException({
        jobId,
        productId,
        error: err.message,
      });
    }
  }

  private withoutUndefined<T extends Record<string, unknown>>(input: T): T {
    const result: Record<string, unknown> = {};
    Object.entries(input).forEach(([key, value]) => {
      if (value !== undefined) {
        result[key] = value;
      }
    });
    return result as T;
  }

  private stringifyError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return JSON.stringify(error);
  }
}

