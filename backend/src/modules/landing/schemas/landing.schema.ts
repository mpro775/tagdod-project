import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LandingDocument = HydratedDocument<LandingSettings>;

@Schema({ _id: false })
export class HeroSection {
  @Prop({ required: true })
  titleAr!: string;

  @Prop({ required: true })
  titleEn!: string;

  @Prop()
  subtitleAr?: string;

  @Prop()
  subtitleEn?: string;

  @Prop()
  backgroundImage?: string;

  @Prop()
  ctaButtonTextAr?: string;

  @Prop()
  ctaButtonTextEn?: string;

  @Prop()
  ctaButtonLink?: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const HeroSectionSchema = SchemaFactory.createForClass(HeroSection);

@Schema({ _id: false })
export class FeatureItem {
  @Prop({ required: true })
  titleAr!: string;

  @Prop({ required: true })
  titleEn!: string;

  @Prop()
  descriptionAr?: string;

  @Prop()
  descriptionEn?: string;

  @Prop()
  icon?: string;

  @Prop({ default: 0 })
  order!: number;

  @Prop({ default: true })
  isVisible!: boolean;
}

export const FeatureItemSchema = SchemaFactory.createForClass(FeatureItem);

@Schema({ _id: false })
export class StatItem {
  @Prop({ required: true })
  labelAr!: string;

  @Prop({ required: true })
  labelEn!: string;

  @Prop({ required: true })
  value!: string;

  @Prop()
  icon?: string;

  @Prop({ default: true })
  isVisible!: boolean;
}

export const StatItemSchema = SchemaFactory.createForClass(StatItem);

@Schema({ _id: false })
export class TestimonialItem {
  @Prop({ required: true })
  nameAr!: string;

  @Prop({ required: true })
  nameEn!: string;

  @Prop()
  positionAr?: string;

  @Prop()
  positionEn?: string;

  @Prop({ required: true })
  quoteAr!: string;

  @Prop({ required: true })
  quoteEn!: string;

  @Prop()
  avatar?: string;

  @Prop({ default: 0 })
  order!: number;

  @Prop({ default: true })
  isVisible!: boolean;
}

export const TestimonialItemSchema = SchemaFactory.createForClass(TestimonialItem);

@Schema({ _id: false })
export class AppDownloadSection {
  @Prop()
  titleAr?: string;

  @Prop()
  titleEn?: string;

  @Prop()
  descriptionAr?: string;

  @Prop()
  descriptionEn?: string;

  @Prop()
  backgroundImage?: string;

  @Prop()
  googlePlayUrl?: string;

  @Prop()
  appStoreUrl?: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const AppDownloadSectionSchema = SchemaFactory.createForClass(AppDownloadSection);

@Schema({ _id: false })
export class PartnerItem {
  @Prop({ required: true })
  name!: string;

  @Prop()
  logo?: string;

  @Prop()
  websiteUrl?: string;

  @Prop({ default: 0 })
  order!: number;

  @Prop({ default: true })
  isVisible!: boolean;
}

export const PartnerItemSchema = SchemaFactory.createForClass(PartnerItem);

@Schema({ timestamps: true })
export class LandingSettings {
  @Prop({ type: HeroSectionSchema })
  hero?: HeroSection;

  @Prop({ type: [FeatureItemSchema], default: [] })
  features!: FeatureItem[];

  @Prop({ type: [StatItemSchema], default: [] })
  stats!: StatItem[];

  @Prop({ type: [TestimonialItemSchema], default: [] })
  testimonials!: TestimonialItem[];

  @Prop({ type: AppDownloadSectionSchema })
  appDownload?: AppDownloadSection;

  @Prop({ type: [PartnerItemSchema], default: [] })
  partners!: PartnerItem[];

  @Prop()
  seoTitleAr?: string;

  @Prop()
  seoTitleEn?: string;

  @Prop()
  seoDescriptionAr?: string;

  @Prop()
  seoDescriptionEn?: string;

  @Prop()
  faviconUrl?: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop()
  lastUpdatedBy?: string;
}

export const LandingSettingsSchema = SchemaFactory.createForClass(LandingSettings);

LandingSettingsSchema.index({ isActive: 1 });
LandingSettingsSchema.index({ lastUpdatedBy: 1 });
