import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { MediaController } from './media.controller';
import { MediaAnalyticsController } from './media-analytics.controller';
import { MediaService } from './media.service';
import { Media, MediaSchema } from './schemas/media.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { AuthModule } from '../auth/auth.module';

import { SharedModule } from '../../shared/shared.module';
@Module({
  imports: [
    // Configure Multer for file uploads - basic limits only, validation in service
    MulterModule.register({
      limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default (from env)
        files: parseInt(process.env.MAX_FILES || '10'), // Max 10 files per request
      },
      // Remove fileFilter - validation will be handled in the service layer
    }),
    MongooseModule.forFeature([
      { name: Media.name, schema: MediaSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuthModule,
    SharedModule,
  ],
  controllers: [UploadController, MediaController, MediaAnalyticsController],
  providers: [UploadService, MediaService],
  exports: [UploadService, MediaService], // Export services so other modules can use them
})
export class UploadModule {}
