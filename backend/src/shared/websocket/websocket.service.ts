import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { AuthenticatedSocket } from './websocket-auth.guard';

@Injectable()
export class WebSocketService {
  private readonly logger = new Logger(WebSocketService.name);

  // ✅ تغيير من server واحد إلى Map لدعم namespaces متعددة
  private servers = new Map<string, Server>();
  private readonly userSockets = new Map<string, Set<string>>();
  private readonly socketUsers = new Map<string, string>();
  private readonly ticketRooms = new Map<string, Set<string>>();

  // ✅ تحديث setServer ليقبل namespace
  setServer(server: Server, namespace: string = '/'): void {
    this.servers.set(namespace, server);
    this.logger.log(`✅ WebSocket server initialized for namespace: "${namespace}"`);
    this.logger.log(`   - Available namespaces: [${Array.from(this.servers.keys()).join(', ')}]`);
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

    this.logger.log(
      `User ${client.user.userId} joined ticket room: ${ticketId} (Socket: ${client.id})`,
    );
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

  // ✅ تحديث sendToUser ليستخدم namespace محدد
  sendToUser(
    userId: string,
    event: string,
    data: unknown,
    namespace: string = '/notifications',
  ): boolean {
    const server = this.servers.get(namespace);

    if (!server) {
      this.logger.warn(`❌ WebSocket server not initialized for namespace: "${namespace}"`);
      this.logger.warn(`   - Available namespaces: [${Array.from(this.servers.keys()).join(', ')}]`);
      return false;
    }

    // ✅ Debug logging للتحقق من namespace
    this.logger.log(`🔍 [DEBUG] Sending event: "${event}"`);
    this.logger.log(`🔍 [DEBUG] Server namespace: "${namespace}"`);
    this.logger.log(`🔍 [DEBUG] To user: ${userId}`);

    const room = `user:${userId}`;
    const sockets = this.userSockets.get(userId);

    if (!sockets || sockets.size === 0) {
      this.logger.warn(`⚠️ User ${userId} has no active connections`);
      this.logger.warn(`   - Available users: [${Array.from(this.userSockets.keys()).join(', ')}]`);
      return false;
    }

    this.logger.log(
      `🔍 [DEBUG] User ${userId} has ${sockets.size} active socket(s): [${Array.from(sockets).join(', ')}]`,
    );
    this.logger.log(`🔍 [DEBUG] Emitting to room: "${room}"`);

    server.to(room).emit(event, data);
    this.logger.log(
      `✅ Sent ${event} to user ${userId} (${sockets.size} socket(s)) on namespace "${namespace}"`,
    );
    return true;
  }

  // ✅ تحديث sendToMultipleUsers ليستخدم namespace محدد
  sendToMultipleUsers(
    userIds: string[],
    event: string,
    data: unknown,
    namespace: string = '/notifications',
  ): number {
    const server = this.servers.get(namespace);

    if (!server) {
      this.logger.warn(`❌ WebSocket server not initialized for namespace: "${namespace}"`);
      this.logger.warn(`   - Available namespaces: [${Array.from(this.servers.keys()).join(', ')}]`);
      return 0;
    }

    let sentCount = 0;
    for (const userId of userIds) {
      if (this.sendToUser(userId, event, data, namespace)) {
        sentCount++;
      }
    }

    this.logger.log(`✅ Sent ${event} to ${sentCount}/${userIds.length} users on namespace "${namespace}"`);
    return sentCount;
  }

  // ✅ تحديث sendToTicket ليستخدم namespace محدد
  sendToTicket(
    ticketId: string,
    event: string,
    data: unknown,
    excludeUserId?: string,
    namespace: string = '/support',
  ): boolean {
    const server = this.servers.get(namespace);

    if (!server) {
      this.logger.warn(`❌ WebSocket server not initialized for namespace: "${namespace}"`);
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
      server.to(room).except(excludeRoom).emit(event, data);
    } else {
      server.to(room).emit(event, data);
    }

    this.logger.log(`Sent ${event} to ticket ${ticketId} (${roomSockets.size} socket(s)) on namespace "${namespace}"`);
    return true;
  }

  // ✅ تحديث broadcast ليستخدم namespace محدد
  broadcast(event: string, data: unknown, excludeUserId?: string, namespace: string = '/'): number {
    const server = this.servers.get(namespace);

    if (!server) {
      this.logger.warn(`❌ WebSocket server not initialized for namespace: "${namespace}"`);
      return 0;
    }

    if (excludeUserId) {
      const excludeRoom = `user:${excludeUserId}`;
      server.except(excludeRoom).emit(event, data);
    } else {
      server.emit(event, data);
    }

    const totalConnections = this.socketUsers.size;
    this.logger.log(`Broadcasted ${event} to ${totalConnections} connections on namespace "${namespace}"`);
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

  // ✅ Helper method للحصول على namespaces المتاحة
  getAvailableNamespaces(): string[] {
    return Array.from(this.servers.keys());
  }
}
