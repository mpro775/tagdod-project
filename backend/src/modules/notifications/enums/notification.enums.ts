/**
 * Unified Notification Enums
 * حل التناقضات في تعريفات الإشعارات
 */

export enum NotificationType {
  // Order related
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_CONFIRMED = 'ORDER_CONFIRMED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  ORDER_REFUNDED = 'ORDER_REFUNDED',
  ORDER_RATED = 'ORDER_RATED',
  
  // Service related
  SERVICE_REQUEST_OPENED = 'SERVICE_REQUEST_OPENED',
  NEW_ENGINEER_OFFER = 'NEW_ENGINEER_OFFER',
  OFFER_ACCEPTED = 'OFFER_ACCEPTED',
  OFFER_REJECTED = 'OFFER_REJECTED',
  OFFER_CANCELLED = 'OFFER_CANCELLED',
  SERVICE_STARTED = 'SERVICE_STARTED',
  SERVICE_COMPLETED = 'SERVICE_COMPLETED',
  SERVICE_RATED = 'SERVICE_RATED',
  SERVICE_REQUEST_CANCELLED = 'SERVICE_REQUEST_CANCELLED',
  
  // Product related
  PRODUCT_BACK_IN_STOCK = 'PRODUCT_BACK_IN_STOCK',
  PRODUCT_PRICE_DROP = 'PRODUCT_PRICE_DROP',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  
  // Promotion related
  PROMOTION_STARTED = 'PROMOTION_STARTED',
  PROMOTION_ENDING = 'PROMOTION_ENDING',
  
  // Account & Security
  ACCOUNT_VERIFIED = 'ACCOUNT_VERIFIED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  LOGIN_ATTEMPT = 'LOGIN_ATTEMPT',
  NEW_USER_REGISTERED = 'NEW_USER_REGISTERED',
  
  // Verification
  VERIFICATION_APPROVED = 'VERIFICATION_APPROVED',
  VERIFICATION_REJECTED = 'VERIFICATION_REJECTED',
  VERIFICATION_REQUEST_PENDING = 'VERIFICATION_REQUEST_PENDING',
  
  // Support
  TICKET_CREATED = 'TICKET_CREATED',
  TICKET_UPDATED = 'TICKET_UPDATED',
  TICKET_RESOLVED = 'TICKET_RESOLVED',
  SUPPORT_MESSAGE_RECEIVED = 'SUPPORT_MESSAGE_RECEIVED',
  
  // System
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
  NEW_FEATURE = 'NEW_FEATURE',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  
  // Marketing
  WELCOME_NEW_USER = 'WELCOME_NEW_USER',
  BIRTHDAY_GREETING = 'BIRTHDAY_GREETING',
  GREETING = 'GREETING',
  CART_ABANDONMENT = 'CART_ABANDONMENT',
  
  // Payment
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',

  // Engineer Wallet
  ENGINEER_WALLET_WITHDRAWN = 'ENGINEER_WALLET_WITHDRAWN',
  ENGINEER_WALLET_DEPOSITED = 'ENGINEER_WALLET_DEPOSITED',
  ENGINEER_COMMISSION_ADDED = 'ENGINEER_COMMISSION_ADDED',

  // Invoice & Coupons
  INVOICE_CREATED = 'INVOICE_CREATED',
  COUPON_USED = 'COUPON_USED',
  ENGINEER_COUPON_ASSIGNED = 'ENGINEER_COUPON_ASSIGNED',
  MERCHANT_DISCOUNT_ASSIGNED = 'MERCHANT_DISCOUNT_ASSIGNED',
}

export enum NotificationStatus {
  PENDING = 'pending',
  QUEUED = 'queued',
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  CLICKED = 'clicked',
  FAILED = 'failed',
  BOUNCED = 'bounced',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum NotificationDeliveryStatus {
  QUEUED = 'queued',
  SENDING = 'sending',
  PROVIDER_ACCEPTED = 'provider_accepted',
  RECEIVED_BY_APP = 'received_by_app',
  OPENED = 'opened',
  CLICKED = 'clicked',
  FAILED = 'failed',
  NO_DEVICE_TOKEN = 'no_device_token',
  PROVIDER_NOT_CONFIGURED = 'provider_not_configured',
  INVALID_TOKEN = 'invalid_token',
  SKIPPED_BY_PREFERENCES = 'skipped_by_preferences',
}

export enum NotificationDeliveryErrorCode {
  FCM_NOT_CONFIGURED = 'FCM_NOT_CONFIGURED',
  NO_DEVICE_TOKEN = 'NO_DEVICE_TOKEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  REGISTRATION_TOKEN_NOT_REGISTERED = 'REGISTRATION_TOKEN_NOT_REGISTERED',
  SKIPPED_BY_PREFERENCES = 'SKIPPED_BY_PREFERENCES',
  NO_RECIPIENT = 'NO_RECIPIENT',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export enum NotificationChannel {
  IN_APP = 'inApp',
  PUSH = 'push',
  SMS = 'sms',
  EMAIL = 'email',
  DASHBOARD = 'dashboard',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationCategory {
  ORDER = 'order',
  PRODUCT = 'product',
  SERVICE = 'service',
  PROMOTION = 'promotion',
  ACCOUNT = 'account',
  SYSTEM = 'system',
  SUPPORT = 'support',
  PAYMENT = 'payment',
  MARKETING = 'marketing',
}

export enum NotificationTemplateType {
  WELCOME = 'welcome',
  ORDER = 'order',
  PROMOTION = 'promotion',
  ALERT = 'alert',
  REMINDER = 'reminder',
  CUSTOM = 'custom',
}

export enum DevicePlatform {
  IOS = 'ios',
  ANDROID = 'android',
  WEB = 'web',
}

export enum NotificationFrequency {
  INSTANT = 'instant',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  NEVER = 'never',
}

export enum NotificationNavigationType {
  NONE = 'none',
  EXTERNAL_URL = 'external_url',
  CATEGORY = 'category',
  PRODUCT = 'product',
  SECTION = 'section',
  ORDER = 'order',
  SERVICE_REQUEST = 'service_request',
}
