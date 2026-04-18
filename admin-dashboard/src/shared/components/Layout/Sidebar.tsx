import React, { useEffect, useRef } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Collapse,
  Badge,
} from '@mui/material';
import logoImage from '../../../assets/images/logo.png';
import {
  Dashboard,
  People,
  Inventory,
  Inventory2,
  Category,
  Tune,
  LocalOffer,
  ShoppingCart,
  Receipt,
  Settings,
  ExpandLess,
  ExpandMore,
  Storefront,
  Campaign,
  PhotoLibrary,
  Support,
  Analytics,
  Build,
  Notifications,
  Assessment,
  GetApp,
  Description,
  ViewModule,
  Security,
  Monitor,
  BugReport,
  AdminPanelSettings,
  Favorite,
  LocationOn,
  Search as SearchIcon,
  Policy,
  DeleteForever,
  VerifiedUser,
  Info,
  Sync,
  AddCircleOutline,
  Backup as BackupIcon,
  OnlinePrediction,
  SmartToy,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { filterMenuByPermissions } from '@/shared/constants/permissions';
import { useUnreadSupportCount } from '@/features/support/hooks/useSupport';
import { usePendingOrdersCount } from '@/features/orders/hooks/useOrders';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  badge?: number;
}

interface SidebarProps {
  width: number;
  open: boolean;
  onClose: () => void;
  variant: 'permanent' | 'temporary';
}

export const Sidebar: React.FC<SidebarProps> = ({ width, open, onClose, variant }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const activeItemRef = useRef<HTMLDivElement | null>(null);
  const { data: unreadSupport } = useUnreadSupportCount(60000);
  const unreadSupportCount = unreadSupport?.unreadTicketsCount ?? 0;
  const { data: pendingOrders } = usePendingOrdersCount(60000);
  const pendingOrdersCount = pendingOrders?.pendingCount ?? 0;

  const menuItems: MenuItem[] = React.useMemo(
    () => [
      {
        id: 'dashboard',
        label: t('navigation.dashboard'),
        icon: <Dashboard />,
        path: '/dashboard',
      },
      {
        id: 'users',
        label: t('navigation.users'),
        icon: <People />,
        children: [
          {
            id: 'users-list',
            label: t('navigation.usersList', 'ظ‚ط§ط¦ظ…ط© ط§ظ„ظ…ط³طھط®ط¯ظ…ظٹظ†'),
            icon: <People />,
            path: '/users',
          },
          {
            id: 'users-analytics',
            label: t('navigation.usersAnalytics', 'طھط­ظ„ظٹظ„ط§طھ ط§ظ„ظ…ط³طھط®ط¯ظ…ظٹظ†'),
            icon: <Assessment />,
            path: '/users/analytics',
          },
          {
            id: 'users-deleted',
            label: t('navigation.usersDeleted', 'ط§ظ„ط­ط³ط§ط¨ط§طھ ط§ظ„ظ…ط­ط°ظˆظپط©'),
            icon: <DeleteForever />,
            path: '/users/deleted',
          },
          {
            id: 'users-verification',
            label: t('navigation.verificationRequests', 'ط·ظ„ط¨ط§طھ ط§ظ„طھط­ظ‚ظ‚'),
            icon: <VerifiedUser />,
            path: '/users/verification-requests',
          },
          {
            id: 'users-activity',
            label: t('navigation.usersActivity', 'طھطھط¨ط¹ ط§ظ„ظ†ط´ط§ط·'),
            icon: <OnlinePrediction />,
            path: '/users/activity',
          },
          {
            id: 'users-addresses',
            label: t('navigation.addresses', 'ط§ظ„ط¹ظ†ط§ظˆظٹظ†'),
            icon: <LocationOn />,
            path: '/admin/addresses',
          },
          {
            id: 'users-favorites',
            label: t('navigation.favorites', 'ط§ظ„ظ…ظپط¶ظ„ط©'),
            icon: <Favorite />,
            path: '/admin/favorites',
          },
        ],
      },
      {
        id: 'catalog',
        label: t('navigation.catalog'),
        icon: <Inventory />,
        children: [
          {
            id: 'products',
            label: t('navigation.products'),
            icon: <Inventory />,
            children: [
              {
                id: 'products-list',
                label: t('navigation.productsList', 'ظ‚ط§ط¦ظ…ط© ط§ظ„ظ…ظ†طھط¬ط§طھ'),
                icon: <Inventory />,
                path: '/products',
              },
              {
                id: 'products-analytics',
                label: t('navigation.productsAnalytics', 'طھط­ظ„ظٹظ„ط§طھ ط§ظ„ظ…ظ†طھط¬ط§طھ'),
                icon: <Assessment />,
                path: '/products/analytics',
              },
              {
                id: 'products-inventory',
                label: t('navigation.productsInventory', 'ط¥ط¯ط§ط±ط© ط§ظ„ظ…ط®ط²ظˆظ†'),
                icon: <ViewModule />,
                path: '/products/inventory',
              },
              {
                id: 'products-integration',
                label: t('navigation.productsIntegration', 'ط±ط¨ط· ط§ظ„ظ…ط®ط²ظˆظ†'),
                icon: <Sync />,
                path: '/products/integration',
              },
              {
                id: 'products-unlinked',
                label: t('navigation.productsUnlinked', 'ظپط±طµ ط§ظ„ط¥ط¶ط§ظپط©'),
                icon: <AddCircleOutline />,
                path: '/products/unlinked',
              },
              {
                id: 'products-linked',
                label: t('navigation.productsLinked', 'ط§ظ„ظ…ط±ط¨ظˆط·ط©'),
                icon: <Sync />,
                path: '/products/linked',
              },
            ],
          },
          {
            id: 'categories',
            label: t('navigation.categories'),
            icon: <Category />,
            path: '/categories',
          },
          {
            id: 'attributes',
            label: t('navigation.attributes'),
            icon: <Tune />,
            path: '/attributes',
          },
          {
            id: 'brands',
            label: t('navigation.brands'),
            icon: <Storefront />,
            path: '/brands',
          },
        ],
      },
      {
        id: 'sales',
        label: t('navigation.sales'),
        icon: <ShoppingCart />,
        children: [
          {
            id: 'orders',
            label: t('navigation.orders'),
            icon: <Receipt />,
            children: [
              {
                id: 'orders-list',
                label: t('navigation.ordersList', 'ظ‚ط§ط¦ظ…ط© ط§ظ„ط·ظ„ط¨ط§طھ'),
                icon: <Receipt />,
                path: '/orders',
              },
              {
                id: 'orders-out-of-stock',
                label: t('navigation.ordersOutOfStock', 'ط§ظ„ط·ظ„ط¨ط§طھ ط؛ظٹط± ط§ظ„ظ…طھظˆظپط±ط©'),
                icon: <Inventory2 />,
                path: '/orders/out-of-stock',
              },
              {
                id: 'orders-analytics',
                label: t('navigation.ordersAnalytics', 'طھط­ظ„ظٹظ„ط§طھ ط§ظ„ط·ظ„ط¨ط§طھ'),
                icon: <Assessment />,
                path: '/orders/analytics',
              },
            ],
          },
          {
            id: 'carts',
            label: t('navigation.cartsManagement', 'ط¥ط¯ط§ط±ط© ط§ظ„ط³ظ„ط§ظ„'),
            icon: <ShoppingCart />,
            children: [
              {
                id: 'carts-list',
                label: t('navigation.cartsList', 'ظ‚ط§ط¦ظ…ط© ط§ظ„ط³ظ„ط§ظ„'),
                icon: <ShoppingCart />,
                path: '/carts',
              },
              {
                id: 'carts-analytics',
                label: t('navigation.cartsAnalytics', 'طھط­ظ„ظٹظ„ط§طھ ط§ظ„ط³ظ„ط©'),
                icon: <Assessment />,
                path: '/carts/analytics',
              },
            ],
          },
        ],
      },
      {
        id: 'marketing',
        label: t('navigation.marketing', 'ط§ظ„طھط³ظˆظٹظ‚'),
        icon: <Campaign />,
        children: [
          {
            id: 'marketing-dashboard',
            label: t('navigation.marketingDashboard', 'ظ„ظˆط­ط© ط§ظ„طھط³ظˆظٹظ‚'),
            icon: <Dashboard />,
            path: '/marketing',
          },
          {
            id: 'price-rules',
            label: t('navigation.priceRules', 'ظ‚ظˆط§ط¹ط¯ ط§ظ„ط£ط³ط¹ط§ط±'),
            icon: <LocalOffer />,
            path: '/marketing/price-rules',
          },
          {
            id: 'banners',
            label: t('navigation.banners', 'ط§ظ„ط¨ظ†ط±ط§طھ'),
            icon: <Campaign />,
            path: '/banners',
          },
          {
            id: 'coupons',
            label: t('navigation.coupons', 'ط§ظ„ظƒظˆط¨ظˆظ†ط§طھ'),
            icon: <LocalOffer />,
            children: [
              {
                id: 'coupons-list',
                label: t('navigation.couponsList', 'ظ‚ط§ط¦ظ…ط© ط§ظ„ظƒظˆط¨ظˆظ†ط§طھ'),
                icon: <LocalOffer />,
                path: '/coupons',
              },
              {
                id: 'coupons-analytics',
                label: t('navigation.couponsAnalytics', 'طھط­ظ„ظٹظ„ط§طھ ط§ظ„ظƒظˆط¨ظˆظ†ط§طھ'),
                icon: <Assessment />,
                path: '/coupons/analytics',
              },
            ],
          },
        ],
      },
      {
        id: 'services',
        label: t('navigation.services', 'ط§ظ„ط®ط¯ظ…ط§طھ'),
        icon: <Build />,
        children: [
          {
            id: 'services-overview',
            label: t('navigation.servicesOverview', 'ظ†ط¸ط±ط© ط¹ط§ظ…ط©'),
            icon: <Dashboard />,
            path: '/services',
          },
          {
            id: 'services-requests',
            label: t('navigation.servicesRequests', 'ط·ظ„ط¨ط§طھ ط§ظ„ط®ط¯ظ…ط§طھ'),
            icon: <Build />,
            path: '/services/requests',
          },
          {
            id: 'services-offers',
            label: t('navigation.servicesOffers', 'ط¥ط¯ط§ط±ط© ط§ظ„ط¹ط±ظˆط¶'),
            icon: <LocalOffer />,
            path: '/services/offers',
          },
          {
            id: 'services-analytics',
            label: t('navigation.servicesAnalytics', 'طھط­ظ„ظٹظ„ط§طھ ط§ظ„ط®ط¯ظ…ط§طھ'),
            icon: <Analytics />,
            path: '/services/analytics',
          },
        ],
      },
      {
        id: 'engineers',
        label: t('navigation.engineers', 'ط§ظ„ظ…ظ‡ظ†ط¯ط³ظٹظ†'),
        icon: <People />,
        children: [
          {
            id: 'engineers-management',
            label: t('navigation.servicesEngineers', 'ط¥ط¯ط§ط±ط© ط§ظ„ظ…ظ‡ظ†ط¯ط³ظٹظ†'),
            icon: <People />,
            path: '/services/engineers',
          },
          {
            id: 'engineers-coupons',
            label: t('navigation.engineerCoupons', 'ظƒظˆط¨ظˆظ†ط§طھ ط§ظ„ظ…ظ‡ظ†ط¯ط³ظٹظ†'),
            icon: <LocalOffer />,
            path: '/services/engineers/coupons',
          },
          {
            id: 'engineers-commissions',
            label: t('navigation.engineersCommissions', 'طھظ‚ط±ظٹط± ط¹ظ…ظˆظ„ط§طھ ط§ظ„ظ…ظ‡ظ†ط¯ط³ظٹظ†'),
            icon: <Receipt />,
            path: '/commissions/reports',
          },
        ],
      },
      {
        id: 'media',
        label: t('navigation.media', 'ظ…ظƒطھط¨ط© ط§ظ„ظˆط³ط§ط¦ط·'),
        icon: <PhotoLibrary />,
        children: [
          {
            id: 'media-library',
            label: t('navigation.mediaLibrary', 'ظ…ظƒطھط¨ط© ط§ظ„ظˆط³ط§ط¦ط·'),
            icon: <PhotoLibrary />,
            path: '/media',
          },
          {
            id: 'media-analytics',
            label: t('navigation.mediaAnalytics', 'ط¥ط­طµط§ط¦ظٹط§طھ ط§ظ„ظˆط³ط§ط¦ط·'),
            icon: <Assessment />,
            path: '/media/analytics',
          },
        ],
      },
      {
        id: 'analytics',
        label: t('navigation.analytics', 'ط§ظ„ط¥ط­طµط§ط¦ظٹط§طھ'),
        icon: <Analytics />,
        children: [
          {
            id: 'analytics-dashboard',
            label: t('navigation.analyticsDashboard', 'ظ„ظˆط­ط© ط§ظ„ط¥ط­طµط§ط¦ظٹط§طھ'),
            icon: <Analytics />,
            path: '/analytics',
          },
          {
            id: 'analytics-main',
            label: t('navigation.analyticsMain', 'ظ†ط¸ط§ظ… ط§ظ„طھط­ظ„ظٹظ„ط§طھ ط§ظ„ط´ط§ظ…ظ„'),
            icon: <Dashboard />,
            path: '/analytics/main',
          },
          {
            id: 'analytics-advanced',
            label: t('navigation.analyticsAdvanced', 'ط¥ط­طµط§ط¦ظٹط§طھ ظ…طھظ‚ط¯ظ…ط©'),
            icon: <Assessment />,
            path: '/analytics/advanced',
          },
          {
            id: 'analytics-export',
            label: t('navigation.analyticsExport', 'طھطµط¯ظٹط± ط§ظ„ط¨ظٹط§ظ†ط§طھ'),
            icon: <GetApp />,
            path: '/analytics/export',
          },
          {
            id: 'analytics-reports',
            label: t('navigation.analyticsReports', 'ط¥ط¯ط§ط±ط© ط§ظ„طھظ‚ط§ط±ظٹط±'),
            icon: <Description />,
            path: '/analytics/reports',
          },
        ],
      },
      {
        id: 'audit',
        label: t('navigation.audit', 'ط§ظ„ط³ط¬ظ„ط§طھ ظˆط§ظ„طھط¯ظ‚ظٹظ‚'),
        icon: <Security />,
        children: [
          {
            id: 'audit-logs',
            label: t('navigation.auditLogs', 'ط³ط¬ظ„ط§طھ ط§ظ„طھط¯ظ‚ظٹظ‚'),
            icon: <Security />,
            path: '/audit',
          },
          {
            id: 'audit-main',
            label: t('navigation.auditMain', 'ظ†ط¸ط§ظ… ط§ظ„طھط¯ظ‚ظٹظ‚ ط§ظ„ط´ط§ظ…ظ„'),
            icon: <Dashboard />,
            path: '/audit/main',
          },
          {
            id: 'audit-analytics',
            label: t('navigation.auditAnalytics', 'طھط­ظ„ظٹظ„ط§طھ ط§ظ„طھط¯ظ‚ظٹظ‚'),
            icon: <Assessment />,
            path: '/audit/analytics',
          },
        ],
      },
      {
        id: 'support',
        label: t('navigation.support', 'ط§ظ„ط¯ط¹ظ… ط§ظ„ظپظ†ظٹ'),
        icon: <Support />,
        children: [
          {
            id: 'support-tickets',
            label: t('navigation.supportTickets', 'ظ‚ط§ط¦ظ…ط© ط§ظ„طھط°ط§ظƒط±'),
            icon: <Support />,
            path: '/support',
          },
          {
            id: 'support-stats',
            label: t('navigation.supportStats', 'ط¥ط­طµط§ط¦ظٹط§طھ ط§ظ„ط¯ط¹ظ…'),
            icon: <Assessment />,
            path: '/support/stats',
          },
          {
            id: 'support-canned-responses',
            label: t('navigation.supportCannedResponses', 'ط§ظ„ط±ط¯ظˆط¯ ط§ظ„ط¬ط§ظ‡ط²ط©'),
            icon: <ViewModule />,
            path: '/support/canned-responses',
          },
          {
            id: 'support-tejo-prompts',
            label: t('navigation.tejoPrompts', 'Tejo Prompts'),
            icon: <SmartToy />,
            path: '/support/tejo/prompts',
          },
          {
            id: 'support-tejo-analytics',
            label: t('navigation.tejoAnalytics', 'Tejo Analytics'),
            icon: <Assessment />,
            path: '/support/tejo/analytics',
          },
          {
            id: 'support-tejo-conversations',
            label: t('navigation.tejoConversations', 'Tejo Conversations'),
            icon: <Support />,
            path: '/support/tejo/conversations',
          },
          {
            id: 'support-tejo-settings',
            label: t('navigation.tejoSettings', 'Tejo Settings'),
            icon: <Settings />,
            path: '/support/tejo/settings',
          },
          {
            id: 'support-tejo-knowledge',
            label: t('navigation.tejoKnowledge', 'Tejo Knowledge'),
            icon: <SmartToy />,
            path: '/support/tejo/knowledge',
          },
        ],
      },
      {
        id: 'notifications',
        label: t('navigation.notifications', 'ط§ظ„ط¥ط´ط¹ط§ط±ط§طھ'),
        icon: <Notifications />,
        children: [
          {
            id: 'notifications-list',
            label: t('navigation.notificationsList', 'ظ‚ط§ط¦ظ…ط© ط§ظ„ط¥ط´ط¹ط§ط±ط§طھ'),
            icon: <Notifications />,
            path: '/notifications',
          },
          {
            id: 'notifications-analytics',
            label: t('navigation.notificationsAnalytics', 'ط¥ط­طµط§ط¦ظٹط§طھ ط§ظ„ط¥ط´ط¹ط§ط±ط§طھ'),
            icon: <Assessment />,
            path: '/notifications/analytics',
          },
          {
            id: 'notifications-templates',
            label: t('navigation.notificationsTemplates', 'ظ‚ظˆط§ظ„ط¨ ط§ظ„ط¥ط´ط¹ط§ط±ط§طھ'),
            icon: <ViewModule />,
            path: '/notifications/templates',
          },
          {
            id: 'notifications-channel-configs',
            label: t('navigation.notificationsChannelConfigs', 'ط¥ط¹ط¯ط§ط¯ط§طھ ط§ظ„ظ‚ظ†ظˆط§طھ'),
            icon: <Settings />,
            path: '/notifications/channel-configs',
          },
        ],
      },
      {
        id: 'system-management',
        label: t('navigation.systemManagement', 'ط¥ط¯ط§ط±ط© ط§ظ„ظ†ط¸ط§ظ…'),
        icon: <AdminPanelSettings />,
        children: [
          {
            id: 'system-monitoring',
            label: t('navigation.systemMonitoring', 'ظ…ط±ط§ظ‚ط¨ط© ط§ظ„ط£ط¯ط§ط،'),
            icon: <Monitor />,
            path: '/system/monitoring',
          },
          {
            id: 'error-logs',
            label: t('navigation.errorLogs', 'ط³ط¬ظ„ط§طھ ط§ظ„ط£ط®ط·ط§ط،'),
            icon: <BugReport />,
            path: '/system/error-logs',
          },

          {
            id: 'system-settings',
            label: t('navigation.systemSettings', 'ط¥ط¹ط¯ط§ط¯ط§طھ ط§ظ„ظ†ط¸ط§ظ…'),
            icon: <Settings />,
            path: '/system/settings',
          },
          {
            id: 'backups',
            label: t('navigation.backups', 'ط§ظ„ظ†ط³ط® ط§ظ„ط§ط­طھظٹط§ط·ظٹ'),
            icon: <BackupIcon />,
            path: '/system/backups',
          },
          {
            id: 'policies',
            label: t('navigation.policies', 'ط§ظ„ط³ظٹط§ط³ط§طھ'),
            icon: <Policy />,
            path: '/policies',
          },
          {
            id: 'about',
            label: t('navigation.about', 'ظ…ظ† ظ†ط­ظ†'),
            icon: <Info />,
            path: '/about',
          },
        ],
      },
      {
        id: 'exchange-rates',
        label: t('navigation.exchangeRates', 'ط£ط³ط¹ط§ط± ط§ظ„طµط±ظپ'),
        icon: <Assessment />,
        path: '/exchange-rates',
      },
      {
        id: 'admin-management',
        label: t('navigation.adminManagement'),
        icon: <AdminPanelSettings />,
        children: [
          {
            id: 'admin-search',
            label: t('navigation.search'),
            icon: <SearchIcon />,
            path: '/admin/search',
          },
          {
            id: 'marketer-portal',
            label: t('navigation.marketerPortal', 'ط¨ظˆط§ط¨ط© ط§ظ„ظ…ط³ظˆظ‚'),
            icon: <AddCircleOutline />,
            path: '/marketer/portal',
          },
          {
            id: 'admin-marketers',
            label: t('navigation.marketersManagement', 'ط¥ط¯ط§ط±ط© ط§ظ„ظ…ط³ظˆظ‚ظٹظ†'),
            icon: <Campaign />,
            path: '/admin/marketers',
          },
        ],
      },
    ],
    [t, i18n.language]
  );

  // Add badges to menu items
  const menuItemsWithBadges = React.useMemo(() => {
    const addBadges = (items: MenuItem[]): MenuItem[] => {
      return items.map((item) => {
        const newItem = { ...item };

        // Add badge to sales/orders menu
        if (item.id === 'sales' && pendingOrdersCount > 0) {
          newItem.badge = pendingOrdersCount;
        }

        // Add badge to support menu
        if (item.id === 'support' && unreadSupportCount > 0) {
          newItem.badge = unreadSupportCount;
        }

        // Recursively process children
        if (item.children) {
          newItem.children = addBadges(item.children);
        }

        return newItem;
      });
    };

    return addBadges(menuItems);
  }, [menuItems, pendingOrdersCount, unreadSupportCount]);

  // Filter menu items based on user permissions
  const userPermissions = user?.permissions || [];
  const filteredMenuItems = React.useMemo(() => {
    return filterMenuByPermissions(menuItemsWithBadges, userPermissions);
  }, [menuItemsWithBadges, userPermissions]);

  // Find and expand parent items for the current path
  useEffect(() => {
    const findActiveParents = (items: MenuItem[], path: string): string[] => {
      const parents: string[] = [];

      const traverse = (items: MenuItem[], currentPath: string[] = []): boolean => {
        for (const item of items) {
          if (item.path && path.startsWith(item.path)) {
            parents.push(...currentPath);
            return true;
          }
          if (item.children) {
            if (traverse(item.children, [...currentPath, item.id])) {
              parents.push(...currentPath);
              return true;
            }
          }
        }
        return false;
      };

      traverse(items);
      return parents;
    };

    const activeParents = findActiveParents(filteredMenuItems, location.pathname);
    if (activeParents.length > 0) {
      setExpandedItems((prev) => {
        const newExpanded = [...new Set([...prev, ...activeParents])];
        return newExpanded;
      });
    }
  }, [location.pathname, filteredMenuItems]);

  // Focus active item when sidebar opens
  useEffect(() => {
    if (open && activeItemRef.current) {
      // Small delay to ensure the item is rendered
      setTimeout(() => {
        if (activeItemRef.current) {
          activeItemRef.current.focus();
          activeItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 150);
    }
  }, [open, location.pathname]);

  // Toggle expand
  const handleToggleExpand = (id: string) => {
    setExpandedItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  // Navigate
  const handleNavigate = (path: string) => {
    navigate(path);
    if (variant === 'temporary') {
      onClose();
    }
  };

  // Render menu item
  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const isActive = Boolean(item.path && location.pathname.startsWith(item.path));

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding>
          <ListItemButton
            ref={isActive ? activeItemRef : null}
            selected={isActive}
            onClick={() => {
              if (hasChildren) {
                handleToggleExpand(item.id);
              } else if (item.path) {
                handleNavigate(item.path);
              }
            }}
            sx={{
              pl: 2 + depth * 2,
              borderRadius: 1,
              mx: 1,
              my: 0.5,
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                '& .MuiListItemIcon-root': {
                  color: 'primary.contrastText',
                },
              },
              '&:focus': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: 2,
              },
            }}
          >
            {item.icon && (
              <ListItemIcon>
                {item.badge && item.badge > 0 ? (
                  <Badge badgeContent={item.badge} color="error" max={99}>
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
            )}
            <ListItemText
              primary={
                item.id === 'support' && unreadSupportCount > 0 ? (
                  <Badge badgeContent={unreadSupportCount} color="error" max={99}>
                    <span>{item.label}</span>
                  </Badge>
                ) : (
                  item.label
                )
              }
            />
            {hasChildren && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </ListItem>

        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map((child) => renderMenuItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Title */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Box
          component="img"
          src={logoImage}
          alt="Tagadodo Logo"
          sx={{
            height: 60,
            width: 'auto',
            maxWidth: '100%',
            objectFit: 'contain',
            mb: 1,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
          }}
        />
        <Typography variant="h6" fontWeight="bold">
          {t('app.name')}
        </Typography>
      </Box>

      <Divider />

      {/* Menu Items */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 1 }}>
        <List>{filteredMenuItems.map((item) => renderMenuItem(item))}</List>
      </Box>

      <Divider />

      {/* Footer */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          آ© 2025 Tagadod
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: width,
          boxSizing: 'border-box',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

