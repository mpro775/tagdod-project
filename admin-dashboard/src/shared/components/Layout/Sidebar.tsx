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
} from '@mui/material';
import logoImage from '../../../assets/images/logo.png';
import {
  Dashboard,
  People,
  Inventory,
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
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { filterMenuByPermissions } from '@/shared/constants/permissions';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItem[];
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
            label: t('navigation.usersList', 'قائمة المستخدمين'),
            icon: <People />,
            path: '/users',
          },
          {
            id: 'users-analytics',
            label: t('navigation.usersAnalytics', 'تحليلات المستخدمين'),
            icon: <Assessment />,
            path: '/users/analytics',
          },
          {
            id: 'users-deleted',
            label: t('navigation.usersDeleted', 'الحسابات المحذوفة'),
            icon: <DeleteForever />,
            path: '/users/deleted',
          },
          {
            id: 'users-verification',
            label: t('navigation.verificationRequests', 'طلبات التحقق'),
            icon: <VerifiedUser />,
            path: '/users/verification-requests',
          },
          {
            id: 'users-addresses',
            label: t('navigation.addresses', 'العناوين'),
            icon: <LocationOn />,
            path: '/admin/addresses',
          },
          {
            id: 'users-favorites',
            label: t('navigation.favorites', 'المفضلة'),
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
                label: t('navigation.productsList', 'قائمة المنتجات'),
                icon: <Inventory />,
                path: '/products',
              },
              {
                id: 'products-analytics',
                label: t('navigation.productsAnalytics', 'تحليلات المنتجات'),
                icon: <Assessment />,
                path: '/products/analytics',
              },
              {
                id: 'products-inventory',
                label: t('navigation.productsInventory', 'إدارة المخزون'),
                icon: <ViewModule />,
                path: '/products/inventory',
              },
              {
                id: 'products-integration',
                label: t('navigation.productsIntegration', 'ربط المخزون'),
                icon: <Sync />,
                path: '/products/integration',
              },
              {
                id: 'products-unlinked',
                label: t('navigation.productsUnlinked', 'فرص الإضافة'),
                icon: <AddCircleOutline />,
                path: '/products/unlinked',
              },
              {
                id: 'products-linked',
                label: t('navigation.productsLinked', 'المربوطة'),
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
                label: t('navigation.ordersList', 'قائمة الطلبات'),
                icon: <Receipt />,
                path: '/orders',
              },
              {
                id: 'orders-analytics',
                label: t('navigation.ordersAnalytics', 'تحليلات الطلبات'),
                icon: <Assessment />,
                path: '/orders/analytics',
              },
            ],
          },
          {
            id: 'carts',
            label: t('navigation.cartsManagement', 'إدارة السلال'),
            icon: <ShoppingCart />,
            children: [
              {
                id: 'carts-list',
                label: t('navigation.cartsList', 'قائمة السلال'),
                icon: <ShoppingCart />,
                path: '/carts',
              },
              {
                id: 'carts-analytics',
                label: t('navigation.cartsAnalytics', 'تحليلات السلة'),
                icon: <Assessment />,
                path: '/carts/analytics',
              },
            ],
          },
        ],
      },
      {
        id: 'marketing',
        label: t('navigation.marketing', 'التسويق'),
        icon: <Campaign />,
        children: [
          {
            id: 'marketing-dashboard',
            label: t('navigation.marketingDashboard', 'لوحة التسويق'),
            icon: <Dashboard />,
            path: '/marketing',
          },
          {
            id: 'price-rules',
            label: t('navigation.priceRules', 'قواعد الأسعار'),
            icon: <LocalOffer />,
            path: '/marketing/price-rules',
          },
          {
            id: 'banners',
            label: t('navigation.banners', 'البنرات'),
            icon: <Campaign />,
            path: '/banners',
          },
          {
            id: 'coupons',
            label: t('navigation.coupons', 'الكوبونات'),
            icon: <LocalOffer />,
            children: [
              {
                id: 'coupons-list',
                label: t('navigation.couponsList', 'قائمة الكوبونات'),
                icon: <LocalOffer />,
                path: '/coupons',
              },
              {
                id: 'coupons-analytics',
                label: t('navigation.couponsAnalytics', 'تحليلات الكوبونات'),
                icon: <Assessment />,
                path: '/coupons/analytics',
              },
            ],
          },
        ],
      },
      {
        id: 'services',
        label: t('navigation.services', 'الخدمات'),
        icon: <Build />,
        children: [
          {
            id: 'services-overview',
            label: t('navigation.servicesOverview', 'نظرة عامة'),
            icon: <Dashboard />,
            path: '/services',
          },
          {
            id: 'services-requests',
            label: t('navigation.servicesRequests', 'طلبات الخدمات'),
            icon: <Build />,
            path: '/services/requests',
          },
          {
            id: 'services-offers',
            label: t('navigation.servicesOffers', 'إدارة العروض'),
            icon: <LocalOffer />,
            path: '/services/offers',
          },
          {
            id: 'services-analytics',
            label: t('navigation.servicesAnalytics', 'تحليلات الخدمات'),
            icon: <Analytics />,
            path: '/services/analytics',
          },
        ],
      },
      {
        id: 'engineers',
        label: t('navigation.engineers', 'المهندسين'),
        icon: <People />,
        children: [
          {
            id: 'engineers-management',
            label: t('navigation.servicesEngineers', 'إدارة المهندسين'),
            icon: <People />,
            path: '/services/engineers',
          },
          {
            id: 'engineers-coupons',
            label: t('navigation.engineerCoupons', 'كوبونات المهندسين'),
            icon: <LocalOffer />,
            path: '/services/engineers/coupons',
          },
        ],
      },
      {
        id: 'media',
        label: t('navigation.media', 'مكتبة الوسائط'),
        icon: <PhotoLibrary />,
        children: [
          {
            id: 'media-library',
            label: t('navigation.mediaLibrary', 'مكتبة الوسائط'),
            icon: <PhotoLibrary />,
            path: '/media',
          },
          {
            id: 'media-analytics',
            label: t('navigation.mediaAnalytics', 'إحصائيات الوسائط'),
            icon: <Assessment />,
            path: '/media/analytics',
          },
        ],
      },
      {
        id: 'analytics',
        label: t('navigation.analytics', 'الإحصائيات'),
        icon: <Analytics />,
        children: [
          {
            id: 'analytics-dashboard',
            label: t('navigation.analyticsDashboard', 'لوحة الإحصائيات'),
            icon: <Analytics />,
            path: '/analytics',
          },
          {
            id: 'analytics-main',
            label: t('navigation.analyticsMain', 'نظام التحليلات الشامل'),
            icon: <Dashboard />,
            path: '/analytics/main',
          },
          {
            id: 'analytics-advanced',
            label: t('navigation.analyticsAdvanced', 'إحصائيات متقدمة'),
            icon: <Assessment />,
            path: '/analytics/advanced',
          },
          {
            id: 'analytics-export',
            label: t('navigation.analyticsExport', 'تصدير البيانات'),
            icon: <GetApp />,
            path: '/analytics/export',
          },
          {
            id: 'analytics-reports',
            label: t('navigation.analyticsReports', 'إدارة التقارير'),
            icon: <Description />,
            path: '/analytics/reports',
          },
        ],
      },
      {
        id: 'audit',
        label: t('navigation.audit', 'السجلات والتدقيق'),
        icon: <Security />,
        children: [
          {
            id: 'audit-logs',
            label: t('navigation.auditLogs', 'سجلات التدقيق'),
            icon: <Security />,
            path: '/audit',
          },
          {
            id: 'audit-main',
            label: t('navigation.auditMain', 'نظام التدقيق الشامل'),
            icon: <Dashboard />,
            path: '/audit/main',
          },
          {
            id: 'audit-analytics',
            label: t('navigation.auditAnalytics', 'تحليلات التدقيق'),
            icon: <Assessment />,
            path: '/audit/analytics',
          },
        ],
      },
      {
        id: 'support',
        label: t('navigation.support', 'الدعم الفني'),
        icon: <Support />,
        children: [
          {
            id: 'support-tickets',
            label: t('navigation.supportTickets', 'قائمة التذاكر'),
            icon: <Support />,
            path: '/support',
          },
          {
            id: 'support-stats',
            label: t('navigation.supportStats', 'إحصائيات الدعم'),
            icon: <Assessment />,
            path: '/support/stats',
          },
          {
            id: 'support-canned-responses',
            label: t('navigation.supportCannedResponses', 'الردود الجاهزة'),
            icon: <ViewModule />,
            path: '/support/canned-responses',
          },
        ],
      },
      {
        id: 'notifications',
        label: t('navigation.notifications', 'الإشعارات'),
        icon: <Notifications />,
        children: [
          {
            id: 'notifications-list',
            label: t('navigation.notificationsList', 'قائمة الإشعارات'),
            icon: <Notifications />,
            path: '/notifications',
          },
          {
            id: 'notifications-analytics',
            label: t('navigation.notificationsAnalytics', 'إحصائيات الإشعارات'),
            icon: <Assessment />,
            path: '/notifications/analytics',
          },
          {
            id: 'notifications-templates',
            label: t('navigation.notificationsTemplates', 'قوالب الإشعارات'),
            icon: <ViewModule />,
            path: '/notifications/templates',
          },
          {
            id: 'notifications-channel-configs',
            label: t('navigation.notificationsChannelConfigs', 'إعدادات القنوات'),
            icon: <Settings />,
            path: '/notifications/channel-configs',
          },
        ],
      },
      {
        id: 'system-management',
        label: t('navigation.systemManagement', 'إدارة النظام'),
        icon: <AdminPanelSettings />,
        children: [
          {
            id: 'system-monitoring',
            label: t('navigation.systemMonitoring', 'مراقبة الأداء'),
            icon: <Monitor />,
            path: '/system/monitoring',
          },
          {
            id: 'error-logs',
            label: t('navigation.errorLogs', 'سجلات الأخطاء'),
            icon: <BugReport />,
            path: '/system/error-logs',
          },

          {
            id: 'system-settings',
            label: t('navigation.systemSettings', 'إعدادات النظام'),
            icon: <Settings />,
            path: '/system/settings',
          },
          {
            id: 'policies',
            label: t('navigation.policies', 'السياسات'),
            icon: <Policy />,
            path: '/policies',
          },
          {
            id: 'about',
            label: t('navigation.about', 'من نحن'),
            icon: <Info />,
            path: '/about',
          },
        ],
      },
      {
        id: 'exchange-rates',
        label: t('navigation.exchangeRates', 'أسعار الصرف'),
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
        ],
      },
    ],
    [t, i18n.language]
  );

  // Filter menu items based on user permissions
  const userPermissions = user?.permissions || [];
  const filteredMenuItems = React.useMemo(() => {
    return filterMenuByPermissions(menuItems, userPermissions);
  }, [menuItems, userPermissions]);

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
            {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
            <ListItemText primary={item.label} />
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
