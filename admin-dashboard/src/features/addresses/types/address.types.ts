// Address Types for Admin Dashboard

export interface Address {
  _id: string;
  userId: {
    _id: string;
    name: string;
    phone: string;
    email?: string;
    isActive: boolean;
    createdAt: string;
  };
  label: string;
  line1: string;
  city: string;
  coords: {
    lat: number;
    lng: number;
  };
  notes?: string;
  isDefault: boolean;
  isActive: boolean;
  usageCount: number;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface AddressStats {
  totalAddresses: number;
  totalActiveAddresses: number;
  totalDeletedAddresses: number;
  totalUsers: number;
  averagePerUser: number;
}

export interface CityStats {
  city: string;
  count: number;
  activeCount: number;
  defaultCount: number;
  totalUsage: number;
  percentage: number;
}

export interface AddressPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AddressListResponse {
  data: Address[];
  pagination: AddressPagination;
}

export interface UsageAnalytics {
  stats: {
    totalUsage: number;
    avgUsage: number;
    maxUsage: number;
    addressesUsed: number;
    addressesNeverUsed: number;
  };
  dailyTrend: Array<{
    _id: string;
    count: number;
  }>;
}

export interface GeographicData {
  cityDistribution: Array<{
    _id: string;
    count: number;
    coordinates: Array<{
      lat: number;
      lng: number;
    }>;
  }>;
  coordinates: Array<{
    lat: number;
    lng: number;
    city: string;
    label: string;
  }>;
  totalPoints: number;
}

export interface AddressFilters {
  userId?: string;
  city?: string;
  label?: string;
  isDefault?: boolean;
  isActive?: boolean;
  includeDeleted?: boolean;
  search?: string;
  limit?: number;
  page?: number;
  sortBy?: 'createdAt' | 'usageCount' | 'lastUsedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface UsageStatsFilters {
  startDate?: string;
  endDate?: string;
}

export interface NearbySearchParams {
  lat: number;
  lng: number;
  radius?: number;
  limit?: number;
}

