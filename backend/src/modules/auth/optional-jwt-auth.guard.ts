import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { TokensService } from './tokens.service';

/**
 * Optional JWT Auth Guard - extracts user from token if present, but doesn't require authentication
 * Always returns true, but populates req.user if valid token is provided
 */
@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private tokens: TokensService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const h = req.headers['authorization'];
    
    if (!h) {
      return true; // No token, but allow request
    }

    const [type, token] = String(h).split(' ');
    if (type !== 'Bearer' || !token) {
      return true; // Invalid format, but allow request
    }

    try {
      req.user = this.tokens.verifyAccess(token) as {
        sub: string;
        phone: string;
        isAdmin: boolean;
        roles?: string[];
        permissions?: string[];
        preferredCurrency?: string;
      };
    } catch {
      // Invalid token, but allow request (user will be undefined)
    }

    return true; // Always allow request
  }
}

