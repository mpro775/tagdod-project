// Frontend permissions constants - matching backend permissions
export const PERMISSIONS = {
  // Users
  USERS_READ: 'users.read',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  USERS_SUSPEND: 'users.suspend',
  USERS_ACTIVATE: 'users.activate',
  USERS_RESTORE: 'users.restore',

  // Products
  PRODUCTS_READ: 'products.read',
  PRODUCTS_CREATE: 'products.create',
  PRODUCTS_UPDATE: 'products.update',
  PRODUCTS_DELETE: 'products.delete',
  PRODUCTS_PUBLISH: 'products.publish',
  PRODUCTS_UNPUBLISH: 'products.unpublish',

  // Categories
  CATEGORIES_READ: 'categories.read',
  CATEGORIES_CREATE: 'categories.create',
  CATEGORIES_UPDATE: 'categories.update',
  CATEGORIES_DELETE: 'categories.delete',

  // Attributes
  ATTRIBUTES_READ: 'attributes.read',
  ATTRIBUTES_CREATE: 'attributes.create',
  ATTRIBUTES_UPDATE: 'attributes.update',
  ATTRIBUTES_DELETE: 'attributes.delete',

  // Brands
  BRANDS_READ: 'brands.read',
  BRANDS_CREATE: 'brands.create',
  BRANDS_UPDATE: 'brands.update',
  BRANDS_DELETE: 'brands.delete',

  // Orders
  ORDERS_READ: 'orders.read',
  ORDERS_UPDATE: 'orders.update',
  ORDERS_CANCEL: 'orders.cancel',
  ORDERS_REFUND: 'orders.refund',
  ORDERS_STATUS_UPDATE: 'orders.status_update',

  // Carts
  CARTS_READ: 'carts.read',
  CARTS_UPDATE: 'carts.update',
  CARTS_DELETE: 'carts.delete',
  CARTS_SEND_REMINDERS: 'carts.send_reminders',
  CARTS_CONVERT_TO_ORDER: 'carts.convert_to_order',
  CARTS_BULK_ACTIONS: 'carts.bulk_actions',

  // Services
  SERVICES_READ: 'services.read',
  SERVICES_UPDATE: 'services.update',
  SERVICES_CANCEL: 'services.cancel',
  SERVICES_ASSIGN: 'services.assign',

  // Support
  SUPPORT_READ: 'support.read',
  SUPPORT_UPDATE: 'support.update',
  SUPPORT_ASSIGN: 'support.assign',
  SUPPORT_CLOSE: 'support.close',

  // Marketing
  MARKETING_READ: 'marketing.read',
  MARKETING_CREATE: 'marketing.create',
  MARKETING_UPDATE: 'marketing.update',
  MARKETING_DELETE: 'marketing.delete',
  MARKETING_PUBLISH: 'marketing.publish',
  MARKETING_ANALYZE: 'marketing.analyze',

  // Analytics
  ANALYTICS_READ: 'analytics.read',
  ANALYTICS_EXPORT: 'analytics.export',
  REPORTS_GENERATE: 'reports.generate',
  REPORTS_SCHEDULE: 'reports.schedule',

  // Media
  MEDIA_MANAGE: 'media.manage',
  MEDIA_DELETE: 'media.delete',

  // Notifications
  NOTIFICATIONS_READ: 'notifications.read',
  NOTIFICATIONS_MANAGE: 'notifications.manage',
  NOTIFICATIONS_CREATE: 'notifications.create',
  NOTIFICATIONS_UPDATE: 'notifications.update',
  NOTIFICATIONS_DELETE: 'notifications.delete',
  NOTIFICATIONS_SEND: 'notifications.send',

  // Exchange Rates
  EXCHANGE_RATES_READ: 'exchange_rates.read',
  EXCHANGE_RATES_UPDATE: 'exchange_rates.update',
  EXCHANGE_RATES_MANUAL_UPDATE: 'exchange_rates.manual_update',

  // Audit
  AUDIT_READ: 'audit.read',
  AUDIT_MANAGE: 'audit.manage',
  AUDIT_DELETE: 'audit.delete',

  // Capabilities
  CAPABILITIES_READ: 'capabilities.read',
  CAPABILITIES_UPDATE: 'capabilities.update',
  CAPABILITIES_APPROVE: 'capabilities.approve',
  CAPABILITIES_REJECT: 'capabilities.reject',

  // Favorites
  FAVORITES_READ: 'favorites.read',
  FAVORITES_MANAGE: 'favorites.manage',

  // Addresses
  ADDRESSES_READ: 'addresses.read',
  ADDRESSES_MANAGE: 'addresses.manage',
  ADDRESSES_ANALYTICS: 'addresses.analytics',

  // Upload
  UPLOAD_MANAGE: 'upload.manage',
  UPLOAD_DELETE: 'upload.delete',

  // Roles
  ROLES_READ: 'roles.read',
  ROLES_CREATE: 'roles.create',
  ROLES_UPDATE: 'roles.update',
  ROLES_DELETE: 'roles.delete',
  ROLES_ASSIGN: 'roles.assign',
  ROLES_REVOKE: 'roles.revoke',

  // System
  SETTINGS_READ: 'settings.read',
  SETTINGS_UPDATE: 'settings.update',
  SYSTEM_MAINTENANCE: 'system.maintenance',
  SYSTEM_BACKUP: 'system.backup',
  SYSTEM_LOGS: 'system.logs',

  // Admin Access
  ADMIN_ACCESS: 'admin.access',
  SUPER_ADMIN_ACCESS: 'super_admin.access',
} as const;

// Permission Groups - Presets for different admin roles
export const PERMISSION_GROUPS = {
  PRODUCT_MANAGER: [
    PERMISSIONS.ADMIN_ACCESS,
    PERMISSIONS.PRODUCTS_READ,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.PRODUCTS_DELETE,
    PERMISSIONS.CATEGORIES_READ,
    PERMISSIONS.CATEGORIES_CREATE,
    PERMISSIONS.CATEGORIES_UPDATE,
    PERMISSIONS.BRANDS_READ,
    PERMISSIONS.BRANDS_CREATE,
    PERMISSIONS.ATTRIBUTES_READ,
    PERMISSIONS.ATTRIBUTES_CREATE,
  ],
  SALES_MANAGER: [
    PERMISSIONS.ADMIN_ACCESS,
    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.ORDERS_UPDATE,
    PERMISSIONS.ORDERS_CANCEL,
    PERMISSIONS.ORDERS_REFUND,
    PERMISSIONS.CARTS_READ,
    PERMISSIONS.ANALYTICS_READ,
  ],
  SUPPORT_MANAGER: [
    PERMISSIONS.ADMIN_ACCESS,
    PERMISSIONS.SUPPORT_READ,
    PERMISSIONS.SUPPORT_UPDATE,
    PERMISSIONS.SUPPORT_ASSIGN,
    PERMISSIONS.USERS_READ,
  ],
  MARKETING_MANAGER: [
    PERMISSIONS.ADMIN_ACCESS,
    PERMISSIONS.MARKETING_READ,
    PERMISSIONS.MARKETING_CREATE,
    PERMISSIONS.MARKETING_UPDATE,
    PERMISSIONS.MARKETING_DELETE,
    PERMISSIONS.CARTS_SEND_REMINDERS,
    PERMISSIONS.ANALYTICS_READ,
  ],
  CONTENT_MANAGER: [
    PERMISSIONS.ADMIN_ACCESS,
    PERMISSIONS.PRODUCTS_READ,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.CATEGORIES_READ,
    PERMISSIONS.CATEGORIES_UPDATE,
    PERMISSIONS.BRANDS_READ,
    PERMISSIONS.BRANDS_UPDATE,
    PERMISSIONS.MEDIA_MANAGE,
  ],
  VIEW_ONLY_ADMIN: [
    PERMISSIONS.ADMIN_ACCESS,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.PRODUCTS_READ,
    PERMISSIONS.CATEGORIES_READ,
    PERMISSIONS.BRANDS_READ,
    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.ANALYTICS_READ,
  ],
  FULL_ADMIN: Object.values(PERMISSIONS),
} as const;

// Menu items permissions mapping
export const MENU_PERMISSIONS = {
  dashboard: [], // Always visible for admins

  // Users section
  users: [PERMISSIONS.USERS_READ, PERMISSIONS.ADMIN_ACCESS],
  'users-list': [PERMISSIONS.USERS_READ, PERMISSIONS.ADMIN_ACCESS],
  'users-analytics': [PERMISSIONS.ANALYTICS_READ, PERMISSIONS.ADMIN_ACCESS],
  'users-deleted': [PERMISSIONS.USERS_READ, PERMISSIONS.ADMIN_ACCESS],
  'users-verification': [PERMISSIONS.USERS_READ, PERMISSIONS.ADMIN_ACCESS],
  'users-addresses': [PERMISSIONS.ADDRESSES_READ, PERMISSIONS.ADMIN_ACCESS],
  'users-favorites': [PERMISSIONS.FAVORITES_READ, PERMISSIONS.ADMIN_ACCESS],

  // Catalog section
  catalog: [PERMISSIONS.ADMIN_ACCESS], // Parent menu - visible if any child is visible
  products: [PERMISSIONS.PRODUCTS_READ, PERMISSIONS.ADMIN_ACCESS],
  'products-list': [PERMISSIONS.PRODUCTS_READ, PERMISSIONS.ADMIN_ACCESS],
  'products-analytics': [PERMISSIONS.ANALYTICS_READ, PERMISSIONS.ADMIN_ACCESS],
  'products-inventory': [PERMISSIONS.PRODUCTS_READ, PERMISSIONS.ADMIN_ACCESS],
  categories: [PERMISSIONS.CATEGORIES_READ, PERMISSIONS.ADMIN_ACCESS],
  attributes: [PERMISSIONS.ATTRIBUTES_READ, PERMISSIONS.ADMIN_ACCESS],
  brands: [PERMISSIONS.BRANDS_READ, PERMISSIONS.ADMIN_ACCESS],

  // Sales section
  sales: [PERMISSIONS.ADMIN_ACCESS], // Parent menu - visible if any child is visible
  orders: [PERMISSIONS.ORDERS_READ, PERMISSIONS.ADMIN_ACCESS],
  'orders-list': [PERMISSIONS.ORDERS_READ, PERMISSIONS.ADMIN_ACCESS],
  'orders-out-of-stock': [PERMISSIONS.ORDERS_READ, PERMISSIONS.ADMIN_ACCESS],
  'orders-analytics': [PERMISSIONS.ANALYTICS_READ, PERMISSIONS.ADMIN_ACCESS],
  carts: [PERMISSIONS.CARTS_READ, PERMISSIONS.ADMIN_ACCESS],
  'carts-list': [PERMISSIONS.CARTS_READ, PERMISSIONS.ADMIN_ACCESS],
  'carts-abandoned': [PERMISSIONS.CARTS_READ, PERMISSIONS.ADMIN_ACCESS],
  'carts-analytics': [PERMISSIONS.ANALYTICS_READ, PERMISSIONS.ADMIN_ACCESS],
  coupons: [PERMISSIONS.MARKETING_READ, PERMISSIONS.ADMIN_ACCESS],

  // Marketing section
  marketing: [PERMISSIONS.ADMIN_ACCESS], // Parent menu - visible if any child is visible
  'marketing-dashboard': [PERMISSIONS.MARKETING_READ, PERMISSIONS.ADMIN_ACCESS],
  'price-rules': [PERMISSIONS.MARKETING_READ, PERMISSIONS.ADMIN_ACCESS],
  banners: [PERMISSIONS.MARKETING_READ, PERMISSIONS.ADMIN_ACCESS],
  promotions: [PERMISSIONS.MARKETING_READ, PERMISSIONS.ADMIN_ACCESS],
  'coupons-list': [PERMISSIONS.MARKETING_READ, PERMISSIONS.ADMIN_ACCESS],
  'coupons-analytics': [PERMISSIONS.ANALYTICS_READ, PERMISSIONS.ADMIN_ACCESS],

  // Services section
  services: [PERMISSIONS.ADMIN_ACCESS], // Parent menu - visible if any child is visible
  'services-overview': [PERMISSIONS.SERVICES_READ, PERMISSIONS.ADMIN_ACCESS],
  'services-requests': [PERMISSIONS.SERVICES_READ, PERMISSIONS.ADMIN_ACCESS],
  'services-engineers': [PERMISSIONS.SERVICES_READ, PERMISSIONS.ADMIN_ACCESS],
  'services-offers': [PERMISSIONS.SERVICES_READ, PERMISSIONS.ADMIN_ACCESS],
  'services-analytics': [PERMISSIONS.ANALYTICS_READ, PERMISSIONS.ADMIN_ACCESS],

  // Engineers section
  engineers: [PERMISSIONS.SERVICES_READ, PERMISSIONS.ADMIN_ACCESS],
  'engineers-management': [PERMISSIONS.SERVICES_READ, PERMISSIONS.ADMIN_ACCESS],
  'engineers-coupons': [PERMISSIONS.MARKETING_READ, PERMISSIONS.ADMIN_ACCESS],
  'engineers-commissions': [PERMISSIONS.ANALYTICS_READ, PERMISSIONS.ADMIN_ACCESS],

  // Media
  media: [PERMISSIONS.MEDIA_MANAGE, PERMISSIONS.ADMIN_ACCESS],
  'media-library': [PERMISSIONS.MEDIA_MANAGE, PERMISSIONS.ADMIN_ACCESS],
  'media-analytics': [PERMISSIONS.ANALYTICS_READ, PERMISSIONS.ADMIN_ACCESS],

  // Analytics section
  analytics: [PERMISSIONS.ADMIN_ACCESS], // Parent menu - visible if any child is visible
  'analytics-dashboard': [PERMISSIONS.ANALYTICS_READ, PERMISSIONS.ADMIN_ACCESS],
  'analytics-main': [PERMISSIONS.ANALYTICS_READ, PERMISSIONS.ADMIN_ACCESS],
  'analytics-advanced': [PERMISSIONS.ANALYTICS_READ, PERMISSIONS.ADMIN_ACCESS],
  'analytics-export': [PERMISSIONS.ANALYTICS_EXPORT, PERMISSIONS.ADMIN_ACCESS],
  'analytics-reports': [PERMISSIONS.REPORTS_GENERATE, PERMISSIONS.ADMIN_ACCESS],

  // Audit section
  audit: [PERMISSIONS.AUDIT_READ, PERMISSIONS.ADMIN_ACCESS],
  'audit-logs': [PERMISSIONS.AUDIT_READ, PERMISSIONS.ADMIN_ACCESS],
  'audit-main': [PERMISSIONS.AUDIT_READ, PERMISSIONS.ADMIN_ACCESS],
  'audit-analytics': [PERMISSIONS.ANALYTICS_READ, PERMISSIONS.ADMIN_ACCESS],

  // Support section
  support: [PERMISSIONS.SUPPORT_READ, PERMISSIONS.ADMIN_ACCESS],
  'support-tickets': [PERMISSIONS.SUPPORT_READ, PERMISSIONS.ADMIN_ACCESS],
  'support-stats': [PERMISSIONS.ANALYTICS_READ, PERMISSIONS.ADMIN_ACCESS],
  'support-canned-responses': [PERMISSIONS.SUPPORT_READ, PERMISSIONS.ADMIN_ACCESS],

  // Notifications section
  notifications: [PERMISSIONS.ADMIN_ACCESS], // Parent menu - visible if any child is visible
  'notifications-list': [PERMISSIONS.NOTIFICATIONS_READ, PERMISSIONS.ADMIN_ACCESS],
  'notifications-analytics': [PERMISSIONS.ANALYTICS_READ, PERMISSIONS.ADMIN_ACCESS],
  'notifications-templates': [PERMISSIONS.NOTIFICATIONS_MANAGE, PERMISSIONS.ADMIN_ACCESS],
  'notifications-channel-configs': [PERMISSIONS.NOTIFICATIONS_MANAGE, PERMISSIONS.ADMIN_ACCESS],

  // System Management section
  'system-management': [PERMISSIONS.SETTINGS_READ, PERMISSIONS.ADMIN_ACCESS],
  'system-monitoring': [PERMISSIONS.SYSTEM_LOGS, PERMISSIONS.ADMIN_ACCESS],
  'error-logs': [PERMISSIONS.SYSTEM_LOGS, PERMISSIONS.ADMIN_ACCESS],
  'system-settings': [PERMISSIONS.SETTINGS_READ, PERMISSIONS.ADMIN_ACCESS],
  policies: [PERMISSIONS.SETTINGS_READ, PERMISSIONS.ADMIN_ACCESS],
  about: [PERMISSIONS.SETTINGS_READ, PERMISSIONS.ADMIN_ACCESS],

  // Exchange Rates
  'exchange-rates': [PERMISSIONS.EXCHANGE_RATES_READ, PERMISSIONS.ADMIN_ACCESS],

  // Settings
  settings: [PERMISSIONS.SETTINGS_READ, PERMISSIONS.ADMIN_ACCESS],

  // Admin Management section
  'admin-management': [PERMISSIONS.ADMIN_ACCESS],
  'admin-search': [PERMISSIONS.ADMIN_ACCESS],
} as const;

// Helper function to check if user has any of the required permissions
export const hasAnyPermission = (userPermissions: string[], requiredPermissions: string[]): boolean => {
  if (!userPermissions || userPermissions.length === 0) return false;
  if (!requiredPermissions || requiredPermissions.length === 0) return true;
  return requiredPermissions.some(permission => userPermissions.includes(permission));
};

// Helper function to check if user has all required permissions
export const hasAllPermissions = (userPermissions: string[], requiredPermissions: string[]): boolean => {
  if (!userPermissions || userPermissions.length === 0) return false;
  if (!requiredPermissions || requiredPermissions.length === 0) return true;
  return requiredPermissions.every(permission => userPermissions.includes(permission));
};

// Helper function to check menu item access with proper permission logic
// If item requires specific permissions + ADMIN_ACCESS, user must have the specific permission
// ADMIN_ACCESS alone is not enough for items that require specific permissions
export const hasMenuAccess = (userPermissions: string[], requiredPermissions: string[]): boolean => {
  if (!userPermissions || userPermissions.length === 0) return false;
  if (!requiredPermissions || requiredPermissions.length === 0) return true;

  // Check if user has ADMIN_ACCESS
  const hasAdminAccess = userPermissions.includes(PERMISSIONS.ADMIN_ACCESS);
  
  // Filter out ADMIN_ACCESS from required permissions to get specific permissions
  const specificPermissions = requiredPermissions.filter(
    perm => perm !== PERMISSIONS.ADMIN_ACCESS
  );
  
  // If item requires only ADMIN_ACCESS (no specific permissions)
  if (specificPermissions.length === 0) {
    return hasAdminAccess;
  }
  
  // If item requires specific permissions + ADMIN_ACCESS
  // User must have at least one specific permission AND ADMIN_ACCESS
  if (specificPermissions.length > 0) {
    const hasSpecificPermission = specificPermissions.some(
      perm => userPermissions.includes(perm)
    );
    return hasAdminAccess && hasSpecificPermission;
  }
  
  return false;
};

// Helper function to filter menu items based on user permissions
export const filterMenuByPermissions = (
  menuItems: any[],
  userPermissions: string[]
): any[] => {
  return menuItems
    .map(item => {
      // Check if user has permission for this menu item
      const itemPermissions = MENU_PERMISSIONS[item.id as keyof typeof MENU_PERMISSIONS];
      // If item not found in MENU_PERMISSIONS, require ADMIN_ACCESS by default
      const requiredPermissions = itemPermissions ? [...itemPermissions] : [PERMISSIONS.ADMIN_ACCESS];
      const hasAccess = hasMenuAccess(userPermissions, requiredPermissions);

      if (!hasAccess) {
        return null; // Hide this menu item
      }

      // If item has children, filter them recursively
      if (item.children) {
        const filteredChildren = filterMenuByPermissions(item.children, userPermissions);
        if (filteredChildren.length === 0) {
          return null; // Hide parent if no children are accessible
        }
        return { ...item, children: filteredChildren };
      }

      return item;
    })
    .filter(Boolean); // Remove null items
};
