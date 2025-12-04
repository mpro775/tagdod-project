import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AboutDocument = HydratedDocument<About>;

// قسم القيم
@Schema({ _id: false })
export class ValueItem {
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
}

export const ValueItemSchema = SchemaFactory.createForClass(ValueItem);

// قسم الإنجازات/الأرقام
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
}

export const StatItemSchema = SchemaFactory.createForClass(StatItem);

// قسم فريق العمل
@Schema({ _id: false })
export class TeamMember {
  @Prop({ required: true })
  nameAr!: string;

  @Prop({ required: true })
  nameEn!: string;

  @Prop({ required: true })
  positionAr!: string;

  @Prop({ required: true })
  positionEn!: string;

  @Prop()
  image?: string;

  @Prop()
  linkedIn?: string;

  @Prop({ default: true })
  isVisible!: boolean;

  @Prop({ default: 0 })
  order!: number;
}

export const TeamMemberSchema = SchemaFactory.createForClass(TeamMember);

// قسم التواصل الاجتماعي
@Schema({ _id: false })
export class SocialLinks {
  @Prop()
  facebook?: string;

  @Prop()
  twitter?: string;

  @Prop()
  instagram?: string;

  @Prop()
  linkedin?: string;

  @Prop()
  youtube?: string;

  @Prop()
  whatsapp?: string;

  @Prop()
  tiktok?: string;
}

export const SocialLinksSchema = SchemaFactory.createForClass(SocialLinks);

// معلومات التواصل
@Schema({ _id: false })
export class ContactInfo {
  @Prop()
  addressAr?: string;

  @Prop()
  addressEn?: string;

  @Prop()
  phone?: string;

  @Prop()
  email?: string;

  @Prop()
  workingHoursAr?: string;

  @Prop()
  workingHoursEn?: string;

  @Prop({ type: SocialLinksSchema })
  socialLinks?: SocialLinks;
}

export const ContactInfoSchema = SchemaFactory.createForClass(ContactInfo);

@Schema({ timestamps: true })
export class About {
  // نظرة عامة
  @Prop({ required: true })
  titleAr!: string;

  @Prop({ required: true })
  titleEn!: string;

  @Prop({ required: true })
  descriptionAr!: string;

  @Prop({ required: true })
  descriptionEn!: string;

  @Prop()
  heroImage?: string;

  // الرؤية
  @Prop()
  visionAr?: string;

  @Prop()
  visionEn?: string;

  // الرسالة
  @Prop()
  missionAr?: string;

  @Prop()
  missionEn?: string;

  // القيم
  @Prop({ type: [ValueItemSchema], default: [] })
  values!: ValueItem[];

  // قصتنا / التاريخ
  @Prop()
  storyAr?: string;

  @Prop()
  storyEn?: string;

  // الفريق
  @Prop({ type: [TeamMemberSchema], default: [] })
  teamMembers!: TeamMember[];

  // الإنجازات / الأرقام
  @Prop({ type: [StatItemSchema], default: [] })
  stats!: StatItem[];

  // معلومات التواصل
  @Prop({ type: ContactInfoSchema })
  contactInfo?: ContactInfo;

  // حالة النشر
  @Prop({ default: true })
  isActive!: boolean;

  @Prop()
  lastUpdatedBy?: string;
}

export const AboutSchema = SchemaFactory.createForClass(About);

// Performance indexes
AboutSchema.index({ isActive: 1 });
AboutSchema.index({ lastUpdatedBy: 1 });

