import { 
  ArgumentsHost, 
  Catch, 
  ExceptionFilter, 
  HttpException, 
  HttpStatus,
  Logger 
} from '@nestjs/common';
import { AppException } from '../exceptions/app.exception';
import { DomainException } from '../exceptions/domain.exceptions';
import { Request, Response } from 'express';
import { ErrorCode } from '../constants/error-codes';

interface RequestWithId extends Request {
  requestId?: string;
  user?: {
    sub: string;
    userId?: string;
    phone: string;
    isAdmin: boolean;
    roles?: string[];
    permissions?: string[];
    preferredCurrency?: string;
  };
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: Error | HttpException | AppException | DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<RequestWithId>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    // Log critical errors
    if (status >= 500) {
      this.logger.error(
        `[${status}] ${exception.message}`,
        {
          path: req.url,
          method: req.method,
          userId: req.user?.userId,
          requestId: req.requestId,
          stack: exception.stack,
        }
      );
    }

    // Handle DomainException (new unified system)
    if (exception instanceof DomainException) {
      const response = exception.getResponse();
      res.status(status).json({
        ...response,
        requestId: req?.requestId,
        timestamp: new Date().toISOString(),
        path: req.url,
      });
      return;
    }

    // Handle AppException (legacy - backward compatibility)
    if (exception instanceof AppException) {
      const payload = {
        success: false,
        error: {
          code: exception.code,
          message: exception.userMessage,
          details: exception.details,
          fieldErrors: exception.fieldErrors,
        },
        requestId: req?.requestId,
        timestamp: new Date().toISOString(),
        path: req.url,
      };
      res.status(status).json(payload);
      return;
    }

    // Handle NestJS built-in HttpException
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const payload = {
        success: false,
        error: {
          code: `HTTP_${status}`,
          message: typeof response === 'string' ? response : (response).message || exception.message,
          details: typeof response === 'object' ? response : null,
          fieldErrors: null,
        },
        requestId: req?.requestId,
        timestamp: new Date().toISOString(),
        path: req.url,
      };
      res.status(status).json(payload);
      return;
    }

    // Handle generic Error
    const payload = {
      success: false,
      error: {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: process.env.NODE_ENV === 'production' 
          ? 'حدث خطأ داخلي في الخادم' 
          : exception?.message ?? 'Internal Server Error',
        details: process.env.NODE_ENV === 'production' ? null : {
          name: exception.name,
          stack: exception.stack,
        },
        fieldErrors: null,
      },
      requestId: req?.requestId,
      timestamp: new Date().toISOString(),
      path: req.url,
    };
    
    res.status(status).json(payload);
  }
}
