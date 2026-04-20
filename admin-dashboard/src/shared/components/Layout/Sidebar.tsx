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
  MenuBook,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { PERMISSIONS, filterMenuByPermissions } from '@/shared/constants/permissions';
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

const AR_NAV_LABELS: Record<string, string> = {
  'navigation.about': 'من نحن',
  'navigation.addresses': 'العناوين',
  'navigation.adminManagement': 'إدارة المشرفين',
  'navigation.analytics': 'الإحصائيات',
  'navigation.analyticsAdvanced': 'إحصائيات متقدمة',
  'navigation.analyticsDashboard': 'لوحة الإحصائيات',
  'navigation.analyticsExport': 'تصدير البيانات',
  'navigation.analyticsMain': 'نظام التحليلات الشامل',
  'navigation.analyticsReports': 'إدارة التقارير',
  'navigation.attributes': 'السمات',
  'navigation.audit': 'السجلات والتدقيق',
  'navigation.auditAnalytics': 'تحليلات التدقيق',
  'navigation.auditLogs': 'سجلات التدقيق',
  'navigation.auditMain': 'نظام التدقيق الشامل',
  'navigation.backups': 'النسخ الاحتياطي',
  'navigation.banners': 'البنرات',
  'navigation.brands': 'العلامات التجارية',
  'navigation.cartsAnalytics': 'تحليلات السلة',
  'navigation.cartsList': 'قائمة السلال',
  'navigation.cartsManagement': 'إدارة السلال',
  'navigation.catalog': 'الكتالوج',
  'navigation.categories': 'الفئات',
  'navigation.coupons': 'الكوبونات',
  'navigation.couponsAnalytics': 'تحليلات الكوبونات',
  'navigation.couponsList': 'قائمة الكوبونات',
  'navigation.dashboard': 'لوحة التحكم',
  'navigation.engineerCoupons': 'كوبونات المهندسين',
  'navigation.engineers': 'المهندسين',
  'navigation.engineersCommissions': 'تقرير عمولات المهندسين',
  'navigation.errorLogs': 'سجلات الأخطاء',
  'navigation.exchangeRates': 'أسعار الصرف',
  'navigation.favorites': 'المفضلة',
  'navigation.installationGuides': 'طرق التركيب',
  'navigation.marketerPortal': 'بوابة المسوّق',
  'navigation.marketersManagement': 'إدارة المسوّقين',
  'navigation.marketersSurveyStats': 'إحصائيات استبيان التجار',
  'navigation.marketing': 'التسويق',
  'navigation.marketingDashboard': 'لوحة التسويق',
  'navigation.media': 'مكتبة الوسائط',
  'navigation.mediaAnalytics': 'إحصائيات الوسائط',
  'navigation.mediaLibrary': 'مكتبة الوسائط',
  'navigation.notifications': 'الإشعارات',
  'navigation.notificationsAnalytics': 'إحصائيات الإشعارات',
  'navigation.notificationsChannelConfigs': 'إعدادات القنوات',
  'navigation.notificationsList': 'قائمة الإشعارات',
  'navigation.notificationsTemplates': 'قوالب الإشعارات',
  'navigation.orders': 'الطلبات',
  'navigation.ordersAnalytics': 'تحليلات الطلبات',
  'navigation.ordersList': 'قائمة الطلبات',
  'navigation.ordersOutOfStock': 'الطلبات غير المتوفرة',
  'navigation.policies': 'السياسات',
  'navigation.priceRules': 'قواعد الأسعار',
  'navigation.products': 'المنتجات',
  'navigation.productsAnalytics': 'تحليلات المنتجات',
  'navigation.productsIntegration': 'ربط المخزون',
  'navigation.productsInventory': 'إدارة المخزون',
  'navigation.productsLinked': 'المنتجات المربوطة',
  'navigation.productsList': 'قائمة المنتجات',
  'navigation.productsUnlinked': 'فرص الإضافة',
  'navigation.sales': 'المبيعات',
  'navigation.search': 'البحث',
  'navigation.services': 'الخدمات',
  'navigation.servicesAnalytics': 'تحليلات الخدمات',
  'navigation.servicesEngineers': 'إدارة المهندسين',
  'navigation.servicesOffers': 'إدارة العروض',
  'navigation.servicesOverview': 'نظرة عامة',
  'navigation.servicesRequests': 'طلبات الخدمات',
  'navigation.support': 'الدعم الفني',
  'navigation.supportCannedResponses': 'الردود الجاهزة',
  'navigation.supportStats': 'إحصائيات الدعم',
  'navigation.supportTickets': 'قائمة التذاكر',
  'navigation.systemManagement': 'إدارة النظام',
  'navigation.systemMonitoring': 'مراقبة الأداء',
  'navigation.systemSettings': 'إعدادات النظام',
  'navigation.tejoAnalytics': 'تحليلات Tejo',
  'navigation.tejoConversations': 'محادثات Tejo',
  'navigation.tejoKnowledge': 'معرفة Tejo',
  'navigation.tejoPrompts': 'موجّهات Tejo',
  'navigation.tejoSettings': 'إعدادات Tejo',
  'navigation.users': 'المستخدمون',
  'navigation.usersActivity': 'تتبع النشاط',
  'navigation.usersAnalytics': 'تحليلات المستخدمين',
  'navigation.usersDeleted': 'الحسابات المحذوفة',
  'navigation.usersList': 'قائمة المستخدمين',
  'navigation.verificationRequests': 'طلبات التحقق',
};

export const Sidebar: React.FC<SidebarProps> = ({ width, open, onClose, variant }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const isArabicLocale = i18n.language.toLowerCase().startsWith('ar');
  const navLabel = React.useCallback(
    (key: string) => {
      if (isArabicLocale && AR_NAV_LABELS[key]) {
        return AR_NAV_LABELS[key];
      }
      return t(key);
    },
    [isArabicLocale, t]
  );
  const appName = isArabicLocale ? 'لوحة تحكم تجدد' : t('app.name');
  const activeItemRef = useRef<HTMLDivElement | null>(null);
  const { data: unreadSupport } = useUnreadSupportCount(60000);
  const unreadSupportCount = unreadSupport?.unreadTicketsCount ?? 0;
  const { data: pendingOrders } = usePendingOrdersCount(60000);
  const pendingOrdersCount = pendingOrders?.pendingCount ?? 0;

  const menuItems: MenuItem[] = React.useMemo(
    () => [
      {
        id: 'dashboard',
        label: navLabel('navigation.dashboard'),
        icon: <Dashboard />,
        path: '/dashboard',
      },
      {
        id: 'users',
        label: navLabel('navigation.users'),
        icon: <People />,
        children: [
          {
            id: 'users-list',
            label: navLabel('navigation.usersList'),
            icon: <People />,
            path: '/users',
          },
          {
            id: 'users-analytics',
            label: navLabel('navigation.usersAnalytics'),
            icon: <Assessment />,
            path: '/users/analytics',
          },
          {
            id: 'users-deleted',
            label: navLabel('navigation.usersDeleted'),
            icon: <DeleteForever />,
            path: '/users/deleted',
          },
          {
            id: 'users-verification',
            label: navLabel('navigation.verificationRequests'),
            icon: <VerifiedUser />,
            path: '/users/verification-requests',
          },
          {
            id: 'users-activity',
            label: navLabel('navigation.usersActivity'),
            icon: <OnlinePrediction />,
            path: '/users/activity',
          },
          {
            id: 'users-addresses',
            label: navLabel('navigation.addresses'),
            icon: <LocationOn />,
            path: '/admin/addresses',
          },
          {
            id: 'users-favorites',
            label: navLabel('navigation.favorites'),
            icon: <Favorite />,
            path: '/admin/favorites',
          },
        ],
      },
      {
        id: 'catalog',
        label: navLabel('navigation.catalog'),
        icon: <Inventory />,
        children: [
          {
            id: 'products',
            label: navLabel('navigation.products'),
            icon: <Inventory />,
            children: [
              {
                id: 'products-list',
                label: navLabel('navigation.productsList'),
                icon: <Inventory />,
                path: '/products',
              },
              {
                id: 'products-analytics',
                label: navLabel('navigation.productsAnalytics'),
                icon: <Assessment />,
                path: '/products/analytics',
              },
              {
                id: 'products-inventory',
                label: navLabel('navigation.productsInventory'),
                icon: <ViewModule />,
                path: '/products/inventory',
              },
              {
                id: 'products-integration',
                label: navLabel('navigation.productsIntegration'),
                icon: <Sync />,
                path: '/products/integration',
              },
              {
                id: 'products-unlinked',
                label: navLabel('navigation.productsUnlinked'),
                icon: <AddCircleOutline />,
                path: '/products/unlinked',
              },
              {
                id: 'products-linked',
                label: navLabel('navigation.productsLinked'),
                icon: <Sync />,
                path: '/products/linked',
              },
            ],
          },
          {
            id: 'categories',
            label: navLabel('navigation.categories'),
            icon: <Category />,
            path: '/categories',
          },
          {
            id: 'attributes',
            label: navLabel('navigation.attributes'),
            icon: <Tune />,
            path: '/attributes',
          },
          {
            id: 'brands',
            label: navLabel('navigation.brands'),
            icon: <Storefront />,
            path: '/brands',
          },
        ],
      },
      {
        id: 'sales',
        label: navLabel('navigation.sales'),
        icon: <ShoppingCart />,
        children: [
          {
            id: 'orders',
            label: navLabel('navigation.orders'),
            icon: <Receipt />,
            children: [
              {
                id: 'orders-list',
                label: navLabel('navigation.ordersList'),
                icon: <Receipt />,
                path: '/orders',
              },
              {
                id: 'orders-out-of-stock',
                label: navLabel('navigation.ordersOutOfStock'),
                icon: <Inventory2 />,
                path: '/orders/out-of-stock',
              },
              {
                id: 'orders-analytics',
                label: navLabel('navigation.ordersAnalytics'),
                icon: <Assessment />,
                path: '/orders/analytics',
              },
            ],
          },
          {
            id: 'carts',
            label: navLabel('navigation.cartsManagement'),
            icon: <ShoppingCart />,
            children: [
              {
                id: 'carts-list',
                label: navLabel('navigation.cartsList'),
                icon: <ShoppingCart />,
                path: '/carts',
              },
              {
                id: 'carts-analytics',
                label: navLabel('navigation.cartsAnalytics'),
                icon: <Assessment />,
                path: '/carts/analytics',
              },
            ],
          },
        ],
      },
      {
        id: 'marketing',
        label: navLabel('navigation.marketing'),
        icon: <Campaign />,
        children: [
          {
            id: 'marketing-dashboard',
            label: navLabel('navigation.marketingDashboard'),
            icon: <Dashboard />,
            path: '/marketing',
          },
          {
            id: 'price-rules',
            label: navLabel('navigation.priceRules'),
            icon: <LocalOffer />,
            path: '/marketing/price-rules',
          },
          {
            id: 'banners',
            label: navLabel('navigation.banners'),
            icon: <Campaign />,
            path: '/banners',
          },
          {
            id: 'installation-guides',
            label: navLabel('navigation.installationGuides'),
            icon: <MenuBook />,
            path: '/marketing/installation-guides',
          },
          {
            id: 'coupons',
            label: navLabel('navigation.coupons'),
            icon: <LocalOffer />,
            children: [
              {
                id: 'coupons-list',
                label: navLabel('navigation.couponsList'),
                icon: <LocalOffer />,
                path: '/coupons',
              },
              {
                id: 'coupons-analytics',
                label: navLabel('navigation.couponsAnalytics'),
                icon: <Assessment />,
                path: '/coupons/analytics',
              },
            ],
          },
        ],
      },
      {
        id: 'services',
        label: navLabel('navigation.services'),
        icon: <Build />,
        children: [
          {
            id: 'services-overview',
            label: navLabel('navigation.servicesOverview'),
            icon: <Dashboard />,
            path: '/services',
          },
          {
            id: 'services-requests',
            label: navLabel('navigation.servicesRequests'),
            icon: <Build />,
            path: '/services/requests',
          },
          {
            id: 'services-offers',
            label: navLabel('navigation.servicesOffers'),
            icon: <LocalOffer />,
            path: '/services/offers',
          },
          {
            id: 'services-analytics',
            label: navLabel('navigation.servicesAnalytics'),
            icon: <Analytics />,
            path: '/services/analytics',
          },
        ],
      },
      {
        id: 'engineers',
        label: navLabel('navigation.engineers'),
        icon: <People />,
        children: [
          {
            id: 'engineers-management',
            label: navLabel('navigation.servicesEngineers'),
            icon: <People />,
            path: '/services/engineers',
          },
          {
            id: 'engineers-coupons',
            label: navLabel('navigation.engineerCoupons'),
            icon: <LocalOffer />,
            path: '/services/engineers/coupons',
          },
          {
            id: 'engineers-commissions',
            label: navLabel('navigation.engineersCommissions'),
            icon: <Receipt />,
            path: '/commissions/reports',
          },
        ],
      },
      {
        id: 'media',
        label: navLabel('navigation.media'),
        icon: <PhotoLibrary />,
        children: [
          {
            id: 'media-library',
            label: navLabel('navigation.mediaLibrary'),
            icon: <PhotoLibrary />,
            path: '/media',
          },
          {
            id: 'media-analytics',
            label: navLabel('navigation.mediaAnalytics'),
            icon: <Assessment />,
            path: '/media/analytics',
          },
        ],
      },
      {
        id: 'analytics',
        label: navLabel('navigation.analytics'),
        icon: <Analytics />,
        children: [
          {
            id: 'analytics-dashboard',
            label: navLabel('navigation.analyticsDashboard'),
            icon: <Analytics />,
            path: '/analytics',
          },
          {
            id: 'analytics-main',
            label: navLabel('navigation.analyticsMain'),
            icon: <Dashboard />,
            path: '/analytics/main',
          },
          {
            id: 'analytics-advanced',
            label: navLabel('navigation.analyticsAdvanced'),
            icon: <Assessment />,
            path: '/analytics/advanced',
          },
          {
            id: 'analytics-export',
            label: navLabel('navigation.analyticsExport'),
            icon: <GetApp />,
            path: '/analytics/export',
          },
          {
            id: 'analytics-reports',
            label: navLabel('navigation.analyticsReports'),
            icon: <Description />,
            path: '/analytics/reports',
          },
        ],
      },
      {
        id: 'audit',
        label: navLabel('navigation.audit'),
        icon: <Security />,
        children: [
          {
            id: 'audit-logs',
            label: navLabel('navigation.auditLogs'),
            icon: <Security />,
            path: '/audit',
          },
          {
            id: 'audit-main',
            label: navLabel('navigation.auditMain'),
            icon: <Dashboard />,
            path: '/audit/main',
          },
          {
            id: 'audit-analytics',
            label: navLabel('navigation.auditAnalytics'),
            icon: <Assessment />,
            path: '/audit/analytics',
          },
        ],
      },
      {
        id: 'support',
        label: navLabel('navigation.support'),
        icon: <Support />,
        children: [
          {
            id: 'support-tickets',
            label: navLabel('navigation.supportTickets'),
            icon: <Support />,
            path: '/support',
          },
          {
            id: 'support-stats',
            label: navLabel('navigation.supportStats'),
            icon: <Assessment />,
            path: '/support/stats',
          },
          {
            id: 'support-canned-responses',
            label: navLabel('navigation.supportCannedResponses'),
            icon: <ViewModule />,
            path: '/support/canned-responses',
          },
          {
            id: 'support-tejo-prompts',
            label: navLabel('navigation.tejoPrompts'),
            icon: <SmartToy />,
            path: '/support/tejo/prompts',
          },
          {
            id: 'support-tejo-analytics',
            label: navLabel('navigation.tejoAnalytics'),
            icon: <Assessment />,
            path: '/support/tejo/analytics',
          },
          {
            id: 'support-tejo-conversations',
            label: navLabel('navigation.tejoConversations'),
            icon: <Support />,
            path: '/support/tejo/conversations',
          },
          {
            id: 'support-tejo-settings',
            label: navLabel('navigation.tejoSettings'),
            icon: <Settings />,
            path: '/support/tejo/settings',
          },
          {
            id: 'support-tejo-knowledge',
            label: navLabel('navigation.tejoKnowledge'),
            icon: <SmartToy />,
            path: '/support/tejo/knowledge',
          },
        ],
      },
      {
        id: 'notifications',
        label: navLabel('navigation.notifications'),
        icon: <Notifications />,
        children: [
          {
            id: 'notifications-list',
            label: navLabel('navigation.notificationsList'),
            icon: <Notifications />,
            path: '/notifications',
          },
          {
            id: 'notifications-analytics',
            label: navLabel('navigation.notificationsAnalytics'),
            icon: <Assessment />,
            path: '/notifications/analytics',
          },
          {
            id: 'notifications-templates',
            label: navLabel('navigation.notificationsTemplates'),
            icon: <ViewModule />,
            path: '/notifications/templates',
          },
          {
            id: 'notifications-channel-configs',
            label: navLabel('navigation.notificationsChannelConfigs'),
            icon: <Settings />,
            path: '/notifications/channel-configs',
          },
        ],
      },
      {
        id: 'system-management',
        label: navLabel('navigation.systemManagement'),
        icon: <AdminPanelSettings />,
        children: [
          {
            id: 'system-monitoring',
            label: navLabel('navigation.systemMonitoring'),
            icon: <Monitor />,
            path: '/system/monitoring',
          },
          {
            id: 'error-logs',
            label: navLabel('navigation.errorLogs'),
            icon: <BugReport />,
            path: '/system/error-logs',
          },

          {
            id: 'system-settings',
            label: navLabel('navigation.systemSettings'),
            icon: <Settings />,
            path: '/system/settings',
          },
          {
            id: 'backups',
            label: navLabel('navigation.backups'),
            icon: <BackupIcon />,
            path: '/system/backups',
          },
          {
            id: 'policies',
            label: navLabel('navigation.policies'),
            icon: <Policy />,
            path: '/policies',
          },
          {
            id: 'about',
            label: navLabel('navigation.about'),
            icon: <Info />,
            path: '/about',
          },
        ],
      },
      {
        id: 'exchange-rates',
        label: navLabel('navigation.exchangeRates'),
        icon: <Assessment />,
        path: '/exchange-rates',
      },
      {
        id: 'admin-management',
        label: navLabel('navigation.adminManagement'),
        icon: <AdminPanelSettings />,
        children: [
          {
            id: 'admin-search',
            label: navLabel('navigation.search'),
            icon: <SearchIcon />,
            path: '/admin/search',
          },
          {
            id: 'marketer-portal',
            label: navLabel('navigation.marketerPortal'),
            icon: <AddCircleOutline />,
            path: '/marketer/portal',
          },
          {
            id: 'admin-marketers',
            label: navLabel('navigation.marketersManagement'),
            icon: <Campaign />,
            path: '/admin/marketers',
          },
          {
            id: 'admin-marketers-survey',
            label: navLabel('navigation.marketersSurveyStats'),
            icon: <Analytics />,
            path: '/admin/marketers/survey',
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

  // Build effective permissions so super_admin role can always see admin menus.
  const userPermissions = React.useMemo(() => {
    const normalized = Array.isArray(user?.permissions) ? [...user.permissions] : [];
    const roles = Array.isArray(user?.roles) ? user.roles : [];
    const isSuperAdminRole = roles.includes('super_admin');
    const hasSuperAdminPermission = normalized.includes(PERMISSIONS.SUPER_ADMIN_ACCESS);

    if (isSuperAdminRole || hasSuperAdminPermission) {
      if (!normalized.includes(PERMISSIONS.ADMIN_ACCESS)) {
        normalized.push(PERMISSIONS.ADMIN_ACCESS);
      }
      if (!normalized.includes(PERMISSIONS.SUPER_ADMIN_ACCESS)) {
        normalized.push(PERMISSIONS.SUPER_ADMIN_ACCESS);
      }
    }

    return normalized;
  }, [user?.permissions, user?.roles]);

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
          {appName}
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
          © 2025 Tagadod
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

