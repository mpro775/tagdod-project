import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { AppException } from '../exceptions/app.exception';
import { Request, Response } from 'express';

interface RequestWithId extends Request {
  requestId?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: Error | HttpException | AppException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<RequestWithId>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    // Handle AppException with custom error structure
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
      };
      res.status(status).json(payload);
      return;
    }

    // Handle other exceptions
    const payload = {
      success: false,
      error: {
        code: status,
        message: exception?.message ?? 'Internal Server Error',
        details: exception instanceof HttpException ? exception.getResponse() : null,
        fieldErrors: null,
      },
      requestId: req?.requestId,
    };
    res.status(status).json(payload);
  }
}
