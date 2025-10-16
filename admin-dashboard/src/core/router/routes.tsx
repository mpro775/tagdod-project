import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
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
const PublicCouponsPage = lazy(() =>
  import('@/features/coupons/pages/PublicCouponsPage').then((m) => ({
    default: m.PublicCouponsPage,
  }))
);
const MediaLibraryPage = lazy(() =>
  import('@/features/media/pages/MediaLibraryPage').then((m) => ({
    default: m.MediaLibraryPage,
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
const PromotionsListPage = lazy(() =>
  import('@/features/promotions/pages/PromotionsListPage').then((m) => ({
    default: m.PromotionsListPage,
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
const UnauthorizedPage = lazy(() => import('@/features/auth/pages/UnauthorizedPage').then((m) => ({ default: m.UnauthorizedPage })));
const NotFoundPage = lazy(() => import('@/features/auth/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

export const routes: RouteObject[] = [
  // Public routes
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
  {
    path: '/coupons/public',
    element: <PublicCouponsPage />,
  },

  // Protected routes
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      // Users routes
      {
        path: 'users',
        element: <UsersListPage />,
      },
      {
        path: 'users/new',
        element: <UserFormPage />,
      },
      {
        path: 'users/:id',
        element: <UserFormPage />,
      },
      // Products routes
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
      // Categories routes
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
      // Brands routes
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
      // Attributes routes
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
      // Orders routes
      {
        path: 'orders',
        element: <OrdersListPage />,
      },
      {
        path: 'orders/:id',
        element: <OrderDetailsPage />,
      },
      // Analytics routes
      {
        path: 'analytics',
        element: <AnalyticsDashboardPage />,
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
      // Coupons routes
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
        path: 'coupons/:id/analytics',
        element: <CouponAnalyticsPage />,
      },
      // Media routes
      {
        path: 'media',
        element: <MediaLibraryPage />,
      },
      // Banners routes
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
      // Promotions routes
      {
        path: 'promotions',
        element: <PromotionsListPage />,
      },
      // Support routes
      {
        path: 'support',
        element: <SupportTicketsListPage />,
      },
      {
        path: 'support/:id',
        element: <SupportTicketDetailsPage />,
      },
      {
        path: 'support/stats',
        element: <SupportStatsPage />,
      },
      // Notifications routes
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
      // Services routes
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
      // Cart routes
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
    ],
  },

  // 404
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

