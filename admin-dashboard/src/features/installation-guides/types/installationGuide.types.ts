export interface InstallationGuideVideo {
  id: string;
  url: string;
  embedUrl?: string;
  hlsUrl?: string;
  mp4Url?: string;
  thumbnailUrl?: string;
  status: 'processing' | 'ready' | 'failed';
}

export interface InstallationGuideLinkedProduct {
  id: string;
  name: string;
  nameEn: string;
  mainImageUrl?: string;
  description?: string;
  descriptionEn?: string;
  images?: string[];
  rating?: number;
  price?: Record<string, number>;
  pricingByCurrency?: Record<string, unknown>;
  tags?: string[];
  requiresVariantSelection?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  hasVariants?: boolean;
  isAvailable?: boolean;
  stock?: number;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
}

export interface InstallationGuideListItem {
  id: string;
  titleAr: string;
  titleEn: string;
  tagAr: string;
  tagEn: string;
  coverImageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  updatedAt: string;
}

export interface InstallationGuideDetail extends InstallationGuideListItem {
  descriptionAr: string;
  descriptionEn: string;
  coverImageId: string;
  videoId: string;
  linkedProductId?: string | null;
  linkedProductIds: string[];
  video?: InstallationGuideVideo;
  linkedProduct?: InstallationGuideLinkedProduct | null;
  linkedProducts: InstallationGuideLinkedProduct[];
  createdAt: string;
}

export interface CreateInstallationGuideDto {
  titleAr: string;
  titleEn: string;
  tagAr: string;
  tagEn: string;
  descriptionAr: string;
  descriptionEn: string;
  coverImageId: string;
  videoId: string;
  linkedProductId?: string | null;
  linkedProductIds?: string[];
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateInstallationGuideDto {
  titleAr?: string;
  titleEn?: string;
  tagAr?: string;
  tagEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  coverImageId?: string;
  videoId?: string;
  linkedProductId?: string | null;
  linkedProductIds?: string[];
  sortOrder?: number;
  isActive?: boolean;
}

export interface ToggleInstallationGuideDto {
  isActive: boolean;
}

export interface ListInstallationGuidesParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface InstallationGuidesListResponse {
  data: InstallationGuideListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
