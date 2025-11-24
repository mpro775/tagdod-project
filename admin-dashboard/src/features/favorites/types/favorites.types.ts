export interface FavoritesStats {
  total: number;
  totalUsers: number;
  totalSynced: number;
  totalGuests?: number;
}

export interface MostFavoritedProduct {
  productId: string;
  count: number;
  product?: {
    _id?: string;
    name?: string;
    nameAr?: string;
    nameEn?: string;
    slug?: string;
    mainImageId?: string | {
      _id?: string;
      url?: string;
    };
  };
}

export interface MostFavoritedProductsResponse {
  data: MostFavoritedProduct[];
  meta: {
    total: number;
    limit: number;
  };
}


