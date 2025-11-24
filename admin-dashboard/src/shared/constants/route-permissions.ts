import { PERMISSIONS } from './permissions';

// Route permissions mapping - defines what permissions are required for each route
export const ROUTE_PERMISSIONS = {
  // Dashboard - always accessible for admins
  '/dashboard': [],
  '/': [],

  // Users
  '/users': [PERMISSIONS.USERS_READ, PERMISSIONS.ADMIN_ACCESS],
  '/users/new': [PERMISSIONS.USERS_CREATE, PERMISSIONS.ADMIN_ACCESS],
  '/users/:id': [PERMISSIONS.USERS_UPDATE, PERMISSIONS.ADMIN_ACCESS],
  '/users/deleted': [PERMISSIONS.USERS_READ, PERMISSIONS.ADMIN_ACCESS],
  '/users/verification-requests': [PERMISSIONS.USERS_READ, PERMISSIONS.ADMIN_ACCESS],

  // Products
  '/products': [PERMISSIONS.PRODUCTS_READ, PERMISSIONS.ADMIN_ACCESS],
  '/products/new': [PERMISSIONS.PRODUCTS_CREATE, PERMISSIONS.ADMIN_ACCESS],
  '/products/:id': [PERMISSIONS.PRODUCTS_UPDATE, PERMISSIONS.ADMIN_ACCESS],

  // Categories
  '/categories': [PERMISSIONS.CATEGORIES_READ, PERMISSIONS.ADMIN_ACCESS],
  '/categories/new': [PERMISSIONS.CATEGORIES_CREATE, PERMISSIONS.ADMIN_ACCESS],
  '/categories/:id': [PERMISSIONS.CATEGORIES_UPDATE, PERMISSIONS.ADMIN_ACCESS],

  // Attributes
  '/attributes': [PERMISSIONS.ATTRIBUTES_READ, PERMISSIONS.ADMIN_ACCESS],
  '/attributes/new': [PERMISSIONS.ATTRIBUTES_CREATE, PERMISSIONS.ADMIN_ACCESS],
  '/attributes/:id': [PERMISSIONS.ATTRIBUTES_UPDATE, PERMISSIONS.ADMIN_ACCESS],

  // Brands
  '/brands': [PERMISSIONS.BRANDS_READ, PERMISSIONS.ADMIN_ACCESS],
  '/brands/new': [PERMISSIONS.BRANDS_CREATE, PERMISSIONS.ADMIN_ACCESS],
  '/brands/:id': [PERMISSIONS.BRANDS_UPDATE, PERMISSIONS.ADMIN_ACCESS],

  // Orders
  '/orders': [PERMISSIONS.ORDERS_READ, PERMISSIONS.ADMIN_ACCESS],
  '/orders/:id': [PERMISSIONS.ORDERS_UPDATE, PERMISSIONS.ADMIN_ACCESS],

  // Carts
  '/carts': [PERMISSIONS.CARTS_READ, PERMISSIONS.ADMIN_ACCESS],
  '/carts/abandoned': [PERMISSIONS.CARTS_READ, PERMISSIONS.ADMIN_ACCESS],
  '/carts/analytics': [PERMISSIONS.ANALYTICS_READ, PERMISSIONS.ADMIN_ACCESS],

  // Coupons
  '/coupons': [PERMISSIONS.MARKETING_READ, PERMISSIONS.ADMIN_ACCESS],
  '/coupons/new': [PERMISSIONS.MARKETING_CREATE, PERMISSIONS.ADMIN_ACCESS],
  '/coupons/:id': [PERMISSIONS.MARKETING_UPDATE, PERMISSIONS.ADMIN_ACCESS],

  // Banners
  '/banners': [PERMISSIONS.MARKETING_READ, PERMISSIONS.ADMIN_ACCESS],
  '/banners/new': [PERMISSIONS.MARKETING_CREATE, PERMISSIONS.ADMIN_ACCESS],
  '/banners/:id': [PERMISSIONS.MARKETING_UPDATE, PERMISSIONS.ADMIN_ACCESS],

  // Promotions
  '/promotions': [PERMISSIONS.MARKETING_READ, PERMISSIONS.ADMIN_ACCESS],
  '/promotions/new': [PERMISSIONS.MARKETING_CREATE, PERMISSIONS.ADMIN_ACCESS],
  '/promotions/:id': [PERMISSIONS.MARKETING_UPDATE, PERMISSIONS.ADMIN_ACCESS],

  // Services
  '/services': [PERMISSIONS.SERVICES_READ, PERMISSIONS.ADMIN_ACCESS],
  '/services/requests': [PERMISSIONS.SERVICES_READ, PERMISSIONS.ADMIN_ACCESS],
  '/services/engineers': [PERMISSIONS.SERVICES_READ, PERMISSIONS.ADMIN_ACCESS],
  '/services/engineers/:engineerId/coupons': [PERMISSIONS.MARKETING_READ, PERMISSIONS.ADMIN_ACCESS],
  '/services/offers': [PERMISSIONS.SERVICES_READ, PERMISSIONS.ADMIN_ACCESS],
  '/services/analytics': [PERMISSIONS.ANALYTICS_READ, PERMISSIONS.ADMIN_ACCESS],

  // Media
  '/media': [PERMISSIONS.MEDIA_MANAGE, PERMISSIONS.ADMIN_ACCESS],

  // Analytics
  '/analytics': [PERMISSIONS.ANALYTICS_READ, PERMISSIONS.ADMIN_ACCESS],
  '/analytics/advanced': [PERMISSIONS.ANALYTICS_READ, PERMISSIONS.ADMIN_ACCESS],
  '/analytics/export': [PERMISSIONS.ANALYTICS_EXPORT, PERMISSIONS.ADMIN_ACCESS],
  '/analytics/reports': [PERMISSIONS.REPORTS_GENERATE, PERMISSIONS.ADMIN_ACCESS],

  // Support
  '/support': [PERMISSIONS.SUPPORT_READ, PERMISSIONS.ADMIN_ACCESS],

  // Notifications
  '/notifications': [PERMISSIONS.NOTIFICATIONS_READ, PERMISSIONS.ADMIN_ACCESS],
  '/notifications/analytics': [PERMISSIONS.ANALYTICS_READ, PERMISSIONS.ADMIN_ACCESS],
  '/notifications/templates': [PERMISSIONS.NOTIFICATIONS_MANAGE, PERMISSIONS.ADMIN_ACCESS],

  // Exchange Rates
  '/exchange-rates': [PERMISSIONS.EXCHANGE_RATES_READ, PERMISSIONS.ADMIN_ACCESS],

  // Settings
  '/settings': [PERMISSIONS.SETTINGS_READ, PERMISSIONS.ADMIN_ACCESS],
} as const;

// Helper function to get required permissions for a route
export const getRoutePermissions = (pathname: string): string[] => {
  // Direct match
  if (ROUTE_PERMISSIONS[pathname as keyof typeof ROUTE_PERMISSIONS]) {
    return Array.from(ROUTE_PERMISSIONS[pathname as keyof typeof ROUTE_PERMISSIONS]);
  }

  // Pattern matching for dynamic routes (e.g., /users/:id)
  for (const [pattern, permissions] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pattern.includes('/:') || pattern.includes('/*')) {
      // Convert pattern to regex
      const regexPattern = pattern
        .replace(/:\w+/g, '[^/]+') // Replace :param with [^/]+
        .replace(/\*/g, '.*'); // Replace * with .*

      const regex = new RegExp(`^${regexPattern}$`);
      if (regex.test(pathname)) {
        return Array.from(permissions);
      }
    }
  }

  // Default permissions for admin routes
  return [PERMISSIONS.ADMIN_ACCESS];
};
