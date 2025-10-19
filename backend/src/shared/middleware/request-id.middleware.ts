import { v4 as uuid } from 'uuid';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

interface RequestWithId extends Request {
  requestId: string;
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: RequestWithId, res: Response, next: () => void) {
    const headerValue = req.headers['x-request-id'];
    const id = Array.isArray(headerValue) ? headerValue[0] : headerValue || uuid();
    req.requestId = id;
    res.setHeader('X-Request-Id', id);
    next();
  }
}