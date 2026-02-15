import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UploadFileDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File to upload',
  })
  file!: { buffer: Buffer; originalname: string; mimetype: string; size: number };

  @ApiProperty({
    description: 'Folder to upload to',
    example: 'products',
    required: false,
  })
  @IsOptional()
  @IsString()
  folder?: string;

  @ApiProperty({
    description: 'Custom filename (optional)',
    example: 'my-image.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  customFilename?: string;
}

export class UploadResponseDto {
  @ApiProperty({
    description: 'Public URL of the uploaded file',
    example: 'https://cdn.bunny.net/uploads/my-image.jpg',
  })
  url!: string;

  @ApiProperty({
    description: 'Internal filename/path',
    example: 'uploads/my-image.jpg',
  })
  filename!: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024000,
  })
  size!: number;

  @ApiProperty({
    description: 'File MIME type',
    example: 'image/jpeg',
  })
  mimeType!: string;
}

export class DeleteFileDto {
  @ApiProperty({
    description: 'Path of the file to delete',
    example: 'uploads/my-image.jpg',
  })
  @IsString()
  filePath!: string;
}

export class UploadVideoDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Video file to upload',
  })
  video!: { buffer: Buffer; originalname: string; mimetype: string; size: number };

  @ApiProperty({
    description: 'Video title (optional)',
    example: 'Product Demo Video',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;
}

export class VideoUploadResponseDto {
  @ApiProperty({
    description: 'Video ID',
    example: '123456',
  })
  videoId!: string;

  @ApiProperty({
    description: 'Video GUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  guid!: string;

  @ApiProperty({
    description: 'Video title',
    example: 'Product Demo Video',
  })
  title!: string;

  @ApiProperty({
    description: 'Video playback URL',
    example: 'https://video.bunnycdn.com/600364/550e8400-e29b-41d4-a716-446655440000/playlist.m3u8',
  })
  url!: string;

  @ApiProperty({
    description: 'Video thumbnail URL',
    example: 'https://video.bunnycdn.com/600364/550e8400-e29b-41d4-a716-446655440000/thumbnail.jpg',
    required: false,
  })
  thumbnailUrl?: string;

  @ApiProperty({
    description: 'Video processing status',
    enum: ['processing', 'ready', 'failed'],
    example: 'processing',
  })
  status!: 'processing' | 'ready' | 'failed';

  @ApiProperty({
    description: 'Video duration in seconds',
    example: 120,
    required: false,
  })
  duration?: number;

  @ApiProperty({
    description: 'File size in bytes',
    example: 10240000,
  })
  size!: number;

  @ApiProperty({
    description: 'File MIME type',
    example: 'video/mp4',
  })
  mimeType!: string;
}

export class FileInfoResponseDto {
  @ApiProperty({
    description: 'Whether the file exists',
    example: true,
  })
  exists!: boolean;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024000,
    required: false,
  })
  size?: number;

  @ApiProperty({
    description: 'Last modified date',
    example: '2023-10-13T10:00:00Z',
    required: false,
  })
  lastModified?: string;

  @ApiProperty({
    description: 'Content type',
    example: 'image/jpeg',
    required: false,
  })
  contentType?: string;
}
