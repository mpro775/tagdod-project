import React from 'react';
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
  Translate,
  AdminPanelSettings,
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
  const { t } = useTranslation();
  const { user } = useAuthStore();
  // Menu items
  const menuItems: MenuItem[] = [
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
          label: 'إدارة السلال',
          icon: <ShoppingCart />,
          children: [
            {
              id: 'carts-list',
              label: 'قائمة السلال',
              icon: <ShoppingCart />,
              path: '/carts',
            },
            {
              id: 'carts-abandoned',
              label: 'السلال المتروكة',
              icon: <ShoppingCart />,
              path: '/carts/abandoned',
            },
            {
              id: 'carts-analytics',
              label: 'تحليلات السلة',
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
          children: [
            {
              id: 'banners-list',
              label: t('navigation.bannersList', 'قائمة البنرات'),
              icon: <Campaign />,
              path: '/banners',
            },
            {
              id: 'banners-analytics',
              label: t('navigation.bannersAnalytics', 'تحليلات البنرات'),
              icon: <Assessment />,
              path: '/banners/analytics',
            },
          ],
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
            id: 'services-engineers',
            label: t('navigation.servicesEngineers', 'إدارة المهندسين'),
            icon: <People />,
            path: '/services/engineers',
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
            id: 'i18n-management',
            label: t('navigation.i18nManagement', 'نصوص التعريب'),
            icon: <Translate />,
            path: '/system/i18n',
          },
          {
            id: 'system-settings',
            label: t('navigation.systemSettings', 'إعدادات النظام'),
            icon: <Settings />,
            path: '/system/settings',
          },
        ],
      },
    {
      id: 'exchange-rates',
      label: 'أسعار الصرف',
      icon: <Assessment />,
      path: '/exchange-rates',
    },
    {
      id: 'settings',
      label: t('navigation.settings'),
      icon: <Settings />,
      path: '/settings',
    },
  ];

  // Filter menu items based on user permissions
  const userPermissions = user?.permissions || [];
  const filteredMenuItems = React.useMemo(() => {
    return filterMenuByPermissions(menuItems, userPermissions);
  }, [userPermissions]);

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
          © 2025 Tagadodo
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
