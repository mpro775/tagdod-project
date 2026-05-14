import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProjectDocument = HydratedDocument<Project>;

export enum ProjectType {
  SYSTEM = 'system',
  CONTRACTING = 'contracting',
  MAINTENANCE = 'maintenance',
  INSTALLATION = 'installation',
  SUPPLY = 'supply',
  PARTNERSHIP = 'partnership',
  OTHER = 'other',
}

export enum ProjectStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  titleAr!: string;

  @Prop()
  titleEn?: string;

  @Prop({ required: true, unique: true })
  slug!: string;

  @Prop()
  shortDescriptionAr?: string;

  @Prop()
  shortDescriptionEn?: string;

  @Prop()
  descriptionAr?: string;

  @Prop()
  descriptionEn?: string;

  @Prop({ type: String, enum: Object.values(ProjectType), default: ProjectType.OTHER })
  type!: ProjectType;

  @Prop({ type: String, enum: Object.values(ProjectStatus), default: ProjectStatus.PLANNED })
  status!: ProjectStatus;

  @Prop()
  clientName?: string;

  @Prop()
  location?: string;

  @Prop()
  city?: string;

  @Prop()
  coverImage?: string;

  @Prop({ type: [String], default: [] })
  images!: string[];

  @Prop()
  startDate?: Date;

  @Prop()
  endDate?: Date;

  @Prop({
    type: [{
      labelAr: { type: String },
      labelEn: { type: String },
      value: { type: String },
    }],
    default: [],
  })
  metrics!: Array<{ labelAr: string; labelEn?: string; value: string }>;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ default: false })
  isFeatured!: boolean;

  @Prop({ default: false })
  showOnLanding!: boolean;

  @Prop({ default: 0 })
  landingOrder!: number;

  @Prop({ default: false })
  isPublished!: boolean;

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

export const ProjectSchema = SchemaFactory.createForClass(Project);

ProjectSchema.index({ slug: 1 });
ProjectSchema.index({ type: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ isPublished: 1 });
ProjectSchema.index({ showOnLanding: 1, landingOrder: 1 });
ProjectSchema.index({ isFeatured: 1 });
ProjectSchema.index({ deletedAt: 1 });
ProjectSchema.index({ createdAt: -1 });
