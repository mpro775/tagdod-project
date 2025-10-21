import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../modules/users/schemas/user.schema';

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
  ) {}

  async use(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      // Only track activity for authenticated users
      if (req.user?.sub) {
        await this.updateUserActivity(req.user.sub);
      }
    } catch (error) {
      // Don't block the request if activity tracking fails
      this.logger.warn('Failed to track user activity:', error);
    }

    next();
  }

  private async updateUserActivity(userId: string): Promise<void> {
    try {
      await this.userModel.updateOne(
        { _id: userId },
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
