import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UnifiedNotification, UnifiedNotificationSchema } from './schemas/unified-notification.schema';
import {
  NotificationChannelConfig,
  NotificationChannelConfigSchema,
} from './schemas/notification-channel-config.schema';
import { NotificationService } from './services/notification.service';
import { NotificationChannelConfigService } from './services/notification-channel-config.service';
import { UnifiedNotificationController } from './controllers/unified-notification.controller';
import { NotificationChannelConfigController } from './controllers/notification-channel-config.controller';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UnifiedNotification.name, schema: UnifiedNotificationSchema },
      { name: NotificationChannelConfig.name, schema: NotificationChannelConfigSchema },
    ]),
    SharedModule,
  ],
  controllers: [NotificationChannelConfigController, UnifiedNotificationController],
  providers: [NotificationService, NotificationChannelConfigService],
  exports: [NotificationService, NotificationChannelConfigService],
})
export class NotificationsUnifiedModule {}
