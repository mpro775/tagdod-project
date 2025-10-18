import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { Media, MediaSchema } from './schemas/media.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    // Configure Multer for file uploads with enhanced validation
    MulterModule.register({
      limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default (from env)
        files: parseInt(process.env.MAX_FILES || '10'), // Max 10 files per request
      },
      fileFilter: (req, file, callback) => {
        // Allowed MIME types from environment or default
        const allowedTypes = process.env.ALLOWED_FILE_TYPES 
          ? process.env.ALLOWED_FILE_TYPES.split(',').map(type => type.trim())
          : [
              'image/jpeg',
              'image/jpg', 
              'image/png',
              'image/gif',
              'image/webp',
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/vnd.ms-excel',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ];
        
        if (allowedTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new Error(`File type ${file.mimetype} not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
        }
      },
    }),
    MongooseModule.forFeature([
      { name: Media.name, schema: MediaSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuthModule,
  ],
  controllers: [UploadController, MediaController],
  providers: [UploadService, MediaService],
  exports: [UploadService, MediaService], // Export services so other modules can use them
})
export class UploadModule {}
