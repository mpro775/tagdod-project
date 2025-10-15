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
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
      path: '/users',
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
          path: '/products',
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
          path: '/orders',
        },
        {
          id: 'coupons',
          label: t('navigation.coupons'),
          icon: <LocalOffer />,
          path: '/coupons',
        },
      ],
    },
    {
      id: 'marketing',
      label: t('navigation.marketing', 'التسويق'),
      icon: <Campaign />,
      children: [
        {
          id: 'banners',
          label: t('navigation.banners', 'البنرات'),
          icon: <Campaign />,
          path: '/banners',
        },
        {
          id: 'promotions',
          label: t('navigation.promotions', 'العروض'),
          icon: <LocalOffer />,
          path: '/promotions',
        },
      ],
      },
      {
        id: 'services',
        label: t('navigation.services', 'الخدمات'),
        icon: <Build />,
        path: '/services',
      },
      {
        id: 'media',
        label: t('navigation.media', 'مكتبة الوسائط'),
        icon: <PhotoLibrary />,
        path: '/media',
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
        id: 'support',
        label: t('navigation.support', 'الدعم الفني'),
        icon: <Support />,
        path: '/support',
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
      id: 'settings',
      label: t('navigation.settings'),
      icon: <Settings />,
      path: '/settings',
    },
  ];

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
        <Typography variant="h6" fontWeight="bold">
          {t('app.name')}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {t('navigation.dashboard')}
        </Typography>
      </Box>

      <Divider />

      {/* Menu Items */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 1 }}>
        <List>{menuItems.map((item) => renderMenuItem(item))}</List>
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
