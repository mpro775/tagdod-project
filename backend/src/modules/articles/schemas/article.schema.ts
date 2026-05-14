import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ArticleDocument = HydratedDocument<Article>;

export enum ArticleType {
  NEWS = 'news',
  ARTICLE = 'article',
}

export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Schema({ timestamps: true })
export class Article {
  @Prop({ required: true })
  titleAr!: string;

  @Prop()
  titleEn?: string;

  @Prop({ required: true, unique: true })
  slug!: string;

  @Prop()
  excerptAr?: string;

  @Prop()
  excerptEn?: string;

  @Prop({ required: true })
  contentAr!: string;

  @Prop()
  contentEn?: string;

  @Prop()
  coverImage?: string;

  @Prop({ type: String, enum: Object.values(ArticleType), default: ArticleType.ARTICLE })
  type!: ArticleType;

  @Prop()
  category?: string;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop()
  authorName?: string;

  @Prop()
  publishDate?: Date;

  @Prop({ type: String, enum: Object.values(ArticleStatus), default: ArticleStatus.DRAFT })
  status!: ArticleStatus;

  @Prop({ default: false })
  isFeatured!: boolean;

  @Prop({ default: false })
  showOnLanding!: boolean;

  @Prop({ default: 0 })
  landingOrder!: number;

  @Prop()
  readTime?: number;

  @Prop()
  metaTitleAr?: string;

  @Prop()
  metaTitleEn?: string;

  @Prop()
  metaDescriptionAr?: string;

  @Prop()
  metaDescriptionEn?: string;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);

ArticleSchema.index({ slug: 1 });
ArticleSchema.index({ type: 1 });
ArticleSchema.index({ status: 1 });
ArticleSchema.index({ showOnLanding: 1, landingOrder: 1 });
ArticleSchema.index({ isFeatured: 1 });
ArticleSchema.index({ publishDate: -1 });
ArticleSchema.index({ deletedAt: 1 });
ArticleSchema.index({ createdAt: -1 });
