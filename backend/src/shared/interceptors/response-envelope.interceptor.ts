import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest();
    const requestId = req.id ?? null;
    return next.handle().pipe(
      map((original) => {
        const hasMeta = original && typeof original === 'object' && 'meta' in original;
        const data = hasMeta ? original.data : original;
        const meta = hasMeta ? original.meta : null;
        return { success: true, data, meta, requestId };
      }),
    );
  }
}
