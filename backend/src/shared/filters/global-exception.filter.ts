import { 
  ArgumentsHost, 
  Catch, 
  ExceptionFilter, 
  HttpException, 
  HttpStatus,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { AppException } from '../exceptions/app.exception';
import { DomainException } from '../exceptions/domain.exceptions';
import { Request, Response } from 'express';
import { ErrorCode } from '../constants/error-codes';
import { ErrorLogsService } from '../../modules/error-logs/error-logs.service';
import { ErrorLevel, ErrorCategory } from '../../modules/error-logs/dto/error-logs.dto';

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

  constructor(
    @Inject(forwardRef(() => ErrorLogsService))
    private readonly errorLogsService?: ErrorLogsService,
  ) {}

  private determineCategory(exception: Error | HttpException | AppException | DomainException): ErrorCategory {
    if (exception instanceof DomainException) {
      const code = exception.code || '';
      if (code.includes('AUTH') || code.includes('TOKEN') || code.includes('PERMISSION')) {
        return ErrorCategory.AUTHENTICATION;
      }
      if (code.includes('VALIDATION') || code.includes('FORMAT')) {
        return ErrorCategory.VALIDATION;
      }
      if (code.includes('DATABASE') || code.includes('MONGO')) {
        return ErrorCategory.DATABASE;
      }
      if (code.includes('BUSINESS') || code.includes('LOGIC')) {
        return ErrorCategory.BUSINESS_LOGIC;
      }
    }
    
    // Default based on status code
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      if (status >= 400 && status < 500) {
        return ErrorCategory.VALIDATION;
      }
    }
    
    return ErrorCategory.API;
  }

  private async logErrorToDatabase(
    exception: Error | HttpException | AppException | DomainException,
    req: RequestWithId,
    status: number,
  ) {
    // Only log to database if service is available and error is significant
    if (!this.errorLogsService || status < 500) {
      return;
    }

    // Skip database logging if the error itself is a database connection error
    const isDatabaseConnectionError = 
      exception.message?.includes('getaddrinfo') ||
      exception.message?.includes('EAI_AGAIN') ||
      exception.message?.includes('MongoServerSelectionError') ||
      exception.message?.includes('MongoNetworkError') ||
      exception.message?.includes('MongoTimeoutError') ||
      exception.name === 'MongoServerSelectionError' ||
      exception.name === 'MongoNetworkError';

    if (isDatabaseConnectionError) {
      this.logger.warn('Skipping database error log - database connection unavailable', {
        error: exception.message,
        path: req.url,
        method: req.method,
      });
      return;
    }

    try {
      const level = status >= 500 ? ErrorLevel.ERROR : ErrorLevel.WARN;
      const category = this.determineCategory(exception);

      await this.errorLogsService.createErrorLog({
        level,
        category,
        message: exception?.message || 'Unknown error',
        stack: exception?.stack,
        endpoint: req.url,
        method: req.method,
        statusCode: status,
        userId: req.user?.userId,
        metadata: {
          requestId: req.requestId,
          userAgent: req.headers['user-agent'],
          ip: req.ip,
          headers: {
            'content-type': req.headers['content-type'],
            'accept': req.headers['accept'],
          },
        },
      });
    } catch (logError) {
      // Fallback to console if database logging fails
      this.logger.error('Failed to log error to database', logError);
    }
  }

  catch(exception: Error | HttpException | AppException | DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<RequestWithId>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    // Log authentication/authorization errors for debugging
    if (status === 401 || status === 403) {
      this.logger.warn(
        `[${status}] ${exception.constructor.name}: ${exception.message}`,
        {
          path: req.url,
          method: req.method,
          userId: req.user?.userId,
          requestId: req.requestId,
          exceptionType: exception.constructor.name,
          isDomainException: exception instanceof DomainException,
          isHttpException: exception instanceof HttpException,
        }
      );
    }

    // Log critical errors to console
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

    // Log to database asynchronously (don't block response)
    this.logErrorToDatabase(exception, req, status).catch((err) => {
      this.logger.error('Error logging to database failed', err);
    });

    // Handle DomainException (new unified system)
    if (exception instanceof DomainException) {
      const response = exception.getResponse();
      const responsePayload =
        response && typeof response === 'object'
          ? (response as Record<string, unknown>)
          : { message: String(response) };
      res.status(status).json({
        ...responsePayload,
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
          message:
            typeof response === 'string'
              ? response
              : (typeof response === 'object' && response && 'message' in (response as Record<string, unknown>)
                  ? (response as Record<string, unknown>).message as string
                  : exception.message),
          details: typeof response === 'object' ? (response as object) : null,
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
