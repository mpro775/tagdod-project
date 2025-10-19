/**
 * Unified Notification Enums
 * حل التناقضات في تعريفات الإشعارات
 */

export enum NotificationType {
  // Order related
  ORDER_CONFIRMED = 'ORDER_CONFIRMED',
  ORDER_SHIPPED = 'ORDER_SHIPPED',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  ORDER_REFUNDED = 'ORDER_REFUNDED',
  
  // Service related
  SERVICE_REQUEST_OPENED = 'SERVICE_REQUEST_OPENED',
  NEW_ENGINEER_OFFER = 'NEW_ENGINEER_OFFER',
  OFFER_ACCEPTED = 'OFFER_ACCEPTED',
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
  
  // Support
  TICKET_CREATED = 'TICKET_CREATED',
  TICKET_UPDATED = 'TICKET_UPDATED',
  TICKET_RESOLVED = 'TICKET_RESOLVED',
  
  // System
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
  NEW_FEATURE = 'NEW_FEATURE',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  
  // Marketing
  WELCOME_NEW_USER = 'WELCOME_NEW_USER',
  BIRTHDAY_GREETING = 'BIRTHDAY_GREETING',
  CART_ABANDONMENT = 'CART_ABANDONMENT',
  
  // Payment
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
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
