export enum ServiceStatus {
  OPEN = 'OPEN',
  OFFERS_COLLECTING = 'OFFERS_COLLECTING',
  ASSIGNED = 'ASSIGNED',
  EN_ROUTE = 'EN_ROUTE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
  RATED = 'RATED',
}

export enum OfferStatus {
  OFFERED = 'OFFERED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  OUTBID = 'OUTBID',
  EXPIRED = 'EXPIRED',
}

export const VALID_SERVICE_STATUSES = Object.values(ServiceStatus);
export const VALID_OFFER_STATUSES = Object.values(OfferStatus);
