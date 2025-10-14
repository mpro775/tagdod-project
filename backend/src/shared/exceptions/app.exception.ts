import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(
    public code: string = 'UNEXPECTED_ERROR',
    public userMessage: string = 'حدث خطأ غير متوقع',
    public details: unknown = null,
    status: number = HttpStatus.BAD_REQUEST,
    public fieldErrors?: Array<{ field: string; message: string }> | null,
  ) {
    super(userMessage, status);
  }
}
