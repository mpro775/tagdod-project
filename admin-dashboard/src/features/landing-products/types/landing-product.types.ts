export interface LandingProduct {
  _id: string;
  name: string;
  nameEn?: string;
  image?: string;
  category?: string;
  brand?: { _id: string; name: string };
  showOnLanding: boolean;
  landingOrder: number;
  landingLabelAr?: string;
  landingLabelEn?: string;
  landingDescriptionAr?: string;
  landingDescriptionEn?: string;
}

export interface UpdateLandingProductDto {
  showOnLanding?: boolean;
  landingOrder?: number;
  landingLabelAr?: string;
  landingLabelEn?: string;
  landingDescriptionAr?: string;
  landingDescriptionEn?: string;
}

export interface ListLandingProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  showOnLanding?: boolean;
}
