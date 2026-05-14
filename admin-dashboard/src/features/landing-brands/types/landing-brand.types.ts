export interface LandingBrand {
  _id: string;
  name: string;
  nameEn?: string;
  image?: string;
  showOnLanding: boolean;
  landingOrder: number;
  landingDescriptionAr?: string;
  landingDescriptionEn?: string;
}

export interface UpdateLandingBrandDto {
  showOnLanding?: boolean;
  landingOrder?: number;
  landingDescriptionAr?: string;
  landingDescriptionEn?: string;
}

export interface ListLandingBrandsParams {
  page?: number;
  limit?: number;
  search?: string;
  showOnLanding?: boolean;
}
