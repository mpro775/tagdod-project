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
import {
  WebSocketAuthGuard,
  AuthenticatedSocket,
} from '../../../shared/websocket/websocket-auth.guard';
import { WebSocketService } from '../../../shared/websocket/websocket.service';
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
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
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
    // ✅ Logging مفصل للـ debugging
    this.logger.log(`🔌 New WebSocket connection attempt: ${client.id}`);
    this.logger.log(`   - Handshake auth: ${JSON.stringify(client.handshake.auth)}`);
    this.logger.log(
      `   - User from auth: ${client.user ? client.user.userId || client.user.sub || JSON.stringify(client.user) : 'NO USER'}`,
    );
    this.logger.log(
      `   - Full user object: ${client.user ? JSON.stringify(client.user) : 'NO USER OBJECT'}`,
    );

    try {
      this.webSocketService.handleConnection(client);
      const userId = client.user?.userId || client.user?.sub;
      if (userId) {
        this.logger.log(`✅ Connection registered successfully for user: ${userId} (socket: ${client.id})`);
      } else {
        this.logger.warn(`⚠️ Connection registered but no userId found (socket: ${client.id})`);
      }
    } catch (error) {
      this.logger.error(`❌ Connection error for socket ${client.id}:`, error);
      if (error instanceof Error) {
        this.logger.error(`   - Error message: ${error.message}`);
        this.logger.error(`   - Error stack: ${error.stack}`);
      }
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    const userId = client.user?.userId || client.user?.sub;
    this.logger.log(`🔌 WebSocket disconnected: ${client.id}${userId ? ` (user: ${userId})` : ' (no user)'}`);
    this.webSocketService.handleDisconnection(client);
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: AuthenticatedSocket): {
    event: string;
    data: { pong: boolean; timestamp: string };
  } {
    return {
      event: 'pong',
      data: {
        pong: true,
        timestamp: new Date().toISOString(),
      },
    };
  }

  @SubscribeMessage('get-unread-count')
  async handleGetUnreadCount(
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<{ event: string; data: { count: number } }> {
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
  async handleMarkAllAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<{ event: string; data: { success: boolean; markedCount: number } }> {
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
