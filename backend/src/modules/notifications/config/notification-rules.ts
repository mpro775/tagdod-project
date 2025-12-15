import { NotificationType, NotificationChannel } from '../enums/notification.enums';
import { UserRole } from '../../users/schemas/user.schema';

/**
 * قواعد تصنيف الإشعارات حسب الأدوار والقنوات
 * يحدد هذا الملف الأدوار المستهدفة والقنوات المسموحة لكل نوع إشعار
 */

/**
 * الأدوار المستهدفة لكل نوع إشعار
 */
export const NOTIFICATION_TYPE_ROLES: Record<NotificationType, UserRole[]> = {
  // ===== Order Notifications - للمستخدمين العاديين =====
  [NotificationType.ORDER_CREATED]: [UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
  [NotificationType.ORDER_CONFIRMED]: [UserRole.USER],
  [NotificationType.ORDER_CANCELLED]: [UserRole.USER],
  [NotificationType.ORDER_REFUNDED]: [UserRole.USER],
  [NotificationType.ORDER_RATED]: [UserRole.USER],
  [NotificationType.INVOICE_CREATED]: [UserRole.USER],

  // ===== Service Notifications - للمستخدمين والمهندسين =====
  [NotificationType.SERVICE_REQUEST_OPENED]: [UserRole.USER, UserRole.ENGINEER],
  [NotificationType.NEW_ENGINEER_OFFER]: [UserRole.USER, UserRole.ENGINEER],
  [NotificationType.OFFER_ACCEPTED]: [UserRole.USER, UserRole.ENGINEER],
  [NotificationType.OFFER_REJECTED]: [UserRole.USER, UserRole.ENGINEER],
  [NotificationType.OFFER_CANCELLED]: [UserRole.USER, UserRole.ENGINEER],
  [NotificationType.SERVICE_STARTED]: [UserRole.USER, UserRole.ENGINEER],
  [NotificationType.SERVICE_COMPLETED]: [UserRole.USER, UserRole.ENGINEER],
  [NotificationType.SERVICE_RATED]: [UserRole.USER, UserRole.ENGINEER],
  [NotificationType.SERVICE_REQUEST_CANCELLED]: [UserRole.USER, UserRole.ENGINEER],

  // ===== Product Notifications - للمستخدمين والتجار =====
  [NotificationType.PRODUCT_BACK_IN_STOCK]: [UserRole.USER],
  [NotificationType.PRODUCT_PRICE_DROP]: [UserRole.USER],
  [NotificationType.LOW_STOCK]: [UserRole.MERCHANT, UserRole.ADMIN, UserRole.SUPER_ADMIN],
  [NotificationType.OUT_OF_STOCK]: [UserRole.MERCHANT, UserRole.ADMIN, UserRole.SUPER_ADMIN],

  // ===== Promotion Notifications - للمستخدمين =====
  [NotificationType.PROMOTION_STARTED]: [UserRole.USER],
  [NotificationType.PROMOTION_ENDING]: [UserRole.USER],
  [NotificationType.COUPON_USED]: [UserRole.USER],

  // ===== Account & Security Notifications - للمستخدمين =====
  [NotificationType.ACCOUNT_VERIFIED]: [UserRole.USER],
  [NotificationType.PASSWORD_CHANGED]: [UserRole.USER],
  [NotificationType.LOGIN_ATTEMPT]: [UserRole.USER],
  [NotificationType.NEW_USER_REGISTERED]: [UserRole.ADMIN, UserRole.SUPER_ADMIN],

  // ===== Support Notifications - للمستخدمين والإداريين =====
  [NotificationType.TICKET_CREATED]: [UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
  [NotificationType.TICKET_UPDATED]: [UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
  [NotificationType.TICKET_RESOLVED]: [UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
  [NotificationType.SUPPORT_MESSAGE_RECEIVED]: [
    UserRole.USER,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ],

  // ===== System Notifications - للإداريين فقط =====
  [NotificationType.SYSTEM_MAINTENANCE]: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  [NotificationType.NEW_FEATURE]: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  [NotificationType.SYSTEM_ALERT]: [UserRole.ADMIN, UserRole.SUPER_ADMIN],

  // ===== Marketing Notifications - للمستخدمين =====
  [NotificationType.WELCOME_NEW_USER]: [UserRole.USER],
  [NotificationType.BIRTHDAY_GREETING]: [UserRole.USER],
  [NotificationType.CART_ABANDONMENT]: [UserRole.USER],

  // ===== Payment Notifications - للمستخدمين =====
  [NotificationType.PAYMENT_FAILED]: [UserRole.USER],
  [NotificationType.PAYMENT_SUCCESS]: [UserRole.USER],

  // ===== Engineer Wallet Notifications - للمهندسين =====
  [NotificationType.ENGINEER_WALLET_WITHDRAWN]: [UserRole.ENGINEER],
  [NotificationType.ENGINEER_WALLET_DEPOSITED]: [UserRole.ENGINEER],
  [NotificationType.ENGINEER_COMMISSION_ADDED]: [UserRole.ENGINEER],
};

/**
 * القنوات المسموحة لكل نوع إشعار
 */
export const NOTIFICATION_TYPE_CHANNELS: Record<NotificationType, NotificationChannel[]> = {
  // ===== Order Notifications =====
  [NotificationType.ORDER_CREATED]: [
    NotificationChannel.IN_APP,
    NotificationChannel.PUSH,
    NotificationChannel.DASHBOARD,
  ],
  [NotificationType.ORDER_CONFIRMED]: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
  [NotificationType.ORDER_CANCELLED]: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
  [NotificationType.ORDER_REFUNDED]: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
  [NotificationType.ORDER_RATED]: [NotificationChannel.IN_APP],
  [NotificationType.INVOICE_CREATED]: [NotificationChannel.IN_APP, NotificationChannel.PUSH],

  // ===== Service Notifications =====
  [NotificationType.SERVICE_REQUEST_OPENED]: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
  [NotificationType.NEW_ENGINEER_OFFER]: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
  [NotificationType.OFFER_ACCEPTED]: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
  [NotificationType.OFFER_REJECTED]: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
  [NotificationType.OFFER_CANCELLED]: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
  [NotificationType.SERVICE_STARTED]: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
  [NotificationType.SERVICE_COMPLETED]: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
  [NotificationType.SERVICE_RATED]: [NotificationChannel.IN_APP],
  [NotificationType.SERVICE_REQUEST_CANCELLED]: [
    NotificationChannel.IN_APP,
    NotificationChannel.PUSH,
  ],

  // ===== Product Notifications =====
  [NotificationType.PRODUCT_BACK_IN_STOCK]: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
  [NotificationType.PRODUCT_PRICE_DROP]: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
  [NotificationType.LOW_STOCK]: [NotificationChannel.DASHBOARD, NotificationChannel.IN_APP],
  [NotificationType.OUT_OF_STOCK]: [NotificationChannel.DASHBOARD, NotificationChannel.IN_APP],

  // ===== Promotion Notifications =====
  [NotificationType.PROMOTION_STARTED]: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
  [NotificationType.PROMOTION_ENDING]: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
  [NotificationType.COUPON_USED]: [NotificationChannel.IN_APP],

  // ===== Account & Security Notifications =====
  [NotificationType.ACCOUNT_VERIFIED]: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
  [NotificationType.PASSWORD_CHANGED]: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
  [NotificationType.LOGIN_ATTEMPT]: [NotificationChannel.IN_APP],
  [NotificationType.NEW_USER_REGISTERED]: [NotificationChannel.DASHBOARD],

  // ===== Support Notifications =====
  [NotificationType.TICKET_CREATED]: [
    NotificationChannel.IN_APP,
    NotificationChannel.PUSH,
    NotificationChannel.DASHBOARD,
  ],
  [NotificationType.TICKET_UPDATED]: [
    NotificationChannel.IN_APP,
    NotificationChannel.PUSH,
    NotificationChannel.DASHBOARD,
  ],
  [NotificationType.TICKET_RESOLVED]: [
    NotificationChannel.IN_APP,
    NotificationChannel.PUSH,
    NotificationChannel.DASHBOARD,
  ],
  [NotificationType.SUPPORT_MESSAGE_RECEIVED]: [
    NotificationChannel.IN_APP,
    NotificationChannel.PUSH,
    NotificationChannel.DASHBOARD,
  ],

  // ===== System Notifications =====
  [NotificationType.SYSTEM_MAINTENANCE]: [NotificationChannel.DASHBOARD],
  [NotificationType.NEW_FEATURE]: [NotificationChannel.DASHBOARD],
  [NotificationType.SYSTEM_ALERT]: [NotificationChannel.DASHBOARD],

  // ===== Marketing Notifications =====
  [NotificationType.WELCOME_NEW_USER]: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
  [NotificationType.BIRTHDAY_GREETING]: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
  [NotificationType.CART_ABANDONMENT]: [NotificationChannel.IN_APP, NotificationChannel.PUSH],

  // ===== Payment Notifications =====
  [NotificationType.PAYMENT_FAILED]: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
  [NotificationType.PAYMENT_SUCCESS]: [NotificationChannel.IN_APP, NotificationChannel.PUSH],

  // ===== Engineer Wallet Notifications =====
  [NotificationType.ENGINEER_WALLET_WITHDRAWN]: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
  [NotificationType.ENGINEER_WALLET_DEPOSITED]: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
  [NotificationType.ENGINEER_COMMISSION_ADDED]: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
};

/**
 * القناة الافتراضية لكل نوع إشعار
 */
export const NOTIFICATION_TYPE_DEFAULT_CHANNEL: Record<NotificationType, NotificationChannel> = {
  // ===== Order Notifications =====
  [NotificationType.ORDER_CREATED]: NotificationChannel.IN_APP,
  [NotificationType.ORDER_CONFIRMED]: NotificationChannel.IN_APP,
  [NotificationType.ORDER_CANCELLED]: NotificationChannel.IN_APP,
  [NotificationType.ORDER_REFUNDED]: NotificationChannel.IN_APP,
  [NotificationType.ORDER_RATED]: NotificationChannel.IN_APP,
  [NotificationType.INVOICE_CREATED]: NotificationChannel.IN_APP,

  // ===== Service Notifications =====
  [NotificationType.SERVICE_REQUEST_OPENED]: NotificationChannel.IN_APP,
  [NotificationType.NEW_ENGINEER_OFFER]: NotificationChannel.IN_APP,
  [NotificationType.OFFER_ACCEPTED]: NotificationChannel.IN_APP,
  [NotificationType.OFFER_REJECTED]: NotificationChannel.IN_APP,
  [NotificationType.OFFER_CANCELLED]: NotificationChannel.IN_APP,
  [NotificationType.SERVICE_STARTED]: NotificationChannel.IN_APP,
  [NotificationType.SERVICE_COMPLETED]: NotificationChannel.IN_APP,
  [NotificationType.SERVICE_RATED]: NotificationChannel.IN_APP,
  [NotificationType.SERVICE_REQUEST_CANCELLED]: NotificationChannel.IN_APP,

  // ===== Product Notifications =====
  [NotificationType.PRODUCT_BACK_IN_STOCK]: NotificationChannel.IN_APP,
  [NotificationType.PRODUCT_PRICE_DROP]: NotificationChannel.IN_APP,
  [NotificationType.LOW_STOCK]: NotificationChannel.DASHBOARD,
  [NotificationType.OUT_OF_STOCK]: NotificationChannel.DASHBOARD,

  // ===== Promotion Notifications =====
  [NotificationType.PROMOTION_STARTED]: NotificationChannel.IN_APP,
  [NotificationType.PROMOTION_ENDING]: NotificationChannel.IN_APP,
  [NotificationType.COUPON_USED]: NotificationChannel.IN_APP,

  // ===== Account & Security Notifications =====
  [NotificationType.ACCOUNT_VERIFIED]: NotificationChannel.IN_APP,
  [NotificationType.PASSWORD_CHANGED]: NotificationChannel.IN_APP,
  [NotificationType.LOGIN_ATTEMPT]: NotificationChannel.IN_APP,
  [NotificationType.NEW_USER_REGISTERED]: NotificationChannel.DASHBOARD,

  // ===== Support Notifications =====
  [NotificationType.TICKET_CREATED]: NotificationChannel.IN_APP,
  [NotificationType.TICKET_UPDATED]: NotificationChannel.IN_APP,
  [NotificationType.TICKET_RESOLVED]: NotificationChannel.IN_APP,
  [NotificationType.SUPPORT_MESSAGE_RECEIVED]: NotificationChannel.IN_APP,

  // ===== System Notifications =====
  [NotificationType.SYSTEM_MAINTENANCE]: NotificationChannel.DASHBOARD,
  [NotificationType.NEW_FEATURE]: NotificationChannel.DASHBOARD,
  [NotificationType.SYSTEM_ALERT]: NotificationChannel.DASHBOARD,

  // ===== Marketing Notifications =====
  [NotificationType.WELCOME_NEW_USER]: NotificationChannel.IN_APP,
  [NotificationType.BIRTHDAY_GREETING]: NotificationChannel.IN_APP,
  [NotificationType.CART_ABANDONMENT]: NotificationChannel.IN_APP,

  // ===== Payment Notifications =====
  [NotificationType.PAYMENT_FAILED]: NotificationChannel.IN_APP,
  [NotificationType.PAYMENT_SUCCESS]: NotificationChannel.IN_APP,

  // ===== Engineer Wallet Notifications =====
  [NotificationType.ENGINEER_WALLET_WITHDRAWN]: NotificationChannel.IN_APP,
  [NotificationType.ENGINEER_WALLET_DEPOSITED]: NotificationChannel.IN_APP,
  [NotificationType.ENGINEER_COMMISSION_ADDED]: NotificationChannel.IN_APP,
};

/**
 * Helper function للحصول على الأدوار المستهدفة لنوع إشعار معين
 */
export function getNotificationTargetRoles(type: NotificationType): UserRole[] {
  return NOTIFICATION_TYPE_ROLES[type] || [];
}

/**
 * Helper function للتحقق من أن القناة مسموحة لنوع إشعار معين
 */
export function isChannelAllowedForType(
  type: NotificationType,
  channel: NotificationChannel,
): boolean {
  const allowedChannels = NOTIFICATION_TYPE_CHANNELS[type] || [];
  return allowedChannels.includes(channel);
}

/**
 * Helper function للحصول على القناة الافتراضية لنوع إشعار معين
 */
export function getDefaultChannelForType(type: NotificationType): NotificationChannel {
  return NOTIFICATION_TYPE_DEFAULT_CHANNEL[type] || NotificationChannel.IN_APP;
}

/**
 * Helper function للتحقق من أن دور المستخدم مناسب لنوع إشعار معين
 */
export function isRoleAllowedForType(type: NotificationType, userRole: UserRole): boolean {
  const targetRoles = getNotificationTargetRoles(type);
  return targetRoles.includes(userRole);
}
