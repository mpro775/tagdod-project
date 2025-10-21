import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UnifiedNotification, UnifiedNotificationSchema } from './schemas/unified-notification.schema';
import { NotificationService } from './services/notification.service';
import { UnifiedNotificationController } from './controllers/unified-notification.controller';
import { SharedModule } from '../../shared/shared.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UnifiedNotification.name, schema: UnifiedNotificationSchema }
    ]),
    SharedModule,
  ],
  controllers: [UnifiedNotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationsUnifiedModule {}
