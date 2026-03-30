export interface MarketerPortalStats {
  total: number;
  engineers: number;
  merchants: number;
  approvedEngineers: number;
  approvedMerchants: number;
  createdThisMonth: number;
  approvalRate: number;
}

export interface MarketerPortalUser {
  _id: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  roles: string[];
  status: string;
  engineer_status?: string;
  merchant_status?: string;
  merchant_discount_percent?: number;
  createdAt: string;
}

export interface MarketerPortalUsersResponse {
  items: MarketerPortalUser[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CreateEngineerLeadPayload {
  phone: string;
  firstName: string;
  lastName?: string;
  gender?: 'male' | 'female' | 'other';
  city?: string;
  jobTitle?: string;
  password?: string;
  note?: string;
  file: File;
}

export interface CreateMerchantLeadPayload {
  phone: string;
  firstName: string;
  lastName?: string;
  gender?: 'male' | 'female' | 'other';
  city?: string;
  storeName: string;
  password?: string;
  note?: string;
  file: File;
}

export interface MarketerLeadCreationResponse {
  id: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  temporaryPassword?: string;
  source: string;
  createdByMarketerId: string;
  verificationFileUrl: string;
}
