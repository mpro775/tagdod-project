import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { RouteGuard } from '@/shared/components/RouteGuard';
import { MainLayout } from '@/shared/components/Layout/MainLayout';

// Lazy load pages
const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const ForgotPasswordPage = lazy(() =>
  import('@/features/auth/pages/ForgotPasswordPage').then((m) => ({
    default: m.ForgotPasswordPage,
  }))
);
const UnauthorizedPage = lazy(() =>
  import('@/features/auth/pages/UnauthorizedPage').then((m) => ({
    default: m.default,
  }))
);
const DashboardPage = lazy(() =>
  import('@/features/dashboard/pages/DashboardPage').then((m) => ({
    default: m.DashboardPage,
  }))
);
const UsersListPage = lazy(() =>
  import('@/features/users/pages/UsersListPage').then((m) => ({
    default: m.UsersListPage,
  }))
);
const UserFormPage = lazy(() =>
  import('@/features/users/pages/UserFormPage').then((m) => ({
    default: m.UserFormPage,
  }))
);
const CreateAdminPage = lazy(() =>
  import('@/features/users/pages/CreateAdminPage').then((m) => ({
    default: m.CreateAdminPage,
  }))
);
const UserAnalyticsPage = lazy(() =>
  import('@/features/users/pages/UserAnalyticsPage').then((m) => ({
    default: m.UserAnalyticsPage,
  }))
);
const ProductsListPage = lazy(() =>
  import('@/features/products/pages/ProductsListPage').then((m) => ({
    default: m.ProductsListPage,
  }))
);
const ProductFormPage = lazy(() =>
  import('@/features/products/pages/ProductFormPage').then((m) => ({
    default: m.ProductFormPage,
  }))
);
const ProductsAnalyticsPage = lazy(() =>
  import('@/features/products/pages/ProductsAnalyticsPage').then((m) => ({
    default: m.ProductsAnalyticsPage,
  }))
);
const InventoryPage = lazy(() =>
  import('@/features/products/pages/InventoryPage').then((m) => ({
    default: m.InventoryPage,
  }))
);
const ProductVariantsPage = lazy(() =>
  import('@/features/products/pages/ProductVariantsPage').then((m) => ({
    default: m.ProductVariantsPage,
  }))
);
const ProductViewPage = lazy(() =>
  import('@/features/products/pages/ProductViewPage').then((m) => ({
    default: m.ProductViewPage,
  }))
);
const CategoriesListPage = lazy(() =>
  import('@/features/categories/pages/CategoriesListPage').then((m) => ({
    default: m.CategoriesListPage,
  }))
);
const CategoryFormPage = lazy(() =>
  import('@/features/categories/pages/CategoryFormPage').then((m) => ({
    default: m.CategoryFormPage,
  }))
);
const BrandsListPage = lazy(() =>
  import('@/features/brands/pages/BrandsListPage').then((m) => ({
    default: m.BrandsListPage,
  }))
);
const BrandFormPage = lazy(() =>
  import('@/features/brands/pages/BrandFormPage').then((m) => ({
    default: m.BrandFormPage,
  }))
);
const AttributesListPage = lazy(() =>
  import('@/features/attributes/pages/AttributesListPage').then((m) => ({
    default: m.AttributesListPage,
  }))
);
const AttributeFormPage = lazy(() =>
  import('@/features/attributes/pages/AttributeFormPage').then((m) => ({
    default: m.AttributeFormPage,
  }))
);
const AttributeValuesPage = lazy(() =>
  import('@/features/attributes/pages/AttributeValuesPage').then((m) => ({
    default: m.AttributeValuesPage,
  }))
);
const AuditLogsPage = lazy(() =>
  import('@/features/audit/pages/AuditLogsPage').then((m) => ({
    default: m.AuditLogsPage,
  }))
);
const AuditAnalyticsPage = lazy(() =>
  import('@/features/audit/pages/AuditAnalyticsPage').then((m) => ({
    default: m.AuditAnalyticsPage,
  }))
);
const AuditMainPage = lazy(() =>
  import('@/features/audit/pages/AuditMainPage').then((m) => ({
    default: m.AuditMainPage,
  }))
);
const OrdersListPage = lazy(() =>
  import('@/features/orders/pages/OrdersListPage').then((m) => ({
    default: m.OrdersListPage,
  }))
);
const OrderDetailsPage = lazy(() =>
  import('@/features/orders/pages/OrderDetailsPage').then((m) => ({
    default: m.OrderDetailsPage,
  }))
);
const OrderAnalyticsPage = lazy(() =>
  import('@/features/orders/pages/OrderAnalyticsPage').then((m) => ({
    default: m.OrderAnalyticsPage,
  }))
);
const AnalyticsDashboardPage = lazy(() =>
  import('@/features/analytics/pages/AnalyticsDashboardPage').then((m) => ({
    default: m.AnalyticsDashboardPage,
  }))
);
const AdvancedAnalyticsDashboardPage = lazy(() =>
  import('@/features/analytics/pages/AdvancedAnalyticsDashboardPage').then((m) => ({
    default: m.AdvancedAnalyticsDashboardPage,
  }))
);
const DataExportPage = lazy(() =>
  import('@/features/analytics/pages/DataExportPage').then((m) => ({
    default: m.DataExportPage,
  }))
);
const ReportsManagementPage = lazy(() =>
  import('@/features/analytics/pages/ReportsManagementPage').then((m) => ({
    default: m.ReportsManagementPage,
  }))
);
const AnalyticsMainPage = lazy(() =>
  import('@/features/analytics/pages/AnalyticsMainPage').then((m) => ({
    default: m.AnalyticsMainPage,
  }))
);
const CouponsListPage = lazy(() =>
  import('@/features/coupons/pages/CouponsListPage').then((m) => ({
    default: m.CouponsListPage,
  }))
);
const CouponFormPage = lazy(() =>
  import('@/features/coupons/pages/CouponFormPage').then((m) => ({
    default: m.CouponFormPage,
  }))
);
const CouponAnalyticsPage = lazy(() =>
  import('@/features/coupons/pages/CouponAnalyticsPage').then((m) => ({
    default: m.CouponAnalyticsPage,
  }))
);
const MediaLibraryPage = lazy(() =>
  import('@/features/media/pages/MediaLibraryPage').then((m) => ({
    default: m.MediaLibraryPage,
  }))
);
const MediaAnalyticsPage = lazy(() =>
  import('@/features/media/pages/MediaAnalyticsPage').then((m) => ({
    default: m.MediaAnalyticsPage,
  }))
);
const MarketingDashboardPage = lazy(() =>
  import('@/features/marketing/pages/MarketingDashboardPage').then((m) => ({
    default: m.default,
  }))
);
const PriceRulesListPage = lazy(() =>
  import('@/features/marketing/pages/PriceRulesListPage').then((m) => ({
    default: m.default,
  }))
);
const CreatePriceRulePage = lazy(() =>
  import('@/features/marketing/pages/CreatePriceRulePage').then((m) => ({
    default: m.default,
  }))
);
const BannersListPage = lazy(() =>
  import('@/features/banners/pages/BannersListPage').then((m) => ({
    default: m.BannersListPage,
  }))
);
const BannerFormPage = lazy(() =>
  import('@/features/banners/pages/BannerFormPage').then((m) => ({
    default: m.BannerFormPage,
  }))
);
const BannerAnalyticsPage = lazy(() =>
  import('@/features/banners/pages/BannerAnalyticsPage').then((m) => ({
    default: m.BannerAnalyticsPage,
  }))
);
const SupportTicketsListPage = lazy(() =>
  import('@/features/support/pages/SupportTicketsListPage').then((m) => ({
    default: m.SupportTicketsListPage,
  }))
);
const SupportTicketDetailsPage = lazy(() =>
  import('@/features/support/pages/SupportTicketDetailsPage').then((m) => ({
    default: m.SupportTicketDetailsPage,
  }))
);
const SupportStatsPage = lazy(() =>
  import('@/features/support/pages/SupportStatsPage').then((m) => ({
    default: m.SupportStatsPage,
  }))
);
const CannedResponsesPage = lazy(() =>
  import('@/features/support/pages/CannedResponsesPage').then((m) => ({
    default: m.CannedResponsesPage,
  }))
);
const NotificationsListPage = lazy(() =>
  import('@/features/notifications/pages/NotificationsListPage').then((m) => ({
    default: m.NotificationsListPage,
  }))
);
const NotificationsAnalyticsPage = lazy(() =>
  import('@/features/notifications/pages/NotificationsAnalyticsPage').then((m) => ({
    default: m.NotificationsAnalyticsPage,
  }))
);
const NotificationTemplatesPage = lazy(() =>
  import('@/features/notifications/pages/NotificationTemplatesPage').then((m) => ({
    default: m.NotificationTemplatesPage,
  }))
);
const ServicesListPage = lazy(() =>
  import('@/features/services/pages/ServicesListPage').then((m) => ({
    default: m.ServicesListPage,
  }))
);
const ServicesOverviewPage = lazy(() =>
  import('@/features/services/pages/ServicesOverviewPage').then((m) => ({
    default: m.ServicesOverviewPage,
  }))
);
const EngineersManagementPage = lazy(() =>
  import('@/features/services/pages/EngineersManagementPage').then((m) => ({
    default: m.EngineersManagementPage,
  }))
);
const OffersManagementPage = lazy(() =>
  import('@/features/services/pages/OffersManagementPage').then((m) => ({
    default: m.OffersManagementPage,
  }))
);
const ServicesAnalyticsPage = lazy(() =>
  import('@/features/services/pages/ServicesAnalyticsPage').then((m) => ({
    default: m.ServicesAnalyticsPage,
  }))
);
const CartManagementPage = lazy(() =>
  import('@/features/cart/pages/CartManagementPage').then((m) => ({
    default: m.CartManagementPage,
  }))
);
const AbandonedCartsPage = lazy(() =>
  import('@/features/cart/pages/AbandonedCartsPage').then((m) => ({
    default: m.AbandonedCartsPage,
  }))
);
const CartAnalyticsPage = lazy(() =>
  import('@/features/cart/pages/CartAnalyticsPage').then((m) => ({
    default: m.CartAnalyticsPage,
  }))
);
const NotFoundPage = lazy(() => import('@/features/auth/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));
const ExchangeRatesPage = lazy(() => import('@/features/exchange-rates/pages/ExchangeRatesPage').then((m) => ({ default: m.default })));
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage').then((m) => ({ default: m.default })));
const SystemMonitoringPage = lazy(() => import('@/features/system-monitoring/pages/SystemMonitoringPage').then((m) => ({ default: m.SystemMonitoringPage })));
const ErrorLogsPage = lazy(() => import('@/features/error-logs/pages/ErrorLogsPage').then((m) => ({ default: m.ErrorLogsPage })));
const I18nManagementPage = lazy(() => import('@/features/i18n-management/pages/I18nManagementPage').then((m) => ({ default: m.I18nManagementPage })));
const SystemSettingsPage = lazy(() => import('@/features/system-settings/pages/SystemSettingsPage').then((m) => ({ default: m.SystemSettingsPage })));

// Addresses Admin
const AddressesDashboardPage = lazy(() => import('@/features/addresses/pages/AddressesDashboardPage').then((m) => ({ default: m.AddressesDashboardPage })));

// Search Admin
const SearchDashboardPage = lazy(() => import('@/features/search/pages/SearchDashboardPage').then((m) => ({ default: m.SearchDashboardPage })));

export const routes: RouteObject[] = [
  // ===========================================
  // PUBLIC ROUTES - Accessible without authentication
  // ===========================================
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },

  // ===========================================
  // PROTECTED ROUTES - Require authentication and permissions
  // ===========================================
  {
    path: '/',
    element: (
      <RouteGuard>
        <MainLayout />
      </RouteGuard>
    ),
    children: [
      // Dashboard Routes
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      // ===========================================
      // USER MANAGEMENT
      // ===========================================
      {
        path: 'users',
        element: <UsersListPage />,
      },
      {
        path: 'users/analytics',
        element: <UserAnalyticsPage />,
      },
      {
        path: 'users/new',
        element: <UserFormPage />,
      },
      {
        path: 'users/:id',
        element: <UserFormPage />,
      },
      {
        path: 'users/create-admin',
        element: <CreateAdminPage />,
      },

      // ===========================================
      // CATALOG MANAGEMENT
      // ===========================================

      // Products
      {
        path: 'products',
        element: <ProductsListPage />,
      },
      {
        path: 'products/new',
        element: <ProductFormPage />,
      },
      {
        path: 'products/:id',
        element: <ProductFormPage />,
      },
      {
        path: 'products/:id/view',
        element: <ProductViewPage />,
      },
      {
        path: 'products/:id/variants',
        element: <ProductVariantsPage />,
      },
      {
        path: 'products/analytics',
        element: <ProductsAnalyticsPage />,
      },
      {
        path: 'products/inventory',
        element: <InventoryPage />,
      },

      // Categories
      {
        path: 'categories',
        element: <CategoriesListPage />,
      },
      {
        path: 'categories/new',
        element: <CategoryFormPage />,
      },
      {
        path: 'categories/:id',
        element: <CategoryFormPage />,
      },
      // Brands
      {
        path: 'brands',
        element: <BrandsListPage />,
      },
      {
        path: 'brands/new',
        element: <BrandFormPage />,
      },
      {
        path: 'brands/:id',
        element: <BrandFormPage />,
      },

      // Attributes
      {
        path: 'attributes',
        element: <AttributesListPage />,
      },
      {
        path: 'attributes/new',
        element: <AttributeFormPage />,
      },
      {
        path: 'attributes/:id',
        element: <AttributeFormPage />,
      },
      {
        path: 'attributes/:id/values',
        element: <AttributeValuesPage />,
      },

      // ===========================================
      // SALES & ORDERS
      // ===========================================

      // Orders
      {
        path: 'orders',
        element: <OrdersListPage />,
      },
      {
        path: 'orders/analytics',
        element: <OrderAnalyticsPage />,
      },
      {
        path: 'orders/:id',
        element: <OrderDetailsPage />,
      },

      // ===========================================
      // ANALYTICS & REPORTS
      // ===========================================
      {
        path: 'analytics',
        element: <AnalyticsDashboardPage />,
      },
      {
        path: 'analytics/main',
        element: <AnalyticsMainPage />,
      },
      {
        path: 'analytics/advanced',
        element: <AdvancedAnalyticsDashboardPage />,
      },
      {
        path: 'analytics/export',
        element: <DataExportPage />,
      },
      {
        path: 'analytics/reports',
        element: <ReportsManagementPage />,
      },

      // ===========================================
      // MARKETING & PROMOTIONS
      // ===========================================

      // Marketing Dashboard
      {
        path: 'marketing',
        element: <MarketingDashboardPage />,
      },

      // Price Rules
      {
        path: 'marketing/price-rules',
        element: <PriceRulesListPage />,
      },
      {
        path: 'marketing/price-rules/new',
        element: <CreatePriceRulePage />,
      },
      {
        path: 'marketing/price-rules/:id',
        element: <CreatePriceRulePage />,
      },

      // Coupons
      {
        path: 'coupons',
        element: <CouponsListPage />,
      },
      {
        path: 'coupons/new',
        element: <CouponFormPage />,
      },
      {
        path: 'coupons/:id',
        element: <CouponFormPage />,
      },
      {
        path: 'coupons/analytics',
        element: <CouponAnalyticsPage />,
      },
      {
        path: 'coupons/:id/analytics',
        element: <CouponAnalyticsPage />,
      },
      // Banners
      {
        path: 'banners',
        element: <BannersListPage />,
      },
      {
        path: 'banners/new',
        element: <BannerFormPage />,
      },
      {
        path: 'banners/:id',
        element: <BannerFormPage />,
      },
      {
        path: 'banners/analytics',
        element: <BannerAnalyticsPage />,
      },

      // ===========================================
      // SERVICES MANAGEMENT
      // ===========================================
      {
        path: 'services',
        element: <ServicesOverviewPage />,
      },
      {
        path: 'services/requests',
        element: <ServicesListPage />,
      },
      {
        path: 'services/engineers',
        element: <EngineersManagementPage />,
      },
      {
        path: 'services/offers',
        element: <OffersManagementPage />,
      },
      {
        path: 'services/analytics',
        element: <ServicesAnalyticsPage />,
      },

      // ===========================================
      // SUPPORT & COMMUNICATION
      // ===========================================

      // Support Tickets
      {
        path: 'support',
        element: <SupportTicketsListPage />,
      },
      {
        path: 'support/stats',
        element: <SupportStatsPage />,
      },
      {
        path: 'support/canned-responses',
        element: <CannedResponsesPage />,
      },
      {
        path: 'support/:id',
        element: <SupportTicketDetailsPage />,
      },

      // Notifications
      {
        path: 'notifications',
        element: <NotificationsListPage />,
      },
      {
        path: 'notifications/analytics',
        element: <NotificationsAnalyticsPage />,
      },
      {
        path: 'notifications/templates',
        element: <NotificationTemplatesPage />,
      },

      // ===========================================
      // CART MANAGEMENT
      // ===========================================
      {
        path: 'carts',
        element: <CartManagementPage />,
      },
      {
        path: 'carts/abandoned',
        element: <AbandonedCartsPage />,
      },
      {
        path: 'carts/analytics',
        element: <CartAnalyticsPage />,
      },

      // ===========================================
      // AUDIT & SECURITY
      // ===========================================
      {
        path: 'audit',
        element: <AuditLogsPage />,
      },
      {
        path: 'audit/main',
        element: <AuditMainPage />,
      },
      {
        path: 'audit/analytics',
        element: <AuditAnalyticsPage />,
      },

      // ===========================================
      // MEDIA MANAGEMENT
      // ===========================================
      {
        path: 'media',
        element: <MediaLibraryPage />,
      },
      {
        path: 'media/analytics',
        element: <MediaAnalyticsPage />,
      },

      // ===========================================
      // SYSTEM CONFIGURATION
      // ===========================================

      // Exchange Rates
      {
        path: 'exchange-rates',
        element: <ExchangeRatesPage />,
      },

      // Settings
      {
        path: 'settings',
        element: <SettingsPage />,
      },

      // ===========================================
      // SYSTEM MANAGEMENT (NEW)
      // ===========================================

      // System Monitoring
      {
        path: 'system/monitoring',
        element: <SystemMonitoringPage />,
      },

      // Error & Logs Management
      {
        path: 'system/error-logs',
        element: <ErrorLogsPage />,
      },

      // i18n Management
      {
        path: 'system/i18n',
        element: <I18nManagementPage />,
      },

      // System Settings
      {
        path: 'system/settings',
        element: <SystemSettingsPage />,
      },

      // ===========================================
      // ADMIN ANALYTICS & MANAGEMENT (NEW)
      // ===========================================

      // Addresses Management
      {
        path: 'admin/addresses',
        element: <AddressesDashboardPage />,
      },

      // Search Analytics
      {
        path: 'admin/search',
        element: <SearchDashboardPage />,
      },
    ],
  },

  // ===========================================
  // ERROR ROUTES
  // ===========================================
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

