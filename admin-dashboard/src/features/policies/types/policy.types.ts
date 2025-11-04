export enum PolicyType {
  TERMS = 'terms',
  PRIVACY = 'privacy',
}

export interface Policy {
  _id: string;
  type: PolicyType;
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
  isActive: boolean;
  lastUpdatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePolicyDto {
  type: PolicyType;
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
  isActive?: boolean;
}

export interface UpdatePolicyDto {
  titleAr?: string;
  titleEn?: string;
  contentAr?: string;
  contentEn?: string;
  isActive?: boolean;
}

export interface TogglePolicyDto {
  isActive: boolean;
}
