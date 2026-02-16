import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import {
  UploadFailedException,
  FileTooLargeException,
  InvalidFileTypeException,
  UploadException,
  ErrorCode,
} from '../../shared/exceptions';
import { v4 as uuidv4 } from 'uuid';

export interface BunnyStreamCredentials {
  libraryId: string;
  apiKey: string;
  hostname?: string;
  cdnHostname?: string;
}

export interface VideoUploadResult {
  videoId: string;
  guid: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  status: 'processing' | 'ready' | 'failed';
  duration?: number;
  size: number;
  mimeType: string;
}

export interface VideoLibrary {
  VideoLibraryId: number;
  Name: string;
  MaxFileSize: number;
  AllowedOrigins: string[];
  WatermarkSettings: any;
}

@Injectable()
export class BunnyStreamService {
  private readonly logger = new Logger(BunnyStreamService.name);
  private readonly bunnyStreamCredentials: BunnyStreamCredentials;

  constructor(private configService: ConfigService) {
    this.bunnyStreamCredentials = {
      libraryId: this.configService.get<string>('BUNNY_STREAM_LIBRARY_ID') || '600364',
      apiKey:
        this.configService.get<string>('BUNNY_STREAM_API_KEY') ||
        'c1368f6a-4139-4169-84a66c6b0e63-e60b-42a9',
      hostname: this.configService.get<string>('BUNNY_STREAM_HOSTNAME') || 'video.bunnycdn.com',
      cdnHostname:
        this.configService.get<string>('BUNNY_STREAM_CDN_HOSTNAME') ||
        `${this.configService.get<string>('BUNNY_STREAM_LIBRARY_ID') || '600364'}.b-cdn.net`,
    };

    // Validate required credentials
    if (!this.bunnyStreamCredentials.libraryId) {
      throw new UploadException(ErrorCode.SERVICE_UNAVAILABLE, {
        reason: 'BUNNY_STREAM_LIBRARY_ID not configured',
      });
    }
    if (!this.bunnyStreamCredentials.apiKey) {
      throw new UploadException(ErrorCode.SERVICE_UNAVAILABLE, {
        reason: 'BUNNY_STREAM_API_KEY not configured',
      });
    }
  }

  private normalizeVideoStatus(rawStatus: unknown): 'processing' | 'ready' | 'failed' {
    if (typeof rawStatus === 'number') {
      if (rawStatus <= 0) return 'processing';
      if (rawStatus === 1) return 'ready';
      if (rawStatus >= 2) return 'failed';
    }

    const status = String(rawStatus ?? '').toLowerCase();
    if (!status) return 'processing';
    if (
      status.includes('ready') ||
      status.includes('published') ||
      status.includes('finished') ||
      status.includes('completed')
    ) {
      return 'ready';
    }
    if (status.includes('fail') || status.includes('error')) {
      return 'failed';
    }
    return 'processing';
  }

  private buildPlaybackUrl(guid: string): string {
    return `https://${this.bunnyStreamCredentials.cdnHostname}/${guid}/playlist.m3u8`;
  }

  private buildThumbnailUrl(guid: string): string {
    return `https://${this.bunnyStreamCredentials.cdnHostname}/${guid}/thumbnail.jpg`;
  }

  private normalizeVideoInfo(raw: Record<string, unknown>): {
    id: string;
    title: string;
    guid: string;
    url: string;
    thumbnailUrl?: string;
    status: 'processing' | 'ready' | 'failed';
    duration?: number;
    width?: number;
    height?: number;
    fps?: number;
    bitrate?: number;
    size?: number;
  } {
    const id = String(raw.id ?? raw.videoId ?? raw.videoLibraryId ?? raw.videoGuid ?? raw.guid ?? '');
    const guid = String(raw.guid ?? raw.videoGuid ?? raw.Guid ?? '');
    const title = String(raw.title ?? raw.Title ?? raw.name ?? raw.Name ?? '');

    const url =
      String(
        raw.url ??
          raw.playbackUrl ??
          raw.directPlayUrl ??
          raw.playUrl ??
          raw.hlsUrl ??
          raw.HLSUrl ??
          '',
      ) || (guid ? this.buildPlaybackUrl(guid) : '');

    const thumbnailUrl =
      String(raw.thumbnailUrl ?? raw.thumbnailURL ?? raw.thumbnailFileName ?? '') ||
      (guid ? this.buildThumbnailUrl(guid) : '');

    return {
      id,
      title,
      guid,
      url,
      thumbnailUrl: thumbnailUrl || undefined,
      status: this.normalizeVideoStatus(raw.status ?? raw.Status),
      duration: typeof raw.length === 'number' ? raw.length : (raw.duration as number | undefined),
      width: raw.width as number | undefined,
      height: raw.height as number | undefined,
      fps: raw.fps as number | undefined,
      bitrate: raw.bitrate as number | undefined,
      size: (raw.storageSize as number | undefined) ?? (raw.size as number | undefined),
    };
  }

  /**
   * Get video library information
   */
  async getVideoLibrary(): Promise<VideoLibrary> {
    try {
      const url = `https://${this.bunnyStreamCredentials.hostname}/library/${this.bunnyStreamCredentials.libraryId}`;

      const response: AxiosResponse<VideoLibrary> = await axios.get(url, {
        headers: {
          AccessKey: this.bunnyStreamCredentials.apiKey,
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error('Failed to get video library:', error);
      throw new UploadException(ErrorCode.SERVICE_UNAVAILABLE, {
        reason: 'bunny_stream_library_error',
      });
    }
  }

  /**
   * Upload video to Bunny Stream
   */
  async uploadVideo(
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    title?: string,
  ): Promise<VideoUploadResult> {
    try {
      // Validate video file
      this.validateVideoFile(file);

      // Get video library info to check file size limits
      const library = await this.getVideoLibrary();
      if (file.size > library.MaxFileSize) {
        throw new FileTooLargeException({ size: file.size, maxSize: library.MaxFileSize });
      }

      // Generate unique video title
      const videoTitle = title || file.originalname;
      const videoGuid = uuidv4();

      // Step 1: Create video object
      const createVideoUrl = `https://${this.bunnyStreamCredentials.hostname}/library/${this.bunnyStreamCredentials.libraryId}/videos`;

      const createResponse = await axios.post(
        createVideoUrl,
        {
          title: videoTitle,
          guid: videoGuid,
        },
        {
          headers: {
            AccessKey: this.bunnyStreamCredentials.apiKey,
            'Content-Type': 'application/json',
          },
        },
      );

      const createdVideoId = String(createResponse.data?.id ?? '');
      const createdVideoGuid = String(createResponse.data?.guid ?? videoGuid);

      this.logger.debug(
        `Bunny Stream video created. id=${createdVideoId || 'n/a'}, guid=${createdVideoGuid || 'n/a'}`,
      );

      const uploadTargets = [createdVideoGuid, createdVideoId].filter(
        (value, index, arr) => Boolean(value) && arr.indexOf(value) === index,
      );

      if (uploadTargets.length === 0) {
        throw new UploadFailedException({ reason: 'create_video_missing_id_and_guid' });
      }

      // Step 2: Upload video file (fallback between guid/id)
      let uploadSucceeded = false;
      let lastUploadStatus: number | undefined;
      let lastUploadStatusText: string | undefined;

      for (const target of uploadTargets) {
        const uploadUrl = `https://${this.bunnyStreamCredentials.hostname}/library/${this.bunnyStreamCredentials.libraryId}/videos/${target}`;
        const uploadResponse = await axios.put(uploadUrl, file.buffer, {
          headers: {
            AccessKey: this.bunnyStreamCredentials.apiKey,
            'Content-Type': file.mimetype,
          },
          validateStatus: () => true,
        });

        if (uploadResponse.status >= 200 && uploadResponse.status < 300) {
          uploadSucceeded = true;
          break;
        }

        lastUploadStatus = uploadResponse.status;
        lastUploadStatusText = uploadResponse.statusText;
        this.logger.warn(
          `Bunny Stream upload attempt failed for target=${target}: ${uploadResponse.status} ${uploadResponse.statusText}`,
        );
      }

      if (!uploadSucceeded) {
        this.logger.error(
          `Bunny Stream upload failed: ${lastUploadStatus ?? 'unknown'} ${lastUploadStatusText ?? ''}`,
        );
        throw new UploadFailedException({
          status: lastUploadStatus,
          reason: 'upload_failed_for_all_targets',
          targetsTried: uploadTargets,
        });
      }

      // Step 3: Get video info
      const infoTarget = createdVideoId || createdVideoGuid;
      const videoInfo = await this.getVideoInfo(infoTarget);

      this.logger.log(`Video uploaded successfully: ${videoInfo.title} (ID: ${infoTarget})`);

      return {
        videoId: videoInfo.id || infoTarget,
        guid: createdVideoGuid,
        title: videoInfo.title,
        url: videoInfo.url,
        thumbnailUrl: videoInfo.thumbnailUrl,
        status: videoInfo.status,
        duration: videoInfo.duration,
        size: file.size,
        mimeType: file.mimetype,
      };
    } catch (error) {
      this.logger.error('Video upload error:', error);

      if (error instanceof UploadFailedException || error instanceof FileTooLargeException) {
        throw error;
      } else if (
        error instanceof Error &&
        'code' in error &&
        (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED')
      ) {
        throw new UploadException(ErrorCode.NETWORK_ERROR, {
          reason: 'bunny_stream_connection_failed',
        });
      } else {
        throw new UploadFailedException();
      }
    }
  }

  /**
   * Get video information
   */
  async getVideoInfo(videoId: string): Promise<{
    id: string;
    title: string;
    guid: string;
    url: string;
    thumbnailUrl?: string;
    status: 'processing' | 'ready' | 'failed';
    duration?: number;
    width?: number;
    height?: number;
    fps?: number;
    bitrate?: number;
    size?: number;
  }> {
    try {
      const url = `https://${this.bunnyStreamCredentials.hostname}/library/${this.bunnyStreamCredentials.libraryId}/videos/${videoId}`;

      const response = await axios.get(url, {
        headers: {
          AccessKey: this.bunnyStreamCredentials.apiKey,
        },
      });

      return this.normalizeVideoInfo((response.data ?? {}) as Record<string, unknown>);
    } catch (error) {
      this.logger.error('Failed to get video info:', error);
      throw new UploadException(ErrorCode.MEDIA_NOT_FOUND, { videoId });
    }
  }

  /**
   * Delete video from Bunny Stream
   */
  async deleteVideo(videoId: string): Promise<void> {
    try {
      const url = `https://${this.bunnyStreamCredentials.hostname}/library/${this.bunnyStreamCredentials.libraryId}/videos/${videoId}`;

      const response: AxiosResponse = await axios.delete(url, {
        headers: {
          AccessKey: this.bunnyStreamCredentials.apiKey,
        },
      });

      if (response.status !== 200) {
        throw new UploadException(ErrorCode.MEDIA_DELETE_FAILED, { videoId });
      }

      this.logger.log(`Video deleted successfully: ${videoId}`);
    } catch (error) {
      this.logger.error('Video delete error:', error);
      throw new UploadException(ErrorCode.MEDIA_DELETE_FAILED, { videoId });
    }
  }

  /**
   * List videos in the library
   */
  async listVideos(
    page: number = 1,
    perPage: number = 100,
  ): Promise<{
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    items: Array<{
      id: string;
      title: string;
      guid: string;
      url: string;
      thumbnailUrl?: string;
      status: 'processing' | 'ready' | 'failed';
      duration?: number;
      uploadedAt: string;
    }>;
  }> {
    try {
      const url = `https://${this.bunnyStreamCredentials.hostname}/library/${this.bunnyStreamCredentials.libraryId}/videos`;

      const response = await axios.get(url, {
        headers: {
          AccessKey: this.bunnyStreamCredentials.apiKey,
        },
        params: {
          page,
          perPage,
        },
      });

      const payload = (response.data ?? {}) as {
        totalItems?: number;
        currentPage?: number;
        itemsPerPage?: number;
        items?: unknown[];
      };

      const itemsRaw = Array.isArray(payload.items) ? payload.items : [];
      return {
        totalItems: payload.totalItems ?? itemsRaw.length,
        currentPage: payload.currentPage ?? page,
        itemsPerPage: payload.itemsPerPage ?? perPage,
        items: itemsRaw.map((item) => {
          const info = this.normalizeVideoInfo((item ?? {}) as Record<string, unknown>);
          return {
            id: info.id,
            title: info.title,
            guid: info.guid,
            url: info.url,
            thumbnailUrl: info.thumbnailUrl,
            status: info.status,
            duration: info.duration,
            uploadedAt: String((item as Record<string, unknown>)?.dateUploaded ?? ''),
          };
        }),
      };
    } catch (error) {
      this.logger.error('Failed to list videos:', error);
      throw new UploadException(ErrorCode.SERVICE_UNAVAILABLE, {
        reason: 'bunny_stream_list_error',
      });
    }
  }

  /**
   * Validate video file before upload
   */
  private validateVideoFile(file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
  }): void {
    const allowedVideoTypes = [
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/flv',
      'video/webm',
      'video/mkv',
      'video/quicktime',
    ];

    // Check file type
    if (!allowedVideoTypes.includes(file.mimetype)) {
      throw new InvalidFileTypeException({
        type: file.mimetype,
        allowedTypes: allowedVideoTypes,
      });
    }

    // Check minimum file size (1MB)
    const minSize = 1024 * 1024; // 1MB
    if (file.size < minSize) {
      throw new UploadException(ErrorCode.UPLOAD_INVALID_FILE_SIZE, {
        reason: 'File too small for video',
        size: file.size,
        minSize,
      });
    }
  }
}
