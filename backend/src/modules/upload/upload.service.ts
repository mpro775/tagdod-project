import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
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
    this.bunnyCredentials = {
      storageZoneName: this.configService.get<string>('BUNNY_STORAGE_ZONE') || '',
      apiKey: this.configService.get<string>('BUNNY_API_KEY') || '',
      hostname: this.configService.get<string>('BUNNY_HOSTNAME') || '',
    };

    if (!this.bunnyCredentials.storageZoneName || !this.bunnyCredentials.apiKey) {
      throw new Error('Bunny.net credentials not configured');
    }
  }

  /**
   * Upload file to Bunny.net Storage
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
    customFilename?: string
  ): Promise<UploadResult> {
    try {
      // Validate file
      this.validateFile(file);

      // Generate unique filename
      const filename = customFilename || `${uuidv4()}-${file.originalname}`;
      const filePath = `${folder}/${filename}`;

      // Upload to Bunny.net
      const uploadUrl = `https://${this.bunnyCredentials.hostname}/${this.bunnyCredentials.storageZoneName}/${filePath}`;

      const response: AxiosResponse = await axios.put(uploadUrl, file.buffer, {
        headers: {
          'AccessKey': this.bunnyCredentials.apiKey,
          'Content-Type': file.mimetype,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      if (response.status !== 201) {
        throw new BadRequestException('Failed to upload file to Bunny.net');
      }

      // Generate public URL (assuming CDN is enabled)
      const cdnHostname = this.configService.get<string>('BUNNY_CDN_HOSTNAME');
      const publicUrl = cdnHostname
        ? `https://${cdnHostname}/${filePath}`
        : `https://${this.bunnyCredentials.hostname}/${filePath}`;

      return {
        url: publicUrl,
        filename: filePath,
        size: file.size,
        mimeType: file.mimetype,
      };
    } catch (error) {
      this.logger.error('Upload error:', error);
      throw new BadRequestException('File upload failed');
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: Express.Multer.File[],
    folder: string = 'uploads'
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
          'AccessKey': this.bunnyCredentials.apiKey,
        },
      });

      if (response.status !== 200) {
        throw new BadRequestException('Failed to delete file from Bunny.net');
      }
    } catch (error) {
      this.logger.error('Delete error:', error);
      throw new BadRequestException('File deletion failed');
    }
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: Express.Multer.File): void {
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    // Check file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} not allowed. Allowed types: ${allowedTypes.join(', ')}`
      );
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
          'AccessKey': this.bunnyCredentials.apiKey,
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
