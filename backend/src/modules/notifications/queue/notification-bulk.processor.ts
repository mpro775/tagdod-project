import { Processor, Process, OnQueueFailed } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger, Inject, forwardRef } from '@nestjs/common';
import { NOTIFICATION_BULK_QUEUE } from './queue.constants';
import { NotificationService } from '../services/notification.service';
import { BulkSendNotificationDto } from '../dto/unified-notification.dto';

export interface BulkNotificationJobData {
  dto: BulkSendNotificationDto;
  batchId: string;
}

@Processor(NOTIFICATION_BULK_QUEUE)
export class BulkNotificationProcessor {
  private readonly logger = new Logger(BulkNotificationProcessor.name);

  constructor(
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Main processor for bulk notification jobs.
   * Executes in the background to avoid HTTP timeouts when sending to large audiences.
   */
  @Process('bulkSend')
  async handleBulkSend(job: Job<BulkNotificationJobData>): Promise<void> {
    const { dto, batchId } = job.data;
    const total = dto.targetUserIds?.length ?? 0;

    this.logger.log(
      `Starting bulk notification job ${job.id} for batch ${batchId} with ${total} target users`,
    );

    // Reuse existing bulk send implementation inside the worker.
    // This keeps per-user logic (createNotification, queue, WebSocket) unchanged,
    // but moves the heavy loop out of the HTTP request lifecycle.
    await this.notificationService.bulkSendNotifications({
      ...dto,
      // Ensure batchId is consistent so that all notifications are linked
      // to the same technical batch.
      batchId,
    } as BulkSendNotificationDto);

    this.logger.log(
      `Bulk notification job ${job.id} for batch ${batchId} completed (total=${total})`,
    );
  }

  @OnQueueFailed()
  onFailed(job: Job<BulkNotificationJobData>, error: Error) {
    this.logger.error(
      `Bulk notification job ${job.id} for batch ${job.data?.batchId} failed: ${error.message}`,
    );
  }
}

