import { BaseEntity, ListParams } from '@/shared/types/common.types';

// Media Enums - متطابق 100% مع Backend
export enum MediaCategory {
  BANNER = 'banner',
  PRODUCT = 'product',
  CATEGORY = 'category',
  BRAND = 'brand',
  OTHER = 'other',
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
}

// Media Interface - متطابق تماماً مع Backend
export interface Media extends BaseEntity {
  url: string;
  filename: string;
  storedFilename: string;
  name: string;
  category: MediaCategory;
  type: MediaType;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  fileHash?: string;
  description?: string;
  tags?: string[];
  uploadedBy: string;
  usageCount: number;
  usedIn?: string[];
  isPublic: boolean;
  deletedAt?: Date | null;
  deletedBy?: string;
}

// DTOs - متطابقة مع Backend

export interface UploadMediaDto {
  name: string;
  category: MediaCategory;
  description?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface UpdateMediaDto {
  name?: string;
  description?: string;
  tags?: string[];
  category?: MediaCategory;
  isPublic?: boolean;
}

export interface ListMediaParams extends ListParams {
  category?: MediaCategory;
  type?: MediaType;
  search?: string;
  includeDeleted?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Media Stats
export interface MediaStats {
  total: number;
  byCategory: Record<MediaCategory, number>;
  byType: Record<MediaType, number>;
  totalSize: number;
  averageSize: number;
}

// Upload Response
export interface UploadResponse {
  data: Media;
  meta: {
    isDuplicate: boolean;
  };
  message: string;
}
