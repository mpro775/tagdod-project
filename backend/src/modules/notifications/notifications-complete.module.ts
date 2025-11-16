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
import { PushNotificationAdapter } from './adapters/notification.adapters';

// Services
import { NotificationService } from './services/notification.service';
import { NotificationTemplateService } from './services/notification-template.service';
import { NotificationPreferenceService } from './services/notification-preference.service';

// Controllers
import { UnifiedNotificationController } from './controllers/unified-notification.controller';

// Adapters
import {
  InAppNotificationAdapter,
  EmailNotificationAdapter,
  SmsNotificationAdapter,
  NotificationAdapterFactory,
  MockNotificationAdapter,
} from './adapters/notification.adapters';

import { FCMAdapter } from './adapters/fcm.adapter';
import { EmailAdapter } from './adapters/email.adapter';
import { SMSAdapter } from './adapters/sms.adapter';
import { AlawaelSMSAdapter } from './adapters/alawael-sms.adapter';

// Ports
import {} from './ports/notification.ports';

// Auth
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../../shared/shared.module';

// Gateways
import { NotificationsGateway } from './gateways/notifications.gateway';
import { WebSocketService } from '../../shared/websocket/websocket.service';

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
    FCMAdapter, // FCM Adapter for push notifications
    EmailAdapter, // Email Adapter for email notifications
    AlawaelSMSAdapter, // Alawael SMS Adapter for SMS notifications
    SMSAdapter, // SMS Adapter for SMS notifications (supports multiple providers)
    {
      provide: InAppNotificationAdapter,
      useFactory: (webSocketService: WebSocketService) => {
        return new InAppNotificationAdapter(webSocketService);
      },
      inject: [WebSocketService],
    },
    PushNotificationAdapter, // Uses FCMAdapter internally
    EmailNotificationAdapter, // Uses EmailAdapter internally
    SmsNotificationAdapter, // Uses SMSAdapter internally
    NotificationAdapterFactory,
    MockNotificationAdapter,

    // WebSocket Gateway
    NotificationsGateway,

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
    FCMAdapter, // Export FCMAdapter for direct use if needed
    EmailAdapter, // Export EmailAdapter for direct use if needed
    AlawaelSMSAdapter, // Export AlawaelSMSAdapter for direct use if needed
    SMSAdapter, // Export SMSAdapter for direct use if needed
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

    // WebSocket Gateway
    NotificationsGateway,
  ],
})
export class NotificationsCompleteModule {}
