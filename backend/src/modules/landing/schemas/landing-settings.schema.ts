import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LandingSettingsDocument = HydratedDocument<LandingSettings>;

@Schema({ timestamps: true })
export class LandingSettings {
  @Prop({ default: '' })
  heroTitleAr!: string;

  @Prop({ default: '' })
  heroTitleEn?: string;

  @Prop({ default: '' })
  heroSubtitleAr?: string;

  @Prop({ default: '' })
  heroSubtitleEn?: string;

  @Prop({ default: '' })
  heroImage?: string;

  @Prop({ default: '' })
  heroVideo?: string;

  @Prop({ default: '' })
  primaryCtaTextAr?: string;

  @Prop({ default: '' })
  primaryCtaTextEn?: string;

  @Prop({ default: '' })
  primaryCtaUrl?: string;

  @Prop({ default: '' })
  secondaryCtaTextAr?: string;

  @Prop({ default: '' })
  secondaryCtaTextEn?: string;

  @Prop({ default: '' })
  secondaryCtaUrl?: string;

  @Prop({ default: '' })
  appStoreUrl?: string;

  @Prop({ default: '' })
  playStoreUrl?: string;

  @Prop({ default: true })
  enableAboutSection!: boolean;

  @Prop({ default: true })
  enableStatsSection!: boolean;

  @Prop({ default: true })
  enableFeaturesSection!: boolean;

  @Prop({ default: true })
  enableProductsSection!: boolean;

  @Prop({ default: true })
  enableProjectsSection!: boolean;

  @Prop({ default: true })
  enableBrandsSection!: boolean;

  @Prop({ default: true })
  enableArticlesSection!: boolean;

  @Prop({ default: true })
  enableContactSection!: boolean;

  @Prop({ default: true })
  enableServiceCenterSection!: boolean;

  @Prop({ type: [String], default: ['hero', 'about', 'stats', 'features', 'products', 'projects', 'brands', 'articles', 'serviceCenter', 'contact', 'appShowcase', 'downloadCta'] })
  sectionOrder!: string[];

  @Prop({ default: true })
  isPublished!: boolean;
}

export const LandingSettingsSchema = SchemaFactory.createForClass(LandingSettings);
