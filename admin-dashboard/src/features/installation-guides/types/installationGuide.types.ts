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
  video?: InstallationGuideVideo;
  linkedProduct?: InstallationGuideLinkedProduct | null;
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

