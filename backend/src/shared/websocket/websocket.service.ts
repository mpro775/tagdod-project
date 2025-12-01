import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { AuthenticatedSocket } from './websocket-auth.guard';

@Injectable()
export class WebSocketService {
  private readonly logger = new Logger(WebSocketService.name);
  private server: Server | null = null;
  private readonly userSockets = new Map<string, Set<string>>();
  private readonly socketUsers = new Map<string, string>();
  private readonly ticketRooms = new Map<string, Set<string>>();

  setServer(server: Server): void {
    this.server = server;
    this.logger.log('WebSocket server initialized');
  }

  handleConnection(client: AuthenticatedSocket): void {
    // ✅ Logging مفصل للـ debugging
    this.logger.log(`🔌 WebSocketService.handleConnection called for socket: ${client.id}`);
    this.logger.log(`   - Has user object: ${!!client.user}`);
    if (client.user) {
      this.logger.log(`   - User object: ${JSON.stringify(client.user)}`);
      this.logger.log(`   - UserId: ${client.user.userId || client.user.sub || 'NOT FOUND'}`);
    } else {
      this.logger.warn(`   ⚠️ Connection attempt without authentication: ${client.id}`);
      this.logger.warn(`   - This means WebSocketAuthGuard did not set client.user`);
      return;
    }

    const userId = client.user.userId || client.user.sub;
    if (!userId) {
      this.logger.error(`   ❌ No userId found in user object for socket: ${client.id}`);
      return;
    }

    const userRoom = `user:${userId}`;

    client.join(userRoom);
    this.logger.log(`   ✅ Socket ${client.id} joined room: ${userRoom}`);

    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
      this.logger.log(`   ✅ Created new socket set for user: ${userId}`);
    }
    this.userSockets.get(userId)!.add(client.id);
    this.socketUsers.set(client.id, userId);

    const totalSockets = this.userSockets.get(userId)!.size;
    this.logger.log(
      `✅ User ${userId} connected (Socket: ${client.id}). Total sockets for this user: ${totalSockets}`,
    );

    client.emit('connected', {
      success: true,
      message: 'Connected to real-time service',
      userId,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`   ✅ Sent 'connected' event to socket ${client.id}`);
  }

  handleDisconnection(client: AuthenticatedSocket): void {
    const userId = this.socketUsers.get(client.id);
    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
      }
      this.socketUsers.delete(client.id);
      this.logger.log(`User ${userId} disconnected (Socket: ${client.id})`);
    }
  }

  joinTicketRoom(client: AuthenticatedSocket, ticketId: string): void {
    if (!client.user) {
      return;
    }

    const room = `ticket:${ticketId}`;
    client.join(room);

    if (!this.ticketRooms.has(ticketId)) {
      this.ticketRooms.set(ticketId, new Set());
    }
    this.ticketRooms.get(ticketId)!.add(client.id);

    this.logger.log(`User ${client.user.userId} joined ticket room: ${ticketId} (Socket: ${client.id})`);
  }

  leaveTicketRoom(client: AuthenticatedSocket, ticketId: string): void {
    const room = `ticket:${ticketId}`;
    client.leave(room);

    const roomSockets = this.ticketRooms.get(ticketId);
    if (roomSockets) {
      roomSockets.delete(client.id);
      if (roomSockets.size === 0) {
        this.ticketRooms.delete(ticketId);
      }
    }

    this.logger.log(`User left ticket room: ${ticketId} (Socket: ${client.id})`);
  }

  sendToUser(userId: string, event: string, data: unknown): boolean {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized');
      return false;
    }

    const room = `user:${userId}`;
    const sockets = this.userSockets.get(userId);

    if (!sockets || sockets.size === 0) {
      this.logger.debug(`User ${userId} has no active connections`);
      return false;
    }

    this.server.to(room).emit(event, data);
    this.logger.log(`Sent ${event} to user ${userId} (${sockets.size} socket(s))`);
    return true;
  }

  sendToMultipleUsers(userIds: string[], event: string, data: unknown): number {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized');
      return 0;
    }

    let sentCount = 0;
    for (const userId of userIds) {
      if (this.sendToUser(userId, event, data)) {
        sentCount++;
      }
    }

    this.logger.log(`Sent ${event} to ${sentCount}/${userIds.length} users`);
    return sentCount;
  }

  sendToTicket(ticketId: string, event: string, data: unknown, excludeUserId?: string): boolean {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized');
      return false;
    }

    const room = `ticket:${ticketId}`;
    const roomSockets = this.ticketRooms.get(ticketId);

    if (!roomSockets || roomSockets.size === 0) {
      this.logger.debug(`Ticket ${ticketId} has no active connections`);
      return false;
    }

    if (excludeUserId) {
      const excludeRoom = `user:${excludeUserId}`;
      this.server.to(room).except(excludeRoom).emit(event, data);
    } else {
      this.server.to(room).emit(event, data);
    }

    this.logger.log(`Sent ${event} to ticket ${ticketId} (${roomSockets.size} socket(s))`);
    return true;
  }

  broadcast(event: string, data: unknown, excludeUserId?: string): number {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized');
      return 0;
    }

    if (excludeUserId) {
      const excludeRoom = `user:${excludeUserId}`;
      this.server.except(excludeRoom).emit(event, data);
    } else {
      this.server.emit(event, data);
    }

    const totalConnections = this.socketUsers.size;
    this.logger.log(`Broadcasted ${event} to ${totalConnections} connections`);
    return totalConnections;
  }

  isUserOnline(userId: string): boolean {
    const sockets = this.userSockets.get(userId);
    return sockets ? sockets.size > 0 : false;
  }

  getOnlineUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  getConnectionCount(userId: string): number {
    const sockets = this.userSockets.get(userId);
    return sockets ? sockets.size : 0;
  }

  getTotalConnections(): number {
    return this.socketUsers.size;
  }

  getTicketConnections(ticketId: string): number {
    const roomSockets = this.ticketRooms.get(ticketId);
    return roomSockets ? roomSockets.size : 0;
  }
}

