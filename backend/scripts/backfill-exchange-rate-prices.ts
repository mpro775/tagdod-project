import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExchangeRateSyncService } from '../src/modules/exchange-rates/exchange-rate-sync.service';
import {
  ExchangeRateSyncJob,
  ExchangeRateSyncJobStatus,
  ExchangeRateSyncJobReason,
} from '../src/modules/exchange-rates/schemas/exchange-rate-sync-job.schema';
import { setTimeout as delay } from 'timers/promises';

const logger = new Logger('BackfillExchangeRatesScript');

const isJobActive = (status: ExchangeRateSyncJobStatus | undefined): boolean =>
  status === ExchangeRateSyncJobStatus.PENDING || status === ExchangeRateSyncJobStatus.RUNNING;

const resolveJobId = (job: ExchangeRateSyncJob): string => {
  const candidate = (job as unknown as { _id?: unknown; id?: unknown })._id ?? (job as unknown as { id?: unknown }).id;

  if (!candidate) {
    throw new Error('Exchange rate sync job is missing an identifier.');
  }

  if (typeof candidate === 'string') {
    return candidate;
  }

  if (typeof (candidate as { toString?: () => string }).toString === 'function') {
    return (candidate as { toString(): string }).toString();
  }

  throw new Error('Unable to resolve job identifier.');
};

async function waitForJobCompletion(
  syncService: ExchangeRateSyncService,
  jobId: string,
  pollIntervalMs = 5000,
  timeoutMs = 60 * 60 * 1000,
): Promise<ExchangeRateSyncJob | null> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const job = await syncService.getJob(jobId);

    if (!job) {
      throw new Error(`Sync job ${jobId} no longer exists`);
    }

    if (!isJobActive(job.status)) {
      return job;
    }

    logger.log(
      `Job ${jobId} is still ${job.status}. Processed ${job.processedProducts}/${job.totalProducts || '-'} products`,
    );

    await delay(pollIntervalMs);
  }

  throw new Error(`Timed out waiting for sync job ${jobId} to complete`);
}

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const syncService = appContext.get(ExchangeRateSyncService);

  try {
    logger.log('Triggering exchange rate pricing backfill job...');
    const job = await syncService.triggerSync('system', ExchangeRateSyncJobReason.MANUAL);
    const jobId = resolveJobId(job);

    logger.log(`Job ${jobId} started with status ${job.status}`);

    const finalJob = await waitForJobCompletion(syncService, jobId);

    if (!finalJob) {
      throw new Error('Failed to retrieve completed job details');
    }

    if (finalJob.status === ExchangeRateSyncJobStatus.COMPLETED) {
      logger.log('Exchange rate pricing backfill completed successfully');
      logger.log(
        `Processed ${finalJob.processedProducts} products (${finalJob.processedVariants} variants). Errors: ${finalJob.errors.length}`,
      );
      if (finalJob.errors.length > 0) {
        logger.warn('Some products failed to sync. Review job details in the admin dashboard.');
      }
      await appContext.close();
      process.exit(0);
    } else {
      logger.error(`Backfill job finished with status ${finalJob.status}`);
      logger.error(`Errors recorded: ${finalJob.errors.length}`);
      finalJob.errors.slice(0, 5).forEach((error) =>
        logger.error(
          `Product ${error.productId ?? 'unknown'} / Variant ${error.variantId ?? 'n/a'} -> ${error.message}`,
        ),
      );
      await appContext.close();
      process.exit(1);
    }
  } catch (error) {
    logger.error('Exchange rate pricing backfill failed', error instanceof Error ? error.stack : String(error));
    await appContext.close();
    process.exit(1);
  }
}

bootstrap();

