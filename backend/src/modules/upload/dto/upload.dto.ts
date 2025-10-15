import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UploadFileDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File to upload',
  })
  file: any;

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
