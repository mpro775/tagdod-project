// Search Types for Admin Dashboard

export interface SearchStats {
  totalSearches: number;
  totalUniqueQueries: number;
  averageResultsPerSearch: number;
  zeroResultSearches: number;
  zeroResultsPercentage: number;
  averageResponseTime: number;
  topLanguage: string;
  topEntityType: string;
}

export interface TopSearchTerm {
  query: string;
  count: number;
  hasResults: boolean;
  averageResults: number;
}

export interface ZeroResultSearch {
  query: string;
  count: number;
  lastSearchedAt: string;
}

export interface SearchTrend {
  date: string;
  count: number;
  uniqueQueries: number;
}

export interface SearchedProduct {
  _id: string;
  name: string;
  nameEn: string;
  mainImage?: string;
  viewsCount: number;
  rating: number;
  reviewsCount: number;
  isFeatured: boolean;
  category: {
    _id: string;
    name: string;
    nameEn: string;
  };
  brand?: {
    _id: string;
    name: string;
    nameEn: string;
  };
}

export interface SearchedCategory {
  _id: string;
  name: string;
  nameEn: string;
  image?: string;
  productsCount: number;
  isFeatured: boolean;
}

export interface SearchedBrand {
  _id: string;
  name: string;
  nameEn: string;
  image?: string;
  productCount: number;
}

export interface PerformanceMetrics {
  indexedData: {
    totalProducts: number;
    activeProducts: number;
    totalCategories: number;
    totalBrands: number;
  };
  cacheStatus: {
    searchCacheTTL: number;
    suggestionsCacheTTL: number;
    facetsCacheTTL: number;
  };
  systemHealth: 'healthy' | 'degraded' | 'down';
}

export interface SearchAnalyticsFilters {
  startDate?: string;
  endDate?: string;
  language?: 'ar' | 'en';
  entityType?: 'products' | 'categories' | 'brands' | 'all';
}

export interface TopSearchTermsFilters {
  limit?: number;
  startDate?: string;
  endDate?: string;
  language?: 'ar' | 'en';
}

export interface TrendsFilters {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}

