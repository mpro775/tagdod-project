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
import { TokensService } from '../../auth/tokens.service';

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
    private readonly tokensService: TokensService,
  ) {}

  afterInit(server: Server): void {
    this.webSocketService.setServer(server);
    this.logger.log('Notifications WebSocket Gateway initialized');
  }

  handleConnection(client: AuthenticatedSocket): void {
    // ✅ Logging مفصل للـ debugging
    this.logger.log(`🔌 New WebSocket connection attempt: ${client.id}`);
    this.logger.log(`   - Handshake auth: ${JSON.stringify(client.handshake.auth)}`);

    // ⚠️ IMPORTANT: @UseGuards لا يعمل مع handleConnection في NestJS
    // يجب استخراج وتحقق الـ token يدوياً هنا
    try {
      // استخراج الـ token
      const token = this.extractToken(client);

      if (!token) {
        this.logger.warn(`❌ No token provided for socket ${client.id}`);
        client.emit('error', { message: 'Unauthorized: No token provided' });
        client.disconnect();
        return;
      }

      this.logger.log(`   - Token found: ${token.substring(0, 20)}...`);

      // التحقق من الـ token واستخراج بيانات المستخدم
      try {
        const payload = this.tokensService.verifyAccess(token) as {
          sub: string;
          phone: string;
          isAdmin: boolean;
          roles?: string[];
          permissions?: string[];
          preferredCurrency?: string;
        };

        // ✅ تعيين client.user - هذا ما كان مفقوداً!
        client.user = {
          sub: payload.sub,
          id: payload.sub,
          userId: payload.sub,
          phone: payload.phone,
          isAdmin: payload.isAdmin,
          roles: payload.roles,
          permissions: payload.permissions,
          preferredCurrency: payload.preferredCurrency,
        };

        this.logger.log(`✅ Token verified for user: ${payload.sub} (${payload.phone})`);
        this.logger.log(`   - User object set: ${JSON.stringify(client.user)}`);
      } catch (tokenError) {
        this.logger.warn(
          `❌ Token validation failed for socket ${client.id}: ${tokenError instanceof Error ? tokenError.message : 'Unknown error'}`,
        );
        client.emit('error', { message: 'Unauthorized: Invalid token' });
        client.disconnect();
        return;
      }

      // الآن client.user معين، يمكننا تسجيل الاتصال
      this.webSocketService.handleConnection(client);
      const userId = client.user?.userId || client.user?.sub;
      if (userId) {
        this.logger.log(`✅ Connection registered successfully for user: ${userId} (socket: ${client.id})`);
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

  /**
   * استخراج الـ token من Socket
   */
  private extractToken(client: AuthenticatedSocket): string | null {
    // من Authorization header
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && typeof authHeader === 'string') {
      const [type, token] = authHeader.split(' ');
      if (type === 'Bearer' && token) {
        return token;
      }
    }

    // من handshake.auth.token (Flutter يرسل هكذا)
    const authToken = client.handshake.auth?.token;
    if (authToken && typeof authToken === 'string') {
      return authToken;
    }

    // من query string
    const queryToken = client.handshake.query?.token;
    if (queryToken && typeof queryToken === 'string') {
      return queryToken;
    }

    return null;
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
