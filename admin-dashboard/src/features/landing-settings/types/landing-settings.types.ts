export interface LandingSettings {
  _id?: string;
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
  metaTitleAr?: string;
  metaTitleEn?: string;
  metaDescriptionAr?: string;
  metaDescriptionEn?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UpdateLandingSettingsDto = Partial<LandingSettings>;
