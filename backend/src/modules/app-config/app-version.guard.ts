import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppConfigService } from './app-config.service';

export const SKIP_APP_VERSION_CHECK = 'skipAppVersionCheck';

/**
 * Guard that returns 426 Upgrade Required when X-App-Version is blocked or outdated.
 * Apply to routes that should reject old/blocked app versions.
 * Exclude GET /app/config and health routes (do not use this guard on them).
 * Use @SetMetadata(SKIP_APP_VERSION_CHECK, true) on a controller or handler to skip the check.
 */
@Injectable()
export class AppVersionGuard implements CanActivate {
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_APP_VERSION_CHECK, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) return true;

    const request = context.switchToHttp().getRequest();
    const appVersion = request.headers['x-app-version'] as string | undefined;

    if (!appVersion || !appVersion.trim()) {
      return true;
    }

    const blocked = await this.appConfigService.isVersionBlockedOrOutdated(
      appVersion.trim(),
    );
    if (blocked) {
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'UPGRADE_REQUIRED',
            message: 'يجب تحديث التطبيق لاستمرار الاستخدام',
            details: { reason: 'app_version_blocked_or_outdated' },
          },
        },
        426, // HttpStatus.UPGRADE_REQUIRED (426) - not in all Nest/Node versions
      );
    }
    return true;
  }
}
