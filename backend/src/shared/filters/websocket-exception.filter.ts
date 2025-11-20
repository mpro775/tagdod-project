import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthenticatedSocket } from '../websocket/websocket-auth.guard';

/**
 * WebSocket Exception Filter
 * Handles all WebSocket exceptions and sends standardized error responses to clients
 */
@Catch(WsException)
export class WebSocketExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(WebSocketExceptionFilter.name);

  catch(exception: WsException, host: ArgumentsHost): void {
    const ctx = host.switchToWs();
    const client: AuthenticatedSocket = ctx.getClient<AuthenticatedSocket>();
    const data = ctx.getData();

    const error = exception.getError();
    const message = typeof error === 'string' ? error : 'WebSocket error occurred';
    const errorDetails = typeof error === 'object' && error !== null ? error : { message };

    this.logger.warn(`WebSocket error for socket ${client.id}: ${message}`, {
      socketId: client.id,
      userId: client.user?.userId,
      data,
      error: errorDetails,
    });

    // Send standardized error response to client
    const errorResponse = {
      status: 'error',
      error: {
        code: 'WS_ERROR',
        message,
        ...(typeof errorDetails === 'object' && errorDetails !== null && !Array.isArray(errorDetails)
          ? errorDetails
          : {}),
      },
      timestamp: new Date().toISOString(),
    };

    client.emit('exception', errorResponse);

    // Also emit error event for compatibility
    client.emit('error', errorResponse);
  }
}

