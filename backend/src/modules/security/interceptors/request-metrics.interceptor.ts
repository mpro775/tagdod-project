import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { format } from 'date-fns';
import { CacheService } from '../../../shared/cache/cache.service';

@Injectable()
export class RequestMetricsInterceptor implements NestInterceptor {
  constructor(private readonly cacheService: CacheService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startTime = Date.now();
    const minuteKey = format(new Date(), 'yyyyMMddHHmm');
    const hashKey = `metrics:requests:${minuteKey}`;

    return next.handle().pipe(
      tap({
        next: async () => {
          const duration = Date.now() - startTime;
          try {
            const client = this.cacheService.getClient();
            await client.hincrby(this.withPrefix(hashKey), 'total', 1);
            await client.hincrby(this.withPrefix(hashKey), 'durationMs', duration);
            // expire after 2 hours
            await client.expire(this.withPrefix(hashKey), 60 * 120);
          } catch {
            // ignore metrics failures
          }
        },
        error: async (err: unknown) => {
          const duration = Date.now() - startTime;
          try {
            const client = this.cacheService.getClient();
            await client.hincrby(this.withPrefix(hashKey), 'total', 1);
            // Count only server errors (>=500) to reflect reliability, not user/client errors
            const status = this.extractStatusCode(err);
            if (status >= 500) {
              await client.hincrby(this.withPrefix(hashKey), 'errors', 1);
            }
            await client.hincrby(this.withPrefix(hashKey), 'durationMs', duration);
            await client.expire(this.withPrefix(hashKey), 60 * 120);
          } catch {
            // ignore metrics failures
          }
        },
      }),
    );
  }

  private withPrefix(key: string): string {
    // Use environment-specific prefix to avoid conflicts
    const prefix = process.env.CACHE_PREFIX || 'tagadodo';
    return `${prefix}:${key}`;
  }

  private extractStatusCode(err: unknown): number {
    try {
      const anyErr = err as { getStatus?: () => number; status?: number };
      if (typeof anyErr?.getStatus === 'function') {
        return anyErr.getStatus() || 500;
      }
      if (typeof anyErr?.status === 'number') {
        return anyErr.status;
      }
      return 500;
    } catch {
      return 500;
    }
  }
}


