import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class CacheGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Don't cache if:
    // 1. Request method is not GET
    if (request.method !== 'GET') {
      return false;
    }

    // 2. Response already has cache headers set
    if (response.getHeader('Cache-Control')) {
      return false;
    }

    // 3. Request has authorization header (authenticated requests)
    if (request.headers.authorization || request.headers['x-api-key']) {
      return false;
    }

    // 4. Request has cookies (session-based)
    if (request.headers.cookie) {
      return false;
    }

    // 5. Request has query parameters that indicate dynamic content
    const queryParams = Object.keys(request.query || {});
    const dynamicParams = ['timestamp', 'nonce', 'cache', 'nocache', '_'];
    if (queryParams.some(param => dynamicParams.includes(param.toLowerCase()))) {
      return false;
    }

    // 6. User is authenticated (has user object)
    if (request.user) {
      return false;
    }

    return true;
  }
}
