import { ModuleRef } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ServicesService } from './services.service';
import { NotificationService } from '../notifications/services/notification.service';
import { WebSocketService } from '../../shared/websocket/websocket.service';
import {
  NotificationChannel,
  NotificationNavigationType,
  NotificationType,
} from '../notifications/enums/notification.enums';

describe('ServicesService notifications', () => {
  it('routes engineer maintenance notifications to the engineer requests page', async () => {
    const createNotification = jest.fn().mockResolvedValue({});
    const webSocketService = {
      isUserOnline: jest.fn().mockReturnValue(true),
    };
    const moduleRef = {
      get: jest.fn((token) => {
        if (token === NotificationService) {
          return { createNotification };
        }
        if (token === WebSocketService) {
          return webSocketService;
        }
        return undefined;
      }),
    } as unknown as ModuleRef;

    const service = new ServicesService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      { get: jest.fn().mockReturnValue(false) } as unknown as ConfigService,
      {} as never,
      moduleRef,
    );

    await (
      service as unknown as {
        safeNotifyEngineer: (
          engineerUserId: string,
          type: NotificationType,
          title: string,
          message: string,
          data?: Record<string, unknown>,
        ) => Promise<void>;
      }
    ).safeNotifyEngineer(
      'engineer-user-id',
      NotificationType.SERVICE_REQUEST_OPENED,
      'New service request',
      'A new service request is available',
      { requestId: 'service-request-id' },
    );

    expect(createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientId: 'engineer-user-id',
        type: NotificationType.SERVICE_REQUEST_OPENED,
        data: {
          requestId: 'service-request-id',
          recipientContext: 'engineer',
        },
        channel: NotificationChannel.IN_APP,
        navigationType: NotificationNavigationType.SECTION,
        navigationTarget: '/customers-orders',
      }),
    );
  });
});
