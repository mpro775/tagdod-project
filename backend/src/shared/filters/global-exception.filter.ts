import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const payload = {
      success: false,
      error: {
        code: status,
        message: exception?.message ?? 'Internal Server Error',
        details: exception?.response ?? null,
      },
      requestId: req?.requestId,
    };
    res.status(status).json(payload);
  }
}
