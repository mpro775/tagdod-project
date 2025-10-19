export enum ServiceStatus {
  OPEN = 'OPEN',
  OFFERS_COLLECTING = 'OFFERS_COLLECTING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  RATED = 'RATED',
  CANCELLED = 'CANCELLED'
}

export enum OfferStatus {
  OFFERED = 'OFFERED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export const VALID_SERVICE_STATUSES = Object.values(ServiceStatus);
export const VALID_OFFER_STATUSES = Object.values(OfferStatus);
