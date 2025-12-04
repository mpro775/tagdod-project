import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationQueueService } from './notification-queue.service';
import {
  NOTIFICATION_QUEUE,
  NOTIFICATION_SCHEDULED_QUEUE,
  NOTIFICATION_RETRY_QUEUE,
} from './queue.constants';
import {
  UnifiedNotification,
  UnifiedNotificationSchema,
} from '../schemas/unified-notification.schema';

// Re-export constants for convenience
export { NOTIFICATION_QUEUE, NOTIFICATION_SCHEDULED_QUEUE, NOTIFICATION_RETRY_QUEUE };

@Module({
  imports: [
    // Mongoose for notification model access
    MongooseModule.forFeature([
      { name: UnifiedNotification.name, schema: UnifiedNotificationSchema },
    ]),
    // Configure Bull with Redis
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        if (!redisUrl) {
          throw new Error('REDIS_URL is required for Bull Queue');
        }

        // Parse Redis URL
        let host = 'localhost';
        let port = 6379;
        let password: string | undefined;
        let tls: { rejectUnauthorized: boolean } | undefined;

        try {
          const url = new URL(redisUrl);
          host = url.hostname;
          port = parseInt(url.port, 10) || 6379;
          password = url.password || undefined;

          // Check for TLS (rediss://)
          if (redisUrl.startsWith('rediss://')) {
            tls = { rejectUnauthorized: false };
          }
        } catch {
          // Use defaults if URL parsing fails
        }

        return {
          redis: {
            host,
            port,
            password,
            tls,
          },
          defaultJobOptions: {
            removeOnComplete: 100, // Keep last 100 completed jobs
            removeOnFail: 500, // Keep last 500 failed jobs
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 2000, // Start with 2 seconds
            },
          },
        };
      },
      inject: [ConfigService],
    }),

    // Register queues
    BullModule.registerQueue(
      {
        name: NOTIFICATION_QUEUE,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      },
      {
        name: NOTIFICATION_SCHEDULED_QUEUE,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
        },
      },
      {
        name: NOTIFICATION_RETRY_QUEUE,
        defaultJobOptions: {
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 10000,
          },
        },
      },
    ),
  ],
  providers: [NotificationQueueService],
  exports: [NotificationQueueService, BullModule],
})
export class NotificationQueueModule {}

