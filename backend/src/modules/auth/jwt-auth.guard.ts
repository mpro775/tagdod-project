import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { TokensService } from './tokens.service';
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private tokens: TokensService) {}
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const h = req.headers['authorization'];
    if (!h) return false;
    const [type, token] = String(h).split(' ');
    if (type !== 'Bearer' || !token) return false;
    try {
      req.user = this.tokens.verifyAccess(token) as {
        sub: string;
        phone: string;
        isAdmin: boolean;
        roles?: string[];
        permissions?: string[];
      };
      return true;
    } catch {
      return false;
    }
  }
}
