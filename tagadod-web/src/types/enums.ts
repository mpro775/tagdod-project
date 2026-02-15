export type ServiceRequestStatus =
  | 'OPEN'
  | 'OFFERS_COLLECTING'
  | 'ASSIGNED'
  | 'COMPLETED'
  | 'RATED'
  | 'CANCELLED'

export type RequestType = 'MAINTENANCE' | 'INSTALLATION' | 'CONSULTATION' | 'OTHER'

export type OrderStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'processing'
  | 'completed'
  | 'cancelled'

export type UserType = 'customer' | 'engineer' | 'merchant'

export type CurrencyCode = 'USD' | 'SAR' | 'YER'

export type VerificationStatus = 'verified' | 'unverified' | 'underReview'

export type SupportCategory = 'technical' | 'billing' | 'products' | 'services' | 'account' | 'other'
export type SupportPriority = 'low' | 'medium' | 'high' | 'urgent'
export type SupportStatus = 'open' | 'inProgress' | 'waitingForUser' | 'resolved' | 'closed'
export type MessageType = 'userMessage' | 'adminReply' | 'systemMessage'

export type Gender = 'male' | 'female'

export const SERVICE_REQUEST_STATUS_LABELS: Record<ServiceRequestStatus, string> = {
  OPEN: 'بانتظار العروض',
  OFFERS_COLLECTING: 'تجميع العروض',
  ASSIGNED: 'معين للمهندس',
  COMPLETED: 'مكتمل',
  RATED: 'تم التقييم',
  CANCELLED: 'ملغي',
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'بانتظار الدفع',
  confirmed: 'مؤكد',
  processing: 'قيد التنفيذ',
  completed: 'مكتمل',
  cancelled: 'ملغي',
}

export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  MAINTENANCE: 'صيانة',
  INSTALLATION: 'تركيب',
  CONSULTATION: 'استشارة',
  OTHER: 'أخرى',
}
