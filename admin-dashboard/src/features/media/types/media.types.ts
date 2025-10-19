import { BaseEntity, ListParams } from '@/shared/types/common.types';

// Media Enums - متطابق 100% مع Backend
export enum MediaCategory {
  // eslint-disable-next-line no-unused-vars
  BANNER = 'banner',
  // eslint-disable-next-line no-unused-vars
  PRODUCT = 'product',
  // eslint-disable-next-line no-unused-vars
  CATEGORY = 'category',
  // eslint-disable-next-line no-unused-vars
  BRAND = 'brand',
  // eslint-disable-next-line no-unused-vars
  OTHER = 'other',
}

export enum MediaType {
  // eslint-disable-next-line no-unused-vars
  IMAGE = 'image',
  // eslint-disable-next-line no-unused-vars
  VIDEO = 'video',
  // eslint-disable-next-line no-unused-vars
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
  byCategory: Record<string, number>;
  byType: Record<string, number>;
  totalSize: number;
  totalSizeMB: string;
  averageSize: number;
  recentlyAdded: Array<{
    _id: string;
    name: string;
    category: string;
    url: string;
    createdAt: string;
  }>;
}

// Upload Response
export interface UploadResponse {
  data: Media;
  meta: {
    isDuplicate: boolean;
  };
  message: string;
}
