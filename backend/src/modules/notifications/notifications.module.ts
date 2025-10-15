import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { AdminNotificationsController } from './admin.notifications.controller';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { DeviceToken, DeviceTokenSchema } from './schemas/device-token.schema';
import { NOTIFICATIONS_PORT } from './notifications.port';
import { PUSH_PORT, NullPushAdapter } from './ports/push.port';
import { SMS_PORT, NullSmsAdapter } from './ports/sms.port';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: DeviceToken.name, schema: DeviceTokenSchema },
    ]),
    AuthModule,
  ],
  controllers: [NotificationsController, AdminNotificationsController],
  providers: [
    NotificationsService,
    { provide: NOTIFICATIONS_PORT, useExisting: NotificationsService },
    { provide: PUSH_PORT, useClass: NullPushAdapter }, // replace with FCM adapter in production
    { provide: SMS_PORT, useClass: NullSmsAdapter },   // replace with your SMS adapter
  ],
  exports: [MongooseModule, NotificationsService, NOTIFICATIONS_PORT],
})
export class NotificationsModule {}
