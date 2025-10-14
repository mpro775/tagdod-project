import { Injectable, NestMiddleware } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: any, _res: any, next: () => void) {
    req.id = req.headers['x-request-id'] || uuid();
    next();
  }
}
