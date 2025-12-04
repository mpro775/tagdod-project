// القيم
export interface ValueItem {
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  icon?: string;
}

// الإحصائيات
export interface StatItem {
  labelAr: string;
  labelEn: string;
  value: string;
  icon?: string;
}

// أعضاء الفريق
export interface TeamMember {
  nameAr: string;
  nameEn: string;
  positionAr: string;
  positionEn: string;
  image?: string;
  linkedIn?: string;
  isVisible: boolean;
  order: number;
}

// روابط التواصل الاجتماعي
export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  whatsapp?: string;
  tiktok?: string;
}

// معلومات التواصل
export interface ContactInfo {
  addressAr?: string;
  addressEn?: string;
  phone?: string;
  email?: string;
  workingHoursAr?: string;
  workingHoursEn?: string;
  socialLinks?: SocialLinks;
}

// صفحة من نحن
export interface About {
  _id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  heroImage?: string;
  visionAr?: string;
  visionEn?: string;
  missionAr?: string;
  missionEn?: string;
  values: ValueItem[];
  storyAr?: string;
  storyEn?: string;
  teamMembers: TeamMember[];
  stats: StatItem[];
  contactInfo?: ContactInfo;
  isActive: boolean;
  lastUpdatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// DTO لإنشاء صفحة من نحن
export interface CreateAboutDto {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  heroImage?: string;
  visionAr?: string;
  visionEn?: string;
  missionAr?: string;
  missionEn?: string;
  values?: ValueItem[];
  storyAr?: string;
  storyEn?: string;
  teamMembers?: TeamMember[];
  stats?: StatItem[];
  contactInfo?: ContactInfo;
  isActive?: boolean;
}

// DTO لتحديث صفحة من نحن
export interface UpdateAboutDto {
  titleAr?: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  heroImage?: string;
  visionAr?: string;
  visionEn?: string;
  missionAr?: string;
  missionEn?: string;
  values?: ValueItem[];
  storyAr?: string;
  storyEn?: string;
  teamMembers?: TeamMember[];
  stats?: StatItem[];
  contactInfo?: ContactInfo;
  isActive?: boolean;
}

// DTO للتفعيل/التعطيل
export interface ToggleAboutDto {
  isActive: boolean;
}

