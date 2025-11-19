import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap, catchError } from 'rxjs';
import { SystemMonitoringService } from '../system-monitoring.service';

@Injectable()
export class ApiMetricsInterceptor implements NestInterceptor {
  constructor(
    private readonly systemMonitoringService: SystemMonitoringService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();

    // Get endpoint path
    const route = request.route;
    const method = request.method;
    const path = route?.path || request.path || request.url;
    const endpoint = `${method} ${path}`;

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - startTime;
        const success = true;
        this.systemMonitoringService.trackRequest(endpoint, responseTime, success);
      }),
      catchError((error) => {
        const responseTime = Date.now() - startTime;
        const statusCode =
          error?.status || error?.statusCode || error?.response?.statusCode || 500;
        const success = statusCode < 400; // Only count 4xx/5xx as failures
        this.systemMonitoringService.trackRequest(endpoint, responseTime, success);
        throw error;
      }),
    );
  }
}

