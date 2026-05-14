export type ArticleType = 'news' | 'article';
export type ArticleStatus = 'draft' | 'published' | 'archived';

export interface Article {
  _id: string;
  titleAr: string;
  titleEn?: string;
  slug: string;
  excerptAr?: string;
  excerptEn?: string;
  contentAr: string;
  contentEn?: string;
  coverImage?: string;
  type: ArticleType;
  category?: string;
  tags?: string[];
  authorName?: string;
  publishDate?: Date;
  status: ArticleStatus;
  isFeatured: boolean;
  showOnLanding: boolean;
  landingOrder: number;
  readTime?: number;
  metaTitleAr?: string;
  metaTitleEn?: string;
  metaDescriptionAr?: string;
  metaDescriptionEn?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateArticleDto {
  titleAr: string;
  titleEn?: string;
  slug?: string;
  excerptAr?: string;
  excerptEn?: string;
  contentAr: string;
  contentEn?: string;
  coverImage?: string;
  type: ArticleType;
  category?: string;
  tags?: string[];
  authorName?: string;
  publishDate?: Date;
  status?: ArticleStatus;
  isFeatured?: boolean;
  showOnLanding?: boolean;
  landingOrder?: number;
  readTime?: number;
}

export interface UpdateArticleDto extends Partial<CreateArticleDto> {}

export interface ListArticlesParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  type?: ArticleType;
  status?: ArticleStatus;
  category?: string;
  showOnLanding?: boolean;
  isFeatured?: boolean;
  search?: string;
}
