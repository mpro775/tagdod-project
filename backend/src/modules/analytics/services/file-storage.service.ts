import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import {
  AnalyticsExportStorageNotConfiguredException,
  AnalyticsExportUploadFailedException,
} from '../../../shared/exceptions';

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
 * Handles file uploads to Bunny.net Storage with local fallback for dev/staging
 */
@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);
  private readonly bunnyCredentials: BunnyCredentials;
  private readonly defaultFolder = 'analytics/reports';
  private readonly nodeEnv: string;
  private readonly localUploadDir: string;

  constructor(private configService: ConfigService) {
    this.nodeEnv = this.configService.get<string>('NODE_ENV') || 'development';
    this.localUploadDir = this.configService.get<string>('LOCAL_UPLOAD_DIR') || path.join(process.cwd(), 'uploads', 'reports');

    // Read all configuration from environment variables
    this.bunnyCredentials = {
      storageZoneName: this.configService.get<string>('BUNNY_STORAGE_ZONE') || '',
      apiKey: this.configService.get<string>('BUNNY_API_KEY') || '',
      hostname: this.configService.get<string>('BUNNY_HOSTNAME') || 'storage.bunnycdn.com',
      cdnHostname: this.configService.get<string>('BUNNY_CDN_HOSTNAME'),
    };

    // Validate required credentials
    if (!this.bunnyCredentials.storageZoneName) {
      this.logger.warn('BUNNY_STORAGE_ZONE not configured');
    }
    if (!this.bunnyCredentials.apiKey) {
      this.logger.warn('BUNNY_API_KEY not configured');
    }
  }

  private isBunnyConfigured(): boolean {
    return !!(
      this.bunnyCredentials.storageZoneName &&
      this.bunnyCredentials.apiKey
    );
  }

  private isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  private ensureLocalDir(folder: string): string {
    const dir = path.join(this.localUploadDir, folder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  private async uploadLocal(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    folder: string,
  ): Promise<FileUploadResult> {
    const dir = this.ensureLocalDir(folder);
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, buffer);

    this.logger.log(`File saved locally: ${filePath} (${buffer.length} bytes)`);

    return {
      url: `file://${filePath}`,
      filename,
      size: buffer.length,
      mimeType,
      path: `${folder}/${filename}`,
    };
  }

  /**
   * Upload buffer to Bunny.net Storage or local fallback
   */
  async uploadBuffer(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    folder: string = this.defaultFolder,
  ): Promise<FileUploadResult> {
    // Generate unique filename if needed
    const fileExtension = filename.split('.').pop() || 'bin';
    const baseName = filename.replace(/\.[^/.]+$/, '') || uuidv4();
    const uniqueFilename = `${baseName}.${fileExtension}`;

    if (!this.isBunnyConfigured()) {
      if (this.isProduction()) {
        this.logger.error('Bunny.net credentials not configured in production');
        throw new AnalyticsExportStorageNotConfiguredException({
          provider: 'bunny',
          env: this.nodeEnv,
        });
      }
      this.logger.warn('Bunny.net not configured. Using local file storage fallback.');
      return this.uploadLocal(buffer, uniqueFilename, mimeType, folder);
    }

    try {
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
        throw new AnalyticsExportUploadFailedException({
          status: res.status,
          statusText: res.statusText,
          url: uploadUrl,
        });
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
      this.logger.error('Upload error:', {
        error: error instanceof Error ? error.message : String(error),
        env: this.nodeEnv,
        provider: 'bunny',
      });

      if (error instanceof AnalyticsExportStorageNotConfiguredException || error instanceof AnalyticsExportUploadFailedException) {
        throw error;
      }

      throw new AnalyticsExportUploadFailedException({
        originalError: error instanceof Error ? error.message : String(error),
        env: this.nodeEnv,
      });
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
