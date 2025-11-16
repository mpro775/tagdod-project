import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { TokensService } from '../../modules/auth/tokens.service';

export interface AuthenticatedSocket extends Socket {
  user?: {
    sub: string;
    id: string;
    userId: string;
    phone: string;
    isAdmin: boolean;
    role?: string;
    isEngineer?: boolean;
    roles?: string[];
    permissions?: string[];
    preferredCurrency?: string;
  };
}

@Injectable()
export class WebSocketAuthGuard implements CanActivate {
  private readonly logger = new Logger(WebSocketAuthGuard.name);

  constructor(private readonly tokensService: TokensService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: AuthenticatedSocket = context.switchToWs().getClient();
      const token = this.extractTokenFromSocket(client);

      if (!token) {
        this.logger.warn(`WebSocket connection rejected: No token provided (Socket: ${client.id})`);
        throw new WsException('Unauthorized: No token provided');
      }

      try {
        const payload = this.tokensService.verifyAccess(token) as {
          sub: string;
          phone: string;
          isAdmin: boolean;
          roles?: string[];
          permissions?: string[];
          preferredCurrency?: string;
        };

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

        this.logger.log(`WebSocket authenticated: User ${payload.sub} (${payload.phone}) - Socket: ${client.id}`);
        return true;
      } catch (error) {
        this.logger.warn(`WebSocket connection rejected: Invalid token - ${error instanceof Error ? error.message : 'Unknown error'} (Socket: ${client.id})`);
        throw new WsException('Unauthorized: Invalid token');
      }
    } catch (error) {
      if (error instanceof WsException) {
        throw error;
      }
      this.logger.error('WebSocket authentication error:', error);
      throw new WsException('Unauthorized: Authentication failed');
    }
  }

  private extractTokenFromSocket(client: Socket): string | null {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && typeof authHeader === 'string') {
      const [type, token] = authHeader.split(' ');
      if (type === 'Bearer' && token) {
        return token;
      }
    }

    const token = client.handshake.auth?.token || client.handshake.query?.token;
    if (token && typeof token === 'string') {
      return token;
    }

    return null;
  }
}

