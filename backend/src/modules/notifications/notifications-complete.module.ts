import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UnifiedNotification,
  UnifiedNotificationSchema,
} from './schemas/unified-notification.schema';
import {
  NotificationTemplate,
  NotificationTemplateSchema,
} from './schemas/notification-template.schema';
import {
  NotificationPreference,
  NotificationPreferenceSchema,
} from './schemas/notification-preference.schema';
import { DeviceToken, DeviceTokenSchema } from './schemas/device-token.schema';
import { NotificationLog, NotificationLogSchema } from './schemas/notification-log.schema';

// Services
import { NotificationService } from './services/notification.service';
import { NotificationTemplateService } from './services/notification-template.service';
import { NotificationPreferenceService } from './services/notification-preference.service';

// Controllers
import { UnifiedNotificationController } from './controllers/unified-notification.controller';

// Adapters
import {
  InAppNotificationAdapter,
  PushNotificationAdapter,
  EmailNotificationAdapter,
  SmsNotificationAdapter,
  NotificationAdapterFactory,
  MockNotificationAdapter,
} from './adapters/notification.adapters';

// Ports
import {} from './ports/notification.ports';

// Auth
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../../shared/shared.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UnifiedNotification.name, schema: UnifiedNotificationSchema },
      { name: NotificationTemplate.name, schema: NotificationTemplateSchema },
      { name: NotificationPreference.name, schema: NotificationPreferenceSchema },
      { name: DeviceToken.name, schema: DeviceTokenSchema },
      { name: NotificationLog.name, schema: NotificationLogSchema },
    ]),
    forwardRef(() => AuthModule),
    SharedModule,
  ],
  controllers: [UnifiedNotificationController],
  providers: [
    // Core Services
    NotificationService,
    NotificationTemplateService,
    NotificationPreferenceService,

    // Adapters
    InAppNotificationAdapter,
    PushNotificationAdapter,
    EmailNotificationAdapter,
    SmsNotificationAdapter,
    NotificationAdapterFactory,
    MockNotificationAdapter,

    // Port Providers
    {
      provide: 'IN_APP_NOTIFICATION_PORT',
      useClass: InAppNotificationAdapter,
    },
    {
      provide: 'PUSH_NOTIFICATION_PORT',
      useClass: PushNotificationAdapter,
    },
    {
      provide: 'EMAIL_NOTIFICATION_PORT',
      useClass: EmailNotificationAdapter,
    },
    {
      provide: 'SMS_NOTIFICATION_PORT',
      useClass: SmsNotificationAdapter,
    },
    {
      provide: 'MOCK_NOTIFICATION_PORT',
      useClass: MockNotificationAdapter,
    },
  ],
  exports: [
    // Services
    NotificationService,
    NotificationTemplateService,
    NotificationPreferenceService,

    // Adapters
    NotificationAdapterFactory,
    InAppNotificationAdapter,
    PushNotificationAdapter,
    EmailNotificationAdapter,
    SmsNotificationAdapter,

    // Ports
    'IN_APP_NOTIFICATION_PORT',
    'PUSH_NOTIFICATION_PORT',
    'EMAIL_NOTIFICATION_PORT',
    'SMS_NOTIFICATION_PORT',
    'MOCK_NOTIFICATION_PORT',
  ],
})
export class NotificationsCompleteModule {}
