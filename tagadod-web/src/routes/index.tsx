import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import { AppShell } from "../components/layout";
import { PageLoader } from "../components/PageLoader";
import { isLoggedIn, isGuestMode } from "../stores/authStore";
import { hasSeenOnboarding } from "../stores/onboardingStore";

// ── Lazy-loaded pages ──────────────────────────────────────────────

// Auth & onboarding
const SplashPage = lazy(() =>
  import("../features/splash/SplashPage").then((m) => ({
    default: m.SplashPage,
  })),
);
const OnboardingPage = lazy(() =>
  import("../features/onboarding/OnboardingPage").then((m) => ({
    default: m.OnboardingPage,
  })),
);
const LoginPage = lazy(() =>
  import("../features/auth/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const OtpPage = lazy(() =>
  import("../features/auth/OtpPage").then((m) => ({ default: m.OtpPage })),
);
const SetPasswordPage = lazy(() =>
  import("../features/auth/SetPasswordPage").then((m) => ({
    default: m.SetPasswordPage,
  })),
);
const ResetPasswordPage = lazy(() =>
  import("../features/auth/ResetPasswordPage").then((m) => ({
    default: m.ResetPasswordPage,
  })),
);

// Main tabs
const HomePage = lazy(() =>
  import("../features/home/HomePage").then((m) => ({ default: m.HomePage })),
);
const CategoriesPage = lazy(() =>
  import("../features/categories/CategoriesPage").then((m) => ({
    default: m.CategoriesPage,
  })),
);
const ProductsByCategoryPage = lazy(() =>
  import("../features/categories/ProductsByCategoryPage").then((m) => ({
    default: m.ProductsByCategoryPage,
  })),
);
const CartPage = lazy(() =>
  import("../features/cart/CartPage").then((m) => ({ default: m.CartPage })),
);
const OrdersPage = lazy(() =>
  import("../features/orders/OrdersPage").then((m) => ({
    default: m.OrdersPage,
  })),
);
const OrderDetailsPage = lazy(() =>
  import("../features/orders/OrderDetailsPage").then((m) => ({
    default: m.OrderDetailsPage,
  })),
);
const PaymentPage = lazy(() =>
  import("../features/orders/PaymentPage").then((m) => ({
    default: m.PaymentPage,
  })),
);
const ProfilePage = lazy(() =>
  import("../features/profile/ProfilePage").then((m) => ({
    default: m.ProfilePage,
  })),
);
const EditProfilePage = lazy(() =>
  import("../features/profile/EditProfilePage").then((m) => ({
    default: m.EditProfilePage,
  })),
);
const VerifyAccountPage = lazy(() =>
  import("../features/profile/VerifyAccountPage").then((m) => ({
    default: m.VerifyAccountPage,
  })),
);
const PolicyPage = lazy(() =>
  import("../features/profile/PolicyPage").then((m) => ({
    default: m.PolicyPage,
  })),
);

// Products & search
const ProductPage = lazy(() =>
  import("../features/product/ProductPage").then((m) => ({
    default: m.ProductPage,
  })),
);
const SearchPage = lazy(() =>
  import("../features/search/SearchPage").then((m) => ({
    default: m.SearchPage,
  })),
);

// Favorites & notifications
const FavoritesPage = lazy(() =>
  import("../features/favorites/FavoritesPage").then((m) => ({
    default: m.FavoritesPage,
  })),
);
const NotificationsPage = lazy(() =>
  import("../features/notifications/NotificationsPage").then((m) => ({
    default: m.NotificationsPage,
  })),
);

// Addresses
const AddressesPage = lazy(() =>
  import("../features/addresses/AddressesPage").then((m) => ({
    default: m.AddressesPage,
  })),
);
const SelectLocationPage = lazy(() =>
  import("../features/addresses/SelectLocationPage").then((m) => ({
    default: m.SelectLocationPage,
  })),
);

// Maintenance
const MaintenanceOrdersPage = lazy(() =>
  import("../features/maintenance/MaintenanceOrdersPage").then((m) => ({
    default: m.MaintenanceOrdersPage,
  })),
);
const OrderNewEngineerPage = lazy(() =>
  import("../features/maintenance/OrderNewEngineerPage").then((m) => ({
    default: m.OrderNewEngineerPage,
  })),
);
const EditServiceRequestPage = lazy(() =>
  import("../features/maintenance/EditServiceRequestPage").then((m) => ({
    default: m.EditServiceRequestPage,
  })),
);
const MyOrderDetailsPage = lazy(() =>
  import("../features/maintenance/MyOrderDetailsPage").then((m) => ({
    default: m.MyOrderDetailsPage,
  })),
);
const OfferDetailsPage = lazy(() =>
  import("../features/maintenance/OfferDetailsPage").then((m) => ({
    default: m.OfferDetailsPage,
  })),
);
const CustomersOrdersPage = lazy(() =>
  import("../features/maintenance/CustomersOrdersPage").then((m) => ({
    default: m.CustomersOrdersPage,
  })),
);
const MaintenanceDetailsPage = lazy(() =>
  import("../features/maintenance/MaintenanceDetailsPage").then((m) => ({
    default: m.MaintenanceDetailsPage,
  })),
);
const MakeOfferPage = lazy(() =>
  import("../features/maintenance/MakeOfferPage").then((m) => ({
    default: m.MakeOfferPage,
  })),
);
const EditOfferPage = lazy(() =>
  import("../features/maintenance/EditOfferPage").then((m) => ({
    default: m.EditOfferPage,
  })),
);
const EngineerProfilePage = lazy(() =>
  import("../features/maintenance/EngineerProfilePage").then((m) => ({
    default: m.EngineerProfilePage,
  })),
);

// Chat
const ChatPage = lazy(() =>
  import("../features/chat/ChatPage").then((m) => ({ default: m.ChatPage })),
);
const ChatDetailPage = lazy(() =>
  import("../features/chat/ChatDetailPage").then((m) => ({
    default: m.ChatDetailPage,
  })),
);

// Orders
const OrderTrackingPage = lazy(() =>
  import("../features/orders/OrderTrackingPage").then((m) => ({
    default: m.OrderTrackingPage,
  })),
);

// App config
const MaintenancePage = lazy(() =>
  import("../features/app-config/MaintenancePage").then((m) => ({
    default: m.MaintenancePage,
  })),
);
const ForceUpdatePage = lazy(() =>
  import("../features/app-config/ForceUpdatePage").then((m) => ({
    default: m.ForceUpdatePage,
  })),
);

// ── Route configuration ────────────────────────────────────────────

const fullScreenRoutes = [
  "/splash",
  "/onboarding",
  "/login",
  "/otp",
  "/setPassword",
  "/select_location",
  "/maintenance",
  "/force-update",
];

function LayoutWrapper() {
  const { pathname } = useLocation();
  const isFullScreen = fullScreenRoutes.some((r) => pathname === r);

  if (isFullScreen) {
    return <Outlet />;
  }

  return <AppShell showNav showAppBar />;
}

/** Redirect / to the appropriate first page */
function RootRedirect() {
  if (!hasSeenOnboarding()) return <Navigate to="/onboarding" replace />;
  if (isLoggedIn() || isGuestMode()) return <Navigate to="/home" replace />;
  return <Navigate to="/splash" replace />;
}

/** Guard: requires authentication (logged-in or guest for some routes) */
function RequireAuth({
  children,
  guestAllowed = false,
}: {
  children: React.ReactNode;
  guestAllowed?: boolean;
}) {
  const location = useLocation();
  const loggedIn = isLoggedIn();
  const guest = isGuestMode();

  if (!loggedIn && !(guestAllowed && guest)) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}

function LazyRoute({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <LazyRoute>{children}</LazyRoute>
    </RequireAuth>
  );
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth guestAllowed>
      <LazyRoute>{children}</LazyRoute>
    </RequireAuth>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <LayoutWrapper />,
    children: [
      // Root
      { index: true, element: <RootRedirect /> },

      // Public routes (no auth required)
      {
        path: "splash",
        element: (
          <LazyRoute>
            <SplashPage />
          </LazyRoute>
        ),
      },
      {
        path: "onboarding",
        element: (
          <LazyRoute>
            <OnboardingPage />
          </LazyRoute>
        ),
      },
      {
        path: "login",
        element: (
          <LazyRoute>
            <LoginPage />
          </LazyRoute>
        ),
      },
      {
        path: "otp",
        element: (
          <LazyRoute>
            <OtpPage />
          </LazyRoute>
        ),
      },
      {
        path: "setPassword",
        element: (
          <LazyRoute>
            <SetPasswordPage />
          </LazyRoute>
        ),
      },
      {
        path: "privacy-policy",
        element: (
          <LazyRoute>
            <PolicyPage />
          </LazyRoute>
        ),
      },
      {
        path: "terms-and-conditions",
        element: (
          <LazyRoute>
            <PolicyPage />
          </LazyRoute>
        ),
      },
      {
        path: "maintenance",
        element: (
          <LazyRoute>
            <MaintenancePage />
          </LazyRoute>
        ),
      },
      {
        path: "force-update",
        element: (
          <LazyRoute>
            <ForceUpdatePage updateUrl={undefined} />
          </LazyRoute>
        ),
      },

      // Guest-allowed routes (guest or logged-in)
      {
        path: "home",
        element: (
          <GuestRoute>
            <HomePage />
          </GuestRoute>
        ),
      },
      {
        path: "allCategories",
        element: (
          <GuestRoute>
            <CategoriesPage />
          </GuestRoute>
        ),
      },
      {
        path: "categories/:id/products",
        element: (
          <GuestRoute>
            <ProductsByCategoryPage />
          </GuestRoute>
        ),
      },
      {
        path: "products/:id",
        element: (
          <GuestRoute>
            <ProductPage />
          </GuestRoute>
        ),
      },
      {
        path: "search",
        element: (
          <GuestRoute>
            <SearchPage />
          </GuestRoute>
        ),
      },
      {
        path: "CartPage",
        element: (
          <GuestRoute>
            <CartPage />
          </GuestRoute>
        ),
      },
      {
        path: "orders",
        element: (
          <GuestRoute>
            <OrdersPage />
          </GuestRoute>
        ),
      },
      {
        path: "favorites",
        element: (
          <GuestRoute>
            <FavoritesPage />
          </GuestRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <GuestRoute>
            <ProfilePage />
          </GuestRoute>
        ),
      },
      {
        path: "maintenance-orders",
        element: (
          <GuestRoute>
            <MaintenanceOrdersPage />
          </GuestRoute>
        ),
      },

      // Protected routes (logged-in only)
      {
        path: "edit-profile",
        element: (
          <ProtectedRoute>
            <EditProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "reset-password",
        element: (
          <ProtectedRoute>
            <ResetPasswordPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "verify-account",
        element: (
          <ProtectedRoute>
            <VerifyAccountPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "notifications",
        element: (
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "addresses",
        element: (
          <ProtectedRoute>
            <AddressesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "select_location",
        element: (
          <ProtectedRoute>
            <SelectLocationPage />
          </ProtectedRoute>
        ),
      },

      // Orders
      {
        path: "order-details/:id",
        element: (
          <ProtectedRoute>
            <OrderDetailsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "order-tracking/:id",
        element: (
          <ProtectedRoute>
            <OrderTrackingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "payment",
        element: (
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        ),
      },

      // Maintenance - Customer
      {
        path: "order-new-engineer",
        element: (
          <ProtectedRoute>
            <OrderNewEngineerPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "edit-service-request/:id",
        element: (
          <ProtectedRoute>
            <EditServiceRequestPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "my-order-details/:id",
        element: (
          <ProtectedRoute>
            <MyOrderDetailsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "offer-details/:requestId/:offerId",
        element: (
          <ProtectedRoute>
            <OfferDetailsPage />
          </ProtectedRoute>
        ),
      },

      // Maintenance - Engineer
      {
        path: "customers-orders",
        element: (
          <ProtectedRoute>
            <CustomersOrdersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "maintenance-details/:id",
        element: (
          <ProtectedRoute>
            <MaintenanceDetailsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "make-offer",
        element: (
          <ProtectedRoute>
            <MakeOfferPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "edit-offer/:id",
        element: (
          <ProtectedRoute>
            <EditOfferPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "view-offer/:id",
        element: (
          <ProtectedRoute>
            <EditOfferPage />
          </ProtectedRoute>
        ),
      },

      // Engineer profile
      {
        path: "engineer-profile",
        element: (
          <LazyRoute>
            <EngineerProfilePage />
          </LazyRoute>
        ),
      },
      {
        path: "my-engineer-profile",
        element: (
          <ProtectedRoute>
            <EngineerProfilePage />
          </ProtectedRoute>
        ),
      },

      // Chat
      {
        path: "chat",
        element: (
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "chat/:ticketId",
        element: (
          <ProtectedRoute>
            <ChatDetailPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
