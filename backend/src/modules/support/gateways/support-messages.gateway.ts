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
import { SupportService } from '../support.service';

@WebSocketGateway({
  cors: {
    origin: getWebSocketCorsOrigins(),
    credentials: true,
  },
  namespace: '/support',
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
})
@UseGuards(WebSocketAuthGuard)
@UseFilters(WebSocketExceptionFilter)
export class SupportMessagesGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(SupportMessagesGateway.name);

  constructor(
    private readonly webSocketService: WebSocketService,
    private readonly supportService: SupportService,
  ) {}

  afterInit(server: Server): void {
    this.webSocketService.setServer(server, '/support');
    this.logger.log('✅ Support Messages WebSocket Gateway initialized on /support');
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

  @SubscribeMessage('join-ticket')
  handleJoinTicket(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { ticketId: string },
  ): { event: string; data: { success: boolean; ticketId: string } } {
    if (!client.user) {
      throw new WsException('Unauthorized');
    }

    this.webSocketService.joinTicketRoom(client, data.ticketId);

    return {
      event: 'joined-ticket',
      data: {
        success: true,
        ticketId: data.ticketId,
      },
    };
  }

  @SubscribeMessage('leave-ticket')
  handleLeaveTicket(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { ticketId: string },
  ): { event: string; data: { success: boolean; ticketId: string } } {
    if (!client.user) {
      throw new WsException('Unauthorized');
    }

    this.webSocketService.leaveTicketRoom(client, data.ticketId);

    return {
      event: 'left-ticket',
      data: {
        success: true,
        ticketId: data.ticketId,
      },
    };
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

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { ticketId: string; isTyping: boolean },
  ): void {
    if (!client.user) {
      return;
    }

    const room = `ticket:${data.ticketId}`;
    this.server.to(room).except(client.id).emit('user-typing', {
      userId: client.user.userId,
      ticketId: data.ticketId,
      isTyping: data.isTyping,
      userName: client.user.phone,
    });
  }
}

