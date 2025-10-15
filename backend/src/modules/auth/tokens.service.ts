import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
@Injectable()
export class TokensService {
  private jwtSecret = process.env.JWT_SECRET as string;
  private refreshSecret = process.env.REFRESH_SECRET as string;
  signAccess(payload: { sub: string; phone: string; isAdmin: boolean }) {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: '15m' });
  }
  signRefresh(payload: { sub: string; phone: string; isAdmin: boolean }) {
    return jwt.sign(payload, this.refreshSecret, { expiresIn: '30d' });
  }
  verifyAccess(token: string) {
    return jwt.verify(token, this.jwtSecret);
  }
  verifyRefresh(token: string) {
    return jwt.verify(token, this.refreshSecret);
  }
}
