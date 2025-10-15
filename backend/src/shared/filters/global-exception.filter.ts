import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

interface AppException extends Error {
  code?: string;
  userMessage?: string;
  details?: unknown;
  fieldErrors?: unknown;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const exc = exception as AppException;

    res.status(status).json({
      success: false,
      error: {
        code: exc.code ?? 'UNEXPECTED_ERROR',
        message: exc.userMessage ?? exc.message ?? 'حدث خطأ غير متوقع',
        details: exc.details ?? null,
        fieldErrors: exc.fieldErrors ?? null,
      },
      requestId: req.id ?? null,
    });
  }
}
