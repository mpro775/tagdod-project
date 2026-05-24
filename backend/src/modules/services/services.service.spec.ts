import { ModuleRef } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
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

  it('uses the service request title in dispute notifications and keeps the request id in data only', async () => {
    const requestId = new Types.ObjectId();
    const customerUserId = new Types.ObjectId();
    const engineerUserId = new Types.ObjectId();
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
    const serviceRequest = {
      _id: requestId,
      userId: customerUserId,
      engineerId: engineerUserId,
      title: 'تركيب منظومة شمسية',
      status: 'ASSIGNED',
      save: jest.fn().mockResolvedValue(undefined),
    };
    const requestsModel = {
      findOne: jest.fn().mockResolvedValue(serviceRequest),
    };
    const service = new ServicesService(
      requestsModel as never,
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

    await service.disputeRequest(customerUserId.toString(), requestId.toString(), 'سبب النزاع');

    expect(createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientId: engineerUserId.toString(),
        type: NotificationType.SERVICE_REQUEST_OPENED,
        title: 'تم فتح نزاع على الطلب',
        message: 'تم فتح نزاع على طلب: تركيب منظومة شمسية',
        data: {
          requestId: requestId.toString(),
          status: 'DISPUTED',
          recipientContext: 'engineer',
        },
      }),
    );
    expect(createNotification.mock.calls[0][0].message).not.toContain(requestId.toString());
  });
});
