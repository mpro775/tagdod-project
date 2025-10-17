import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { AdminNotificationsController } from './admin.notifications.controller';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { AuthModule } from '../auth/auth.module';
import { NOTIFICATIONS_PORT } from './notifications.port';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [NotificationsController, AdminNotificationsController],
  providers: [
    NotificationsService,
    {
      provide: NOTIFICATIONS_PORT,
      useExisting: NotificationsService,
    },
  ],
  exports: [NotificationsService, NOTIFICATIONS_PORT],
})
export class NotificationsModule {}