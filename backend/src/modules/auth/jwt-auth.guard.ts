import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { UnauthorizedException } from '../../shared/exceptions/domain.exceptions';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);
  
  constructor(private tokens: TokensService) {}
  
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const h = req.headers['authorization'];
    
    if (!h) {
      this.logger.warn(`Missing authorization header for ${req.method} ${req.url}`);
      throw new UnauthorizedException({ reason: 'missing_authorization_header' });
    }
    
    const [type, token] = String(h).split(' ');
    
    if (type !== 'Bearer' || !token) {
      this.logger.warn(`Invalid token format for ${req.method} ${req.url}`);
      throw new UnauthorizedException({ reason: 'invalid_token_format' });
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
      return true;
    } catch (error) {
      this.logger.warn(`Token verification failed for ${req.method} ${req.url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new UnauthorizedException({ 
        reason: 'invalid_or_expired_token',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
