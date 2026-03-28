import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../modules/users/schemas/user.schema';
import { TokensService } from '../../modules/auth/tokens.service';

// JWT Payload interface
interface JwtUser {
  sub: string;
  phone: string;
  isAdmin: boolean;
  roles?: string[];
  permissions?: string[];
  preferredCurrency?: string;
}

// Request with JWT user
interface RequestWithUser {
  user?: JwtUser;
}

@Injectable()
export class ActivityTrackingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ActivityTrackingMiddleware.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly tokensService: TokensService,
  ) {}

  async use(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      let userId = req.user?.sub;

      // Middleware runs before guards, so req.user is usually empty here.
      // Decode Bearer token directly to identify authenticated user activity.
      if (!userId) {
        const authHeader = (req as unknown as { headers?: Record<string, string | string[] | undefined> }).headers?.authorization;
        const headerValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;

        if (headerValue?.startsWith('Bearer ')) {
          const token = headerValue.slice(7).trim();
          if (token) {
            const payload = this.tokensService.verifyAccess(token) as { sub?: string };
            userId = payload?.sub;
          }
        }
      }

      if (userId) {
        await this.updateUserActivity(userId);
      }
    } catch (error) {
      // Don't block the request if activity tracking fails
      this.logger.warn('Failed to track user activity:', error);
    }

    next();
  }

  private async updateUserActivity(userId: string): Promise<void> {
    try {
      // Validate if userId is a valid ObjectId format
      if (!Types.ObjectId.isValid(userId)) {
        this.logger.warn(`Invalid userId format: ${userId}`);
        return;
      }

      await this.userModel.updateOne(
        { _id: new Types.ObjectId(userId) },
        { 
          $set: { 
            lastActivityAt: new Date() 
          } 
        }
      );
    } catch (error) {
      this.logger.error(`Failed to update activity for user ${userId}:`, error);
    }
  }
}
