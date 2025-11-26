import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import { v4 as uuidv4 } from 'uuid';

export interface FileUploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  path: string;
}

export interface BunnyCredentials {
  storageZoneName: string;
  apiKey: string;
  hostname: string;
  cdnHostname?: string;
}

/**
 * File Storage Service for Analytics Reports
 * Handles file uploads to Bunny.net Storage
 */
@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);
  private readonly bunnyCredentials: BunnyCredentials;
  private readonly defaultFolder = 'analytics/reports';

  constructor(private configService: ConfigService) {
    // Read all configuration from environment variables
    this.bunnyCredentials = {
      storageZoneName: this.configService.get<string>('BUNNY_STORAGE_ZONE') || '',
      apiKey: this.configService.get<string>('BUNNY_API_KEY') || '',
      hostname: this.configService.get<string>('BUNNY_HOSTNAME') || 'storage.bunnycdn.com',
      cdnHostname: this.configService.get<string>('BUNNY_CDN_HOSTNAME'),
    };

    // Validate required credentials
    if (!this.bunnyCredentials.storageZoneName) {
      this.logger.warn('BUNNY_STORAGE_ZONE not configured - file storage will fail');
    }
    if (!this.bunnyCredentials.apiKey) {
      this.logger.warn('BUNNY_API_KEY not configured - file storage will fail');
    }
  }

  /**
   * Upload buffer to Bunny.net Storage
   */
  async uploadBuffer(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    folder: string = this.defaultFolder,
  ): Promise<FileUploadResult> {
    try {
      if (!this.bunnyCredentials.storageZoneName || !this.bunnyCredentials.apiKey) {
        throw new Error('Bunny.net credentials not configured');
      }

      // Generate unique filename if needed
      const fileExtension = filename.split('.').pop() || 'bin';
      const baseName = filename.replace(/\.[^/.]+$/, '') || uuidv4();
      const uniqueFilename = `${baseName}.${fileExtension}`;
      const filePath = `${folder}/${uniqueFilename}`;

      // Clean hostname (remove http/https if present)
      const rawHost = this.bunnyCredentials.hostname.replace(/^https?:\/\//, '');
      const uploadUrl = `https://${rawHost}/${this.bunnyCredentials.storageZoneName}/${filePath}`;

      // Upload to Bunny.net
      const res: AxiosResponse = await axios.put(uploadUrl, buffer, {
        headers: {
          AccessKey: this.bunnyCredentials.apiKey,
          'Content-Type': mimeType,
        },
        validateStatus: () => true,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      if (res.status !== 201) {
        this.logger.error(`Bunny upload failed: ${res.status} ${res.statusText} | ${uploadUrl}`);
        throw new Error(`Failed to upload file to Bunny.net: ${res.status} ${res.statusText}`);
      }

      // Generate public URL with CDN fallback
      let publicUrl: string;
      if (this.bunnyCredentials.cdnHostname) {
        // Use CDN URL if available
        const cdnHost = this.bunnyCredentials.cdnHostname.replace(/^https?:\/\//, '');
        publicUrl = `https://${cdnHost}/${filePath}`;
      } else {
        // Fallback to direct storage URL
        publicUrl = `https://${rawHost}/${this.bunnyCredentials.storageZoneName}/${filePath}`;
      }

      this.logger.log(`File uploaded successfully: ${publicUrl} (${buffer.length} bytes)`);

      return {
        url: publicUrl,
        filename: uniqueFilename,
        size: buffer.length,
        mimeType,
        path: filePath,
      };
    } catch (error) {
      this.logger.error('Upload error:', error);
      throw error instanceof Error ? error : new Error('Failed to upload file');
    }
  }

  /**
   * Delete file from Bunny.net Storage
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      if (!this.bunnyCredentials.storageZoneName || !this.bunnyCredentials.apiKey) {
        throw new Error('Bunny.net credentials not configured');
      }

      const rawHost = this.bunnyCredentials.hostname.replace(/^https?:\/\//, '');
      const deleteUrl = `https://${rawHost}/${this.bunnyCredentials.storageZoneName}/${filePath}`;

      const response: AxiosResponse = await axios.delete(deleteUrl, {
        headers: {
          AccessKey: this.bunnyCredentials.apiKey,
        },
        validateStatus: () => true,
      });

      if (response.status !== 200 && response.status !== 404) {
        this.logger.warn(
          `Failed to delete file: ${response.status} ${response.statusText} | ${filePath}`,
        );
        throw new Error(`Failed to delete file: ${response.status}`);
      }

      this.logger.log(`File deleted successfully: ${filePath}`);
    } catch (error) {
      this.logger.error('Delete error:', error);
      throw error instanceof Error ? error : new Error('Failed to delete file');
    }
  }

  /**
   * Check if file exists in Bunny.net Storage
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      if (!this.bunnyCredentials.storageZoneName || !this.bunnyCredentials.apiKey) {
        return false;
      }

      const rawHost = this.bunnyCredentials.hostname.replace(/^https?:\/\//, '');
      const url = `https://${rawHost}/${this.bunnyCredentials.storageZoneName}/${filePath}`;

      const response: AxiosResponse = await axios.head(url, {
        headers: {
          AccessKey: this.bunnyCredentials.apiKey,
        },
        validateStatus: () => true,
      });

      return response.status === 200;
    } catch (error) {
      this.logger.debug(`File existence check failed: ${filePath}`, error);
      return false;
    }
  }

  /**
   * Get file info from Bunny.net Storage
   */
  async getFileInfo(filePath: string): Promise<{
    exists: boolean;
    size?: number;
    lastModified?: string;
    contentType?: string;
  }> {
    try {
      if (!this.bunnyCredentials.storageZoneName || !this.bunnyCredentials.apiKey) {
        return { exists: false };
      }

      const rawHost = this.bunnyCredentials.hostname.replace(/^https?:\/\//, '');
      const url = `https://${rawHost}/${this.bunnyCredentials.storageZoneName}/${filePath}`;

      const response: AxiosResponse = await axios.head(url, {
        headers: {
          AccessKey: this.bunnyCredentials.apiKey,
        },
        validateStatus: () => true,
      });

      if (response.status !== 200) {
        return { exists: false };
      }

      return {
        exists: true,
        size: parseInt(response.headers['content-length'] || '0', 10),
        lastModified: response.headers['last-modified'],
        contentType: response.headers['content-type'],
      };
    } catch (error) {
      this.logger.debug(`File info check failed: ${filePath}`, error);
      return { exists: false };
    }
  }
}
