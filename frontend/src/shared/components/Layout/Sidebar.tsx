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
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

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

  // Menu items
  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'لوحة التحكم',
      icon: <Dashboard />,
      path: '/dashboard',
    },
    {
      id: 'users',
      label: 'المستخدمون',
      icon: <People />,
      path: '/users',
    },
    {
      id: 'catalog',
      label: 'الكتالوج',
      icon: <Inventory />,
      children: [
        {
          id: 'products',
          label: 'المنتجات',
          icon: <Inventory />,
          path: '/products',
        },
        {
          id: 'categories',
          label: 'الفئات',
          icon: <Category />,
          path: '/categories',
        },
        {
          id: 'attributes',
          label: 'السمات',
          icon: <Tune />,
          path: '/attributes',
        },
        {
          id: 'brands',
          label: 'العلامات',
          icon: <Storefront />,
          path: '/brands',
        },
      ],
    },
    {
      id: 'sales',
      label: 'المبيعات',
      icon: <ShoppingCart />,
      children: [
        {
          id: 'orders',
          label: 'الطلبات',
          icon: <Receipt />,
          path: '/orders',
        },
        {
          id: 'coupons',
          label: 'الكوبونات',
          icon: <LocalOffer />,
          path: '/coupons',
        },
      ],
    },
    {
      id: 'marketing',
      label: 'التسويق',
      icon: <Campaign />,
      children: [
        {
          id: 'banners',
          label: 'البنرات',
          icon: <Campaign />,
          path: '/banners',
        },
        {
          id: 'promotions',
          label: 'العروض',
          icon: <LocalOffer />,
          path: '/promotions',
        },
      ],
    },
    {
      id: 'settings',
      label: 'الإعدادات',
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
          تقدودو
        </Typography>
        <Typography variant="caption" color="text.secondary">
          لوحة التحكم
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
