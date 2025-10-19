import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { TokensService } from '../../modules/auth/tokens.service';

/**
 * Global Admin Guard that applies to all /api/v1/admin/* routes
 * This guard combines JWT authentication and admin authorization
 */
@Injectable()
export class AdminGlobalGuard implements CanActivate {
  private jwtGuard: JwtAuthGuard;
  private adminGuard = new AdminGuard();

  constructor(
    private reflector: Reflector,
    private tokensService: TokensService,
  ) {
    this.jwtGuard = new JwtAuthGuard(this.tokensService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const path = request.url;

    // Only apply to admin routes
    if (!path.startsWith('/api/v1/admin')) {
      return true; // Allow non-admin routes
    }

    // First check JWT authentication
    const isAuthenticated = this.jwtGuard.canActivate(context);
    if (!isAuthenticated) {
      return false;
    }

    // Then check admin authorization
    return this.adminGuard.canActivate(context);
  }
}
