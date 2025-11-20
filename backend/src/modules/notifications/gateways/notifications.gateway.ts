import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Logger, UseGuards, UseFilters } from '@nestjs/common';
import { Server } from 'socket.io';
import { WebSocketAuthGuard } from '../../../shared/websocket/websocket-auth.guard';
import { WebSocketService } from '../../../shared/websocket/websocket.service';
import { AuthenticatedSocket } from '../../../shared/websocket/websocket-auth.guard';
import { getWebSocketCorsOrigins } from '../../../shared/websocket/websocket-cors.helper';
import { WebSocketExceptionFilter } from '../../../shared/filters/websocket-exception.filter';
import { NotificationService } from '../services/notification.service';

@WebSocketGateway({
  cors: {
    origin: getWebSocketCorsOrigins(),
    credentials: true,
  },
  namespace: '/notifications',
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
})
@UseGuards(WebSocketAuthGuard)
@UseFilters(WebSocketExceptionFilter)
export class NotificationsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private readonly webSocketService: WebSocketService,
    private readonly notificationService: NotificationService,
  ) {}

  afterInit(server: Server): void {
    this.webSocketService.setServer(server);
    this.logger.log('Notifications WebSocket Gateway initialized');
  }

  handleConnection(client: AuthenticatedSocket): void {
    try {
      this.webSocketService.handleConnection(client);
    } catch (error) {
      this.logger.error(`Connection error for socket ${client.id}:`, error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    this.webSocketService.handleDisconnection(client);
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: AuthenticatedSocket): { event: string; data: { pong: boolean; timestamp: string } } {
    return {
      event: 'pong',
      data: {
        pong: true,
        timestamp: new Date().toISOString(),
      },
    };
  }

  @SubscribeMessage('get-unread-count')
  async handleGetUnreadCount(@ConnectedSocket() client: AuthenticatedSocket): Promise<{ event: string; data: { count: number } }> {
    if (!client.user) {
      throw new WsException('Unauthorized');
    }

    const userId = client.user.userId || client.user.sub;
    const count = await this.notificationService.getUnreadCount(userId);

    return {
      event: 'unread-count',
      data: { count },
    };
  }

  @SubscribeMessage('mark-as-read')
  async handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { notificationIds: string[] },
  ): Promise<{ event: string; data: { success: boolean; markedCount: number } }> {
    if (!client.user) {
      throw new WsException('Unauthorized');
    }

    const userId = client.user.userId || client.user.sub;
    const markedCount = await this.notificationService.markMultipleAsRead(
      { notificationIds: data.notificationIds },
      userId,
    );

    return {
      event: 'marked-as-read',
      data: {
        success: true,
        markedCount,
      },
    };
  }

  @SubscribeMessage('mark-all-as-read')
  async handleMarkAllAsRead(@ConnectedSocket() client: AuthenticatedSocket): Promise<{ event: string; data: { success: boolean; markedCount: number } }> {
    if (!client.user) {
      throw new WsException('Unauthorized');
    }

    const userId = client.user.userId || client.user.sub;
    const markedCount = await this.notificationService.markAllAsRead(userId);

    return {
      event: 'marked-all-as-read',
      data: {
        success: true,
        markedCount,
      },
    };
  }
}

