export interface LandingSettings {
  heroTitleAr: string;
  heroTitleEn?: string;
  heroSubtitleAr?: string;
  heroSubtitleEn?: string;
  heroImage?: string;
  heroVideo?: string;
  primaryCtaTextAr?: string;
  primaryCtaTextEn?: string;
  primaryCtaUrl?: string;
  secondaryCtaTextAr?: string;
  secondaryCtaTextEn?: string;
  secondaryCtaUrl?: string;
  appStoreUrl?: string;
  playStoreUrl?: string;
  enableAboutSection: boolean;
  enableStatsSection: boolean;
  enableFeaturesSection: boolean;
  enableProductsSection: boolean;
  enableProjectsSection: boolean;
  enableBrandsSection: boolean;
  enableArticlesSection: boolean;
  enableContactSection: boolean;
  enableServiceCenterSection: boolean;
  sectionOrder: string[];
  isPublished: boolean;
}

export interface AboutData {
  titleAr: string;
  titleEn?: string;
  descriptionAr: string;
  descriptionEn?: string;
  image?: string;
  visionAr?: string;
  visionEn?: string;
  missionAr?: string;
  missionEn?: string;
  valuesAr?: string;
  valuesEn?: string;
}

export interface StatItem {
  labelAr: string;
  labelEn?: string;
  value: number;
  suffix?: string;
  icon?: string;
}

export interface FeatureItem {
  titleAr: string;
  titleEn?: string;
  descriptionAr: string;
  descriptionEn?: string;
  icon?: string;
  gradient?: string;
}

export interface ProductItem {
  _id: string;
  nameAr: string;
  nameEn?: string;
  image?: string;
  brand?: string;
  category?: string;
  landingLabelAr?: string;
  landingLabelEn?: string;
  landingDescriptionAr?: string;
  landingDescriptionEn?: string;
  showOnLanding: boolean;
  landingOrder: number;
}

export interface ProjectItem {
  _id: string;
  titleAr: string;
  titleEn?: string;
  slug: string;
  shortDescriptionAr?: string;
  shortDescriptionEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  type: 'system' | 'contracting' | 'maintenance' | 'installation' | 'supply' | 'partnership' | 'other';
  status: 'planned' | 'in_progress' | 'completed';
  clientName?: string;
  location?: string;
  city?: string;
  coverImage?: string;
  images?: string[];
  startDate?: string;
  endDate?: string;
  metrics?: { labelAr: string; labelEn?: string; value: string }[];
  tags?: string[];
  isFeatured: boolean;
  showOnLanding: boolean;
  landingOrder: number;
  isPublished: boolean;
}

export interface BrandItem {
  _id: string;
  nameAr: string;
  nameEn?: string;
  logo?: string;
  landingDescriptionAr?: string;
  landingDescriptionEn?: string;
  showOnLanding: boolean;
  landingOrder: number;
}

export interface ArticleItem {
  _id: string;
  titleAr: string;
  titleEn?: string;
  slug: string;
  excerptAr?: string;
  excerptEn?: string;
  contentAr?: string;
  contentEn?: string;
  coverImage?: string;
  type: 'news' | 'article';
  category?: string;
  tags?: string[];
  authorName?: string;
  publishDate?: string;
  status: 'draft' | 'published' | 'archived';
  isFeatured: boolean;
  showOnLanding: boolean;
  landingOrder: number;
  readTime?: number;
  metaTitleAr?: string;
  metaTitleEn?: string;
  metaDescriptionAr?: string;
  metaDescriptionEn?: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  addressAr?: string;
  addressEn?: string;
  cityAr?: string;
  cityEn?: string;
  workingHoursAr?: string;
  workingHoursEn?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
}

export interface ServiceCenterData {
  titleAr: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  workingHoursAr?: string;
  workingHoursEn?: string;
  phone?: string;
  addressAr?: string;
  addressEn?: string;
  servicesAr?: string[];
  servicesEn?: string[];
}

export interface LandingHomeResponse {
  settings: LandingSettings;
  about: AboutData | null;
  stats: StatItem[];
  features: FeatureItem[];
  products: ProductItem[];
  projects: ProjectItem[];
  brands: BrandItem[];
  articles: ArticleItem[];
  contactInfo: ContactInfo | null;
  serviceCenter: ServiceCenterData | null;
}

export interface ContactRequestPayload {
  name: string;
  phone: string;
  email?: string;
  city?: string;
  requestType: 'general' | 'technical_support' | 'service_center' | 'maintenance' | 'contracting' | 'partnership' | 'other';
  subject?: string;
  message: string;
}

export interface ContactRequestResponse {
  success: boolean;
  message: string;
  data?: {
    _id: string;
    name: string;
    phone: string;
    email?: string;
    city?: string;
    requestType: string;
    subject?: string;
    message: string;
    status: string;
    createdAt: string;
  };
}
