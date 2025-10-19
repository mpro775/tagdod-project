import { BaseEntity, ListParams } from '@/shared/types/common.types';

export enum ServiceStatus {
  // eslint-disable-next-line no-unused-vars
  OPEN = 'OPEN',
  // eslint-disable-next-line no-unused-vars
  OFFERS_COLLECTING = 'OFFERS_COLLECTING',
  // eslint-disable-next-line no-unused-vars
  ASSIGNED = 'ASSIGNED',
  // eslint-disable-next-line no-unused-vars
  IN_PROGRESS = 'IN_PROGRESS',
  // eslint-disable-next-line no-unused-vars
  COMPLETED = 'COMPLETED',
  // eslint-disable-next-line no-unused-vars
  RATED = 'RATED',
  // eslint-disable-next-line no-unused-vars
  CANCELLED = 'CANCELLED',
}

export interface ServiceRating {
  score?: number;
  comment?: string;
  at?: Date;
}

export interface AcceptedOffer {
  offerId: string;
  amount: number;
  note?: string;
}

export interface AdminNote {
  note: string;
  at: Date;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  jobTitle?: string;
}

export interface ServiceRequest extends BaseEntity {
  userId: string;
  title: string;
  type: string;
  description?: string;
  images?: string[];
  addressId?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  status: ServiceStatus;
  scheduledAt?: Date;
  engineerId?: string | null;
  acceptedOffer?: AcceptedOffer;
  rating?: ServiceRating;
  adminNotes?: AdminNote[];
  // Populated fields
  user?: User;
  engineer?: User;
  offers?: EngineerOffer[];
}

export interface EngineerOffer extends BaseEntity {
  requestId: string;
  engineerId: string;
  amount: number;
  note?: string;
  distanceKm?: number;
  status: 'OFFERED' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  // Populated fields
  request?: ServiceRequest;
  engineer?: User;
}

export interface ListServicesParams extends ListParams {
  status?: ServiceStatus;
  type?: string;
  engineerId?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface ListEngineersParams extends ListParams {
  search?: string;
}

export interface ListOffersParams extends ListParams {
  status?: string;
  requestId?: string;
  engineerId?: string;
  search?: string;
}

export interface OffersStatistics {
  totalOffers: number;
  acceptedOffers: number;
  pendingOffers: number;
  totalValue: number;
  averageOffer: number;
}

export interface EngineersOverviewStatistics {
  totalEngineers: number;
  averageRating: number;
  averageCompletionRate: number;
  totalRevenue: number;
}

// === إحصائيات ===
export interface OverviewStatistics {
  totalRequests: number;
  totalOffers: number;
  totalEngineers: number;
  monthlyRequests: number;
  weeklyRequests: number;
  dailyRequests: number;
  completedRequests: number;
  cancelledRequests: number;
  completionRate: string;
  averageRating: number;
  totalRevenue: number;
}

export interface RequestsStatisticsParams {
  dateFrom?: string;
  dateTo?: string;
  groupBy: 'day' | 'week' | 'month';
}

export interface RequestsStatisticsItem {
  _id: string;
  total: number;
  completed: number;
  cancelled: number;
}

export interface EngineersStatisticsParams {
  dateFrom?: string;
  dateTo?: string;
  limit: number;
}

export interface EngineerStatistics {
  engineerId: string;
  engineerName: string;
  engineerPhone: string;
  totalRequests: number;
  completedRequests: number;
  completionRate: number;
  averageRating: number;
  totalRevenue: number;
}

export interface ServiceTypesStatisticsParams {
  dateFrom?: string;
  dateTo?: string;
}

export interface ServiceTypeStatistics {
  _id: string;
  total: number;
  completed: number;
  averageRevenue: number;
}

export interface RevenueStatisticsParams {
  dateFrom?: string;
  dateTo?: string;
  groupBy: 'day' | 'week' | 'month';
}

export interface RevenueStatisticsItem {
  _id: string;
  totalRevenue: number;
  requestsCount: number;
  averageRevenue: number;
}

export interface EngineerDetails {
  engineerId: string;
  engineerName: string;
  engineerPhone: string;
  engineerEmail?: string;
  totalRequests: number;
  completedRequests: number;
  completionRate: number;
  averageRating: number;
  totalRevenue: number;
}

export interface EngineerStatisticsDetails {
  engineer?: User;
  statistics: {
    totalRequests: number;
    completedRequests: number;
    inProgressRequests: number;
    averageRating: number;
    totalRevenue: number;
    averageRevenue: number;
  };
  offersStats: Array<{
    _id: string;
    count: number;
    averageAmount: number;
  }>;
}

