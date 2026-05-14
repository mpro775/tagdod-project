export type ProjectType = 'system' | 'contracting' | 'maintenance' | 'installation' | 'supply' | 'partnership' | 'other';
export type ProjectStatus = 'planned' | 'in_progress' | 'completed';

export interface ProjectMetric {
  labelAr: string;
  labelEn?: string;
  value: string;
}

export interface Project {
  _id: string;
  titleAr: string;
  titleEn?: string;
  slug: string;
  shortDescriptionAr?: string;
  shortDescriptionEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  type: ProjectType;
  status: ProjectStatus;
  clientName?: string;
  location?: string;
  city?: string;
  coverImage?: string;
  images?: string[];
  startDate?: Date;
  endDate?: Date;
  metrics?: ProjectMetric[];
  tags?: string[];
  isFeatured: boolean;
  showOnLanding: boolean;
  landingOrder: number;
  isPublished: boolean;
  metaTitleAr?: string;
  metaTitleEn?: string;
  metaDescriptionAr?: string;
  metaDescriptionEn?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectDto {
  titleAr: string;
  titleEn?: string;
  slug?: string;
  shortDescriptionAr?: string;
  shortDescriptionEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  type: ProjectType;
  status: ProjectStatus;
  clientName?: string;
  location?: string;
  city?: string;
  coverImage?: string;
  images?: string[];
  startDate?: Date;
  endDate?: Date;
  metrics?: ProjectMetric[];
  tags?: string[];
  isFeatured?: boolean;
  showOnLanding?: boolean;
  landingOrder?: number;
  isPublished?: boolean;
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {}

export interface ListProjectsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  type?: ProjectType;
  status?: ProjectStatus;
  isPublished?: boolean;
  showOnLanding?: boolean;
  isFeatured?: boolean;
  search?: string;
}

export interface ProjectStats {
  total: number;
  published: number;
  inProgress: number;
  completed: number;
  featured: number;
  onLanding: number;
}
