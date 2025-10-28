// نظام الصلاحيات الإدارية الشامل
export enum AdminPermission {
  // المستخدمون والصلاحيات
  USERS_READ = 'users.read',
  USERS_CREATE = 'users.create',
  USERS_UPDATE = 'users.update',
  USERS_DELETE = 'users.delete',
  USERS_SUSPEND = 'users.suspend',
  USERS_ACTIVATE = 'users.activate',
  USERS_RESTORE = 'users.restore',

  // الأدوار والصلاحيات
  ROLES_READ = 'roles.read',
  ROLES_CREATE = 'roles.create',
  ROLES_UPDATE = 'roles.update',
  ROLES_DELETE = 'roles.delete',
  ROLES_ASSIGN = 'roles.assign',
  ROLES_REVOKE = 'roles.revoke',

  // المنتجات والفئات
  PRODUCTS_READ = 'products.read',
  PRODUCTS_CREATE = 'products.create',
  PRODUCTS_UPDATE = 'products.update',
  PRODUCTS_DELETE = 'products.delete',
  PRODUCTS_PUBLISH = 'products.publish',
  PRODUCTS_UNPUBLISH = 'products.unpublish',

  // الفئات
  CATEGORIES_READ = 'categories.read',
  CATEGORIES_CREATE = 'categories.create',
  CATEGORIES_UPDATE = 'categories.update',
  CATEGORIES_DELETE = 'categories.delete',

  // العلامات التجارية
  BRANDS_READ = 'brands.read',
  BRANDS_CREATE = 'brands.create',
  BRANDS_UPDATE = 'brands.update',
  BRANDS_DELETE = 'brands.delete',

  // الخصائص
  ATTRIBUTES_READ = 'attributes.read',
  ATTRIBUTES_CREATE = 'attributes.create',
  ATTRIBUTES_UPDATE = 'attributes.update',
  ATTRIBUTES_DELETE = 'attributes.delete',

  // الطلبات
  ORDERS_READ = 'orders.read',
  ORDERS_UPDATE = 'orders.update',
  ORDERS_CANCEL = 'orders.cancel',
  ORDERS_REFUND = 'orders.refund',
  ORDERS_STATUS_UPDATE = 'orders.status_update',

  // السلة والتخلي عن الشراء
  CARTS_READ = 'carts.read',
  CARTS_UPDATE = 'carts.update',
  CARTS_DELETE = 'carts.delete',
  CARTS_CONVERT_TO_ORDER = 'carts.convert_to_order',
  CARTS_SEND_REMINDERS = 'carts.send_reminders',
  CARTS_BULK_ACTIONS = 'carts.bulk_actions',

  // الخدمات
  SERVICES_READ = 'services.read',
  SERVICES_UPDATE = 'services.update',
  SERVICES_CANCEL = 'services.cancel',
  SERVICES_ASSIGN = 'services.assign',

  // الدعم الفني
  SUPPORT_READ = 'support.read',
  SUPPORT_UPDATE = 'support.update',
  SUPPORT_ASSIGN = 'support.assign',
  SUPPORT_CLOSE = 'support.close',

  // التسويق والعروض
  MARKETING_READ = 'marketing.read',
  MARKETING_CREATE = 'marketing.create',
  MARKETING_UPDATE = 'marketing.update',
  MARKETING_DELETE = 'marketing.delete',
  MARKETING_PUBLISH = 'marketing.publish',
  MARKETING_ANALYZE = 'marketing.analyze',

  // التحليلات والتقارير
  ANALYTICS_READ = 'analytics.read',
  ANALYTICS_EXPORT = 'analytics.export',
  REPORTS_GENERATE = 'reports.generate',
  REPORTS_SCHEDULE = 'reports.schedule',

  // الإعدادات والنظام
  SETTINGS_READ = 'settings.read',
  SETTINGS_UPDATE = 'settings.update',
  SYSTEM_MAINTENANCE = 'system.maintenance',
  SYSTEM_BACKUP = 'system.backup',
  SYSTEM_LOGS = 'system.logs',

  // الصلاحيات الخاصة بالأدمن
  ADMIN_ACCESS = 'admin.access',
  SUPER_ADMIN_ACCESS = 'super_admin.access',

  // التحقق من القدرات
  CAPABILITIES_READ = 'capabilities.read',
  CAPABILITIES_UPDATE = 'capabilities.update',
  CAPABILITIES_APPROVE = 'capabilities.approve',
  CAPABILITIES_REJECT = 'capabilities.reject',

  // أسعار الصرف
  EXCHANGE_RATES_READ = 'exchange_rates.read',
  EXCHANGE_RATES_UPDATE = 'exchange_rates.update',
  EXCHANGE_RATES_MANUAL_UPDATE = 'exchange_rates.manual_update',

  // المفضلات
  FAVORITES_READ = 'favorites.read',
  FAVORITES_MANAGE = 'favorites.manage',

  // العناوين
  ADDRESSES_READ = 'addresses.read',
  ADDRESSES_MANAGE = 'addresses.manage',
  ADDRESSES_ANALYTICS = 'addresses.analytics',

  // الرفع والتحميل
  UPLOAD_MANAGE = 'upload.manage',
  UPLOAD_DELETE = 'upload.delete',
  
  // إدارة الوسائط
  MEDIA_MANAGE = 'media.manage',
  MEDIA_DELETE = 'media.delete',
  
  // التدقيق والمراجعة
  AUDIT_READ = 'audit.read',
  AUDIT_MANAGE = 'audit.manage',
  AUDIT_DELETE = 'audit.delete',
  
  // الإشعارات
  NOTIFICATIONS_READ = 'notifications.read',
  NOTIFICATIONS_CREATE = 'notifications.create',
  NOTIFICATIONS_UPDATE = 'notifications.update',
  NOTIFICATIONS_DELETE = 'notifications.delete',
  NOTIFICATIONS_SEND = 'notifications.send',
  NOTIFICATIONS_MANAGE = 'notifications.manage',
}

// مجموعات الصلاحيات للأدوار الشائعة
export const PERMISSION_GROUPS = {
  // أدمن كامل الصلاحيات
  FULL_ADMIN: Object.values(AdminPermission),

  // أدمن المنتجات
  PRODUCT_MANAGER: [
    AdminPermission.PRODUCTS_READ,
    AdminPermission.PRODUCTS_CREATE,
    AdminPermission.PRODUCTS_UPDATE,
    AdminPermission.PRODUCTS_DELETE,
    AdminPermission.PRODUCTS_PUBLISH,
    AdminPermission.PRODUCTS_UNPUBLISH,
    AdminPermission.CATEGORIES_READ,
    AdminPermission.CATEGORIES_CREATE,
    AdminPermission.CATEGORIES_UPDATE,
    AdminPermission.CATEGORIES_DELETE,
    AdminPermission.BRANDS_READ,
    AdminPermission.BRANDS_CREATE,
    AdminPermission.BRANDS_UPDATE,
    AdminPermission.BRANDS_DELETE,
    AdminPermission.ATTRIBUTES_READ,
    AdminPermission.ATTRIBUTES_CREATE,
    AdminPermission.ATTRIBUTES_UPDATE,
    AdminPermission.ATTRIBUTES_DELETE,
    AdminPermission.ADMIN_ACCESS,
  ],

  // أدمن الطلبات والمبيعات
  SALES_MANAGER: [
    AdminPermission.ORDERS_READ,
    AdminPermission.ORDERS_UPDATE,
    AdminPermission.ORDERS_CANCEL,
    AdminPermission.ORDERS_REFUND,
    AdminPermission.ORDERS_STATUS_UPDATE,
    AdminPermission.CARTS_READ,
    AdminPermission.CARTS_UPDATE,
    AdminPermission.CARTS_SEND_REMINDERS,
    AdminPermission.CARTS_CONVERT_TO_ORDER,
    AdminPermission.CARTS_BULK_ACTIONS,
    AdminPermission.ADDRESSES_READ,
    AdminPermission.ADDRESSES_ANALYTICS,
    AdminPermission.ANALYTICS_READ,
    AdminPermission.REPORTS_GENERATE,
    AdminPermission.ADMIN_ACCESS,
  ],

  // أدمن الدعم الفني
  SUPPORT_MANAGER: [
    AdminPermission.SUPPORT_READ,
    AdminPermission.SUPPORT_UPDATE,
    AdminPermission.SUPPORT_ASSIGN,
    AdminPermission.SUPPORT_CLOSE,
    AdminPermission.USERS_READ,
    AdminPermission.USERS_UPDATE,
    AdminPermission.ADDRESSES_READ,
    AdminPermission.ADMIN_ACCESS,
  ],

  // أدمن التسويق
  MARKETING_MANAGER: [
    AdminPermission.MARKETING_READ,
    AdminPermission.MARKETING_CREATE,
    AdminPermission.MARKETING_UPDATE,
    AdminPermission.MARKETING_DELETE,
    AdminPermission.MARKETING_PUBLISH,
    AdminPermission.MARKETING_ANALYZE,
    AdminPermission.ANALYTICS_READ,
    AdminPermission.REPORTS_GENERATE,
    AdminPermission.ADMIN_ACCESS,
  ],

  // أدمن محدود (قراءة فقط)
  VIEW_ONLY_ADMIN: [
    AdminPermission.USERS_READ,
    AdminPermission.PRODUCTS_READ,
    AdminPermission.ORDERS_READ,
    AdminPermission.CARTS_READ,
    AdminPermission.SUPPORT_READ,
    AdminPermission.MARKETING_READ,
    AdminPermission.ANALYTICS_READ,
    AdminPermission.ADDRESSES_READ,
    AdminPermission.ADMIN_ACCESS,
  ],

  // أدمن المحتوى
  CONTENT_MANAGER: [
    AdminPermission.PRODUCTS_READ,
    AdminPermission.PRODUCTS_UPDATE,
    AdminPermission.PRODUCTS_PUBLISH,
    AdminPermission.PRODUCTS_UNPUBLISH,
    AdminPermission.CATEGORIES_READ,
    AdminPermission.CATEGORIES_UPDATE,
    AdminPermission.BRANDS_READ,
    AdminPermission.BRANDS_UPDATE,
    AdminPermission.ATTRIBUTES_READ,
    AdminPermission.ATTRIBUTES_UPDATE,
    AdminPermission.MARKETING_READ,
    AdminPermission.MARKETING_UPDATE,
    AdminPermission.UPLOAD_MANAGE,
    AdminPermission.MEDIA_MANAGE,
    AdminPermission.ADMIN_ACCESS,
  ],
};
