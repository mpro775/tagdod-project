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

  // Carts
  CARTS_READ: 'carts.read',
  CARTS_SEND_REMINDERS: 'carts.send_reminders',
  CARTS_CONVERT_TO_ORDER: 'carts.convert_to_order',

  // Services
  SERVICES_READ: 'services.read',
  SERVICES_UPDATE: 'services.update',

  // Support
  SUPPORT_READ: 'support.read',
  SUPPORT_UPDATE: 'support.update',
  SUPPORT_ASSIGN: 'support.assign',

  // Marketing
  MARKETING_READ: 'marketing.read',
  MARKETING_CREATE: 'marketing.create',
  MARKETING_UPDATE: 'marketing.update',
  MARKETING_DELETE: 'marketing.delete',

  // Analytics
  ANALYTICS_READ: 'analytics.read',
  REPORTS_GENERATE: 'reports.generate',
  ANALYTICS_EXPORT: 'analytics.export',

  // Media
  MEDIA_MANAGE: 'media.manage',

  // Notifications
  NOTIFICATIONS_READ: 'notifications.read',
  NOTIFICATIONS_MANAGE: 'notifications.manage',

  // Exchange Rates
  EXCHANGE_RATES_READ: 'exchange_rates.read',
  EXCHANGE_RATES_UPDATE: 'exchange_rates.update',

  // System
  SETTINGS_READ: 'settings.read',
  SETTINGS_UPDATE: 'settings.update',

  // Admin Access
  ADMIN_ACCESS: 'admin.access',
  SUPER_ADMIN_ACCESS: 'super_admin.access',
  SYSTEM_LOGS: 'system.logs',
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

  // Catalog section
  catalog: [PERMISSIONS.ADMIN_ACCESS], // Parent menu - visible if any child is visible
  products: [PERMISSIONS.PRODUCTS_READ, PERMISSIONS.ADMIN_ACCESS],
  categories: [PERMISSIONS.CATEGORIES_READ, PERMISSIONS.ADMIN_ACCESS],
  attributes: [PERMISSIONS.ATTRIBUTES_READ, PERMISSIONS.ADMIN_ACCESS],
  brands: [PERMISSIONS.BRANDS_READ, PERMISSIONS.ADMIN_ACCESS],

  // Sales section
  sales: [PERMISSIONS.ADMIN_ACCESS], // Parent menu - visible if any child is visible
  orders: [PERMISSIONS.ORDERS_READ, PERMISSIONS.ADMIN_ACCESS],
  carts: [PERMISSIONS.CARTS_READ, PERMISSIONS.ADMIN_ACCESS],
  'carts-abandoned': [PERMISSIONS.CARTS_READ, PERMISSIONS.ADMIN_ACCESS],
  'carts-analytics': [PERMISSIONS.ANALYTICS_READ, PERMISSIONS.ADMIN_ACCESS],
  coupons: [PERMISSIONS.MARKETING_READ, PERMISSIONS.ADMIN_ACCESS],

  // Marketing section
  marketing: [PERMISSIONS.ADMIN_ACCESS], // Parent menu - visible if any child is visible
  banners: [PERMISSIONS.MARKETING_READ, PERMISSIONS.ADMIN_ACCESS],
  promotions: [PERMISSIONS.MARKETING_READ, PERMISSIONS.ADMIN_ACCESS],

  // Services section
  services: [PERMISSIONS.ADMIN_ACCESS], // Parent menu - visible if any child is visible
  'services-overview': [PERMISSIONS.SERVICES_READ, PERMISSIONS.ADMIN_ACCESS],
  'services-requests': [PERMISSIONS.SERVICES_READ, PERMISSIONS.ADMIN_ACCESS],
  'services-engineers': [PERMISSIONS.SERVICES_READ, PERMISSIONS.ADMIN_ACCESS],
  'services-offers': [PERMISSIONS.SERVICES_READ, PERMISSIONS.ADMIN_ACCESS],
  'services-analytics': [PERMISSIONS.ANALYTICS_READ, PERMISSIONS.ADMIN_ACCESS],

  // Media
  media: [PERMISSIONS.MEDIA_MANAGE, PERMISSIONS.ADMIN_ACCESS],

  // Analytics section
  analytics: [PERMISSIONS.ADMIN_ACCESS], // Parent menu - visible if any child is visible
  'analytics-dashboard': [PERMISSIONS.ANALYTICS_READ, PERMISSIONS.ADMIN_ACCESS],
  'analytics-advanced': [PERMISSIONS.ANALYTICS_READ, PERMISSIONS.ADMIN_ACCESS],
  'analytics-export': [PERMISSIONS.ANALYTICS_EXPORT, PERMISSIONS.ADMIN_ACCESS],
  'analytics-reports': [PERMISSIONS.REPORTS_GENERATE, PERMISSIONS.ADMIN_ACCESS],

  // Support
  support: [PERMISSIONS.SUPPORT_READ, PERMISSIONS.ADMIN_ACCESS],

  // Notifications section
  notifications: [PERMISSIONS.ADMIN_ACCESS], // Parent menu - visible if any child is visible
  'notifications-list': [PERMISSIONS.NOTIFICATIONS_READ, PERMISSIONS.ADMIN_ACCESS],
  'notifications-analytics': [PERMISSIONS.ANALYTICS_READ, PERMISSIONS.ADMIN_ACCESS],
  'notifications-templates': [PERMISSIONS.NOTIFICATIONS_MANAGE, PERMISSIONS.ADMIN_ACCESS],

  // Exchange Rates
  'exchange-rates': [PERMISSIONS.EXCHANGE_RATES_READ, PERMISSIONS.ADMIN_ACCESS],

  // Settings
  settings: [PERMISSIONS.SETTINGS_READ, PERMISSIONS.ADMIN_ACCESS],
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

// Helper function to filter menu items based on user permissions
export const filterMenuByPermissions = (
  menuItems: any[],
  userPermissions: string[]
): any[] => {
  return menuItems
    .map(item => {
      // Check if user has permission for this menu item
      const itemPermissions = MENU_PERMISSIONS[item.id as keyof typeof MENU_PERMISSIONS];
      const hasAccess = hasAnyPermission(userPermissions, itemPermissions ? [...itemPermissions] : []);

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
