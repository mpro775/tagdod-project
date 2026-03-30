export interface MarketerUser {
  _id: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  status: 'active' | 'suspended' | 'pending' | 'deleted';
  roles: string[];
  permissions: string[];
  createdAt: string;
  updatedAt: string;
  lastActivityAt?: string;
}

export interface MarketersListResponse {
  items: MarketerUser[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface MarketersStatsSummary {
  total: number;
  active: number;
  suspended: number;
  pending: number;
  createdThisMonth: number;
  inactive: number;
}

export interface CreateMarketerDto {
  phone: string;
  firstName: string;
  lastName?: string;
  gender?: 'male' | 'female' | 'other';
  temporaryPassword?: string;
  activateImmediately?: boolean;
}

export interface CreatedMarketerResponse {
  id: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  permissions: string[];
  status: string;
  temporaryPassword?: string;
  loginUrl?: string;
  message: string;
}

export interface MarketersAnalyticsOverview {
  from: string;
  to: string;
  totalLeads: number;
  engineers: number;
  merchants: number;
  approvedEngineers: number;
  approvedMerchants: number;
  approvedTotal: number;
  overallConversionRate: number;
  previousPeriod: {
    from: string;
    to: string;
    totalLeads: number;
    engineers: number;
    merchants: number;
    approvedEngineers: number;
    approvedMerchants: number;
    approvedTotal: number;
    overallConversionRate: number;
  };
  comparison: {
    leadsGrowthPercent: number;
    conversionGrowthPercent: number;
  };
  dailyTrend: Array<{
    day: string;
    leads: number;
    engineers: number;
    merchants: number;
    approvedLeads: number;
  }>;
}

export interface MarketerRankingItem {
  rank: number;
  marketerId: string;
  totalLeads: number;
  engineers: number;
  merchants: number;
  approvedEngineers: number;
  approvedMerchants: number;
  approvedTotal: number;
  conversionRate: number;
  marketer: {
    id: string;
    phone: string;
    firstName?: string;
    lastName?: string;
    status?: string;
  };
}

export interface MarketersRankingResponse {
  from: string;
  to: string;
  items: MarketerRankingItem[];
}

export interface MarketerAnalyticsDetails {
  marketer: {
    _id: string;
    phone: string;
    firstName?: string;
    lastName?: string;
    status?: string;
  } | null;
  from: string;
  to: string;
  summary: {
    totalLeads: number;
    engineers: number;
    merchants: number;
    approvedEngineers: number;
    approvedMerchants: number;
    conversionRate: number;
  };
  dailyTrend: Array<{
    day: string;
    leads: number;
    engineers: number;
    merchants: number;
    approvedLeads?: number;
  }>;
  latestLeads: Array<{
    _id: string;
    phone: string;
    firstName?: string;
    lastName?: string;
    roles: string[];
    engineer_status?: string;
    merchant_status?: string;
    marketerCreatedAt?: string;
    createdAt?: string;
  }>;
}
