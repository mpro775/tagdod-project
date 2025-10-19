import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UnifiedNotification, UnifiedNotificationSchema } from './schemas/unified-notification.schema';
import { NotificationService } from './services/notification.service';
import { UnifiedNotificationController } from './controllers/unified-notification.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UnifiedNotification.name, schema: UnifiedNotificationSchema }
    ]),
  ],
  controllers: [UnifiedNotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationsUnifiedModule {}
