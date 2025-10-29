import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import { 
  UploadFailedException,
  FileTooLargeException,
  InvalidFileTypeException,
  UploadException,
  ErrorCode 
} from '../../shared/exceptions';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

export interface BunnyCredentials {
  storageZoneName: string;
  apiKey: string;
  hostname: string;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly bunnyCredentials: BunnyCredentials;

  constructor(private configService: ConfigService) {
    // Read all configuration from environment variables only
    this.bunnyCredentials = {
      storageZoneName: this.configService.get<string>('BUNNY_STORAGE_ZONE') || '',
      apiKey: this.configService.get<string>('BUNNY_API_KEY') || '',
      hostname: this.configService.get<string>('BUNNY_HOSTNAME') || 'storage.bunnycdn.com',
    };

    // Validate required credentials with clear error messages
    if (!this.bunnyCredentials.storageZoneName) {
      throw new UploadException(ErrorCode.SERVICE_UNAVAILABLE, { reason: 'BUNNY_STORAGE_ZONE not configured' });
    }
    if (!this.bunnyCredentials.apiKey) {
      throw new UploadException(ErrorCode.SERVICE_UNAVAILABLE, { reason: 'BUNNY_API_KEY not configured' });
    }
  }

  /**
   * Upload file to Bunny.net Storage
   */
  async uploadFile(
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    folder: string = 'uploads',
    customFilename?: string,
  ): Promise<UploadResult> {
    try {
      // Validate file
      this.validateFile(file);

      // Generate unique filename with consistent naming
      const fileExtension = file.originalname.split('.').pop();
      const baseName = file.originalname.replace(/\.[^/.]+$/, '');
      const filename = customFilename || `${uuidv4()}-${baseName}.${fileExtension}`;
      const filePath = `${folder}/${filename}`;

      // Upload to Bunny.net
      const rawHost = this.configService.get<string>('BUNNY_HOSTNAME') || 'storage.bunnycdn.com';
      const hostname = rawHost.replace(/^https?:\/\//, ''); // يشيل http/https لو موجود

      const uploadUrl = `https://${hostname}/${this.bunnyCredentials.storageZoneName}/${filePath}`;

      const res = await axios.put(uploadUrl, file.buffer, {
        headers: {
          AccessKey: this.bunnyCredentials.apiKey, // Storage Zone Password
          'Content-Type': file.mimetype,
        },
        validateStatus: () => true,
      });

      if (res.status !== 201) {
        this.logger.error(`Bunny upload failed: ${res.status} ${res.statusText} | ${uploadUrl}`);
        
        // Return specific error messages based on status code
        if (res.status === 401) {
          throw new UploadFailedException({ reason: 'invalid_bunny_credentials' });
        } else if (res.status === 403) {
          throw new UploadFailedException({ reason: 'bunny_access_denied' });
        } else if (res.status === 413) {
          throw new FileTooLargeException();
        } else {
          throw new UploadFailedException({ status: res.status });
        }
      }

      // Generate public URL with CDN fallback
      const cdnHostname = this.configService.get<string>('BUNNY_CDN_HOSTNAME');
      let publicUrl: string;
      
      if (cdnHostname) {
        // Use CDN URL if available
        publicUrl = `https://${cdnHostname.replace(/^https?:\/\//, '')}/${filePath}`;
      } else {
        // Fallback to direct storage URL
        publicUrl = `https://${this.bunnyCredentials.hostname}/${this.bunnyCredentials.storageZoneName}/${filePath}`;
      }

      this.logger.log(`File uploaded successfully: ${publicUrl}`);

      return {
        url: publicUrl,
        filename: filePath,
        size: file.size,
        mimeType: file.mimetype,
      };
    } catch (error) {
      this.logger.error('Upload error:', error);
      
      // Handle specific error types
      if (error instanceof UploadFailedException || error instanceof FileTooLargeException) {
        throw error; // Re-throw our custom errors
      } else if (error instanceof Error && ('code' in error) && (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED')) {
        throw new UploadException(ErrorCode.NETWORK_ERROR, { reason: 'bunny_connection_failed' });
      } else {
        throw new UploadFailedException();
      }
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: { buffer: Buffer; originalname: string; mimetype: string; size: number }[],
    folder: string = 'uploads',
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (const file of files) {
      const result = await this.uploadFile(file, folder);
      results.push(result);
    }

    return results;
  }

  /**
   * Delete file from Bunny.net Storage
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const deleteUrl = `https://${this.bunnyCredentials.hostname}/${this.bunnyCredentials.storageZoneName}/${filePath}`;

      const response: AxiosResponse = await axios.delete(deleteUrl, {
        headers: {
          AccessKey: this.bunnyCredentials.apiKey,
        },
      });

      if (response.status !== 200) {
        throw new UploadException(ErrorCode.MEDIA_DELETE_FAILED, { filePath });
      }
    } catch (error) {
      this.logger.error('Delete error:', error);
      throw new UploadException(ErrorCode.MEDIA_DELETE_FAILED, { filePath });
    }
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
  }): void {
    // Get limits from environment variables
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB default
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

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      throw new FileTooLargeException({ size: file.size, maxSize: maxSizeMB * 1024 * 1024 });
    }

    // Check file type
    if (!allowedTypes.includes(file.mimetype)) {
      throw new InvalidFileTypeException({ type: file.mimetype, allowedTypes });
    }
  }

  /**
   * Get file info from Bunny.net
   */
  async getFileInfo(filePath: string): Promise<{
    exists: boolean;
    size?: number;
    lastModified?: string;
    contentType?: string;
  }> {
    try {
      const url = `https://${this.bunnyCredentials.hostname}/${this.bunnyCredentials.storageZoneName}/${filePath}`;

      const response: AxiosResponse = await axios.head(url, {
        headers: {
          AccessKey: this.bunnyCredentials.apiKey,
        },
      });

      return {
        exists: response.status === 200,
        size: response.headers['content-length'],
        lastModified: response.headers['last-modified'],
        contentType: response.headers['content-type'],
      };
    } catch (error) {
      return { exists: false };
    }
  }
}
