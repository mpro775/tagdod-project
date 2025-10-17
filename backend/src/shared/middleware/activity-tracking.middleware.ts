import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../modules/users/schemas/user.schema';

@Injectable()
export class ActivityTrackingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ActivityTrackingMiddleware.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Only track activity for authenticated users
      if (req.user?.userId) {
        await this.updateUserActivity(req.user.userId);
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
