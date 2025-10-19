import React, { useState, useRef, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer,
  Box,
  Divider,
  useTheme,
  useMediaQuery,
  Button,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  AccountCircle as AccountIcon,
  Language as LanguageIcon,
  Accessibility as AccessibilityIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material';
import { useAccessibility } from '@/shared/hooks/useAccessibility';
import { useRTL } from '@/shared/hooks/useRTL';
import { useThemeStore } from '@/store/themeStore';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  description?: string;
}

interface AccessibleNavigationProps {
  title: string;
  items: NavigationItem[];
  // eslint-disable-next-line no-unused-vars
  onItemClick?: (item: NavigationItem) => void;
  userMenuItems?: NavigationItem[];
  // eslint-disable-next-line no-unused-vars
  onUserMenuClick?: (item: NavigationItem) => void;
  showAccessibilitySettings?: boolean;
  onAccessibilitySettingsClick?: () => void;
}

export const AccessibleNavigation: React.FC<AccessibleNavigationProps> = ({
  title,
  items,
  onItemClick,
  userMenuItems = [],
  onUserMenuClick,
  showAccessibilitySettings = true,
  onAccessibilitySettingsClick,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { useSkipLink } = useAccessibility();
  const { isRTL, getTextAlign } = useRTL();
  const { toggleDirection, toggleMode, mode } = useThemeStore();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [accessibilityMenuAnchor, setAccessibilityMenuAnchor] = useState<null | HTMLElement>(null);

  const drawerRef = useRef<HTMLDivElement>(null);

  // Skip link functionality
  const { handleSkip } = useSkipLink('main-content');

  // Handle mobile drawer toggle
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Handle navigation item click
  const handleItemClick = (item: NavigationItem) => {
    if (item.disabled) return;
    
    if (item.onClick) {
      item.onClick();
    } else if (onItemClick) {
      onItemClick(item);
    }
    
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Handle user menu
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  // Handle accessibility menu
  const handleAccessibilityMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAccessibilityMenuAnchor(event.currentTarget);
  };

  const handleAccessibilityMenuClose = () => {
    setAccessibilityMenuAnchor(null);
  };

  // Focus management
  useEffect(() => {
    if (mobileOpen && drawerRef.current) {
      const firstFocusable = drawerRef.current.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') as HTMLElement;
      firstFocusable?.focus();
    }
  }, [mobileOpen]);

  // Drawer content
  const drawerContent = (
    <Box
      ref={drawerRef}
      sx={{
        width: 280,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        textAlign: getTextAlign(),
        direction: isRTL ? 'rtl' : 'ltr',
      }}
      role="navigation"
      aria-label="القائمة الرئيسية"
    >
      {/* Drawer header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" component="h2">
          {title}
        </Typography>
        <IconButton
          onClick={handleDrawerToggle}
          aria-label="إغلاق القائمة"
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Navigation items */}
      <List component="nav" sx={{ flexGrow: 1, pt: 1 }}>
        {items.map((item, index) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              id={`nav-item-${index}`}
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
              aria-describedby={item.description ? `nav-item-${index}-description` : undefined}
              sx={{
                textAlign: getTextAlign(),
                direction: isRTL ? 'rtl' : 'ltr',
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                secondary={item.description}
                sx={{
                  textAlign: getTextAlign(),
                }}
              />
            </ListItemButton>
            {item.description && (
              <Typography
                id={`nav-item-${index}-description`}
                variant="caption"
                className="sr-only"
              >
                {item.description}
              </Typography>
            )}
          </ListItem>
        ))}
      </List>

      {/* User menu items */}
      {userMenuItems.length > 0 && (
        <>
          <Divider />
          <List component="nav">
            {userMenuItems.map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick();
                    } else if (onUserMenuClick) {
                      onUserMenuClick(item);
                    }
                    if (isMobile) {
                      setMobileOpen(false);
                    }
                  }}
                  disabled={item.disabled}
                  sx={{
                    textAlign: getTextAlign(),
                    direction: isRTL ? 'rtl' : 'ltr',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    secondary={item.description}
                    sx={{
                      textAlign: getTextAlign(),
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Box>
  );

  return (
    <>
      {/* Skip link */}
      <Button
        className="skip-link"
        onClick={() => handleSkip({} as React.KeyboardEvent)}
        onKeyDown={handleSkip}
        sx={{
          position: 'absolute',
          top: -40,
          left: 6,
          zIndex: 1000,
        }}
      >
        انتقل إلى المحتوى الرئيسي
      </Button>

      {/* App bar */}
      <AppBar position="static" elevation={1}>
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            direction: isRTL ? 'rtl' : 'ltr',
          }}
        >
          {/* Mobile menu button */}
          <IconButton
            edge="start"
            color="inherit"
            aria-label="فتح القائمة"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          {/* Title */}
          <Typography
            variant="h6"
            component="h1"
            sx={{
              flexGrow: 1,
              textAlign: getTextAlign(),
            }}
          >
            {title}
          </Typography>

          {/* Accessibility settings */}
          {showAccessibilitySettings && (
            <Tooltip title="إعدادات إمكانية الوصول">
              <IconButton
                color="inherit"
                aria-label="إعدادات إمكانية الوصول"
                onClick={handleAccessibilityMenuOpen}
                aria-haspopup="true"
                aria-expanded={!!accessibilityMenuAnchor}
              >
                <AccessibilityIcon />
              </IconButton>
            </Tooltip>
          )}

          {/* User menu */}
          {userMenuItems.length > 0 && (
            <Tooltip title="قائمة المستخدم">
              <IconButton
                color="inherit"
                aria-label="قائمة المستخدم"
                onClick={handleUserMenuOpen}
                aria-haspopup="true"
                aria-expanded={!!userMenuAnchor}
              >
                <AccountIcon />
              </IconButton>
            </Tooltip>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* User menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: isRTL ? 'left' : 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: isRTL ? 'left' : 'right',
        }}
      >
        {userMenuItems.map((item) => (
          <MenuItem
            key={item.id}
            onClick={() => {
              if (item.onClick) {
                item.onClick();
              } else if (onUserMenuClick) {
                onUserMenuClick(item);
              }
              handleUserMenuClose();
            }}
            disabled={item.disabled}
          >
            {item.icon}
            <Box sx={{ ml: 1, textAlign: getTextAlign() }}>
              {item.label}
            </Box>
          </MenuItem>
        ))}
      </Menu>

      {/* Accessibility menu */}
      <Menu
        anchorEl={accessibilityMenuAnchor}
        open={Boolean(accessibilityMenuAnchor)}
        onClose={handleAccessibilityMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: isRTL ? 'left' : 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: isRTL ? 'left' : 'right',
        }}
      >
        <MenuItem onClick={() => {
          toggleDirection();
          handleAccessibilityMenuClose();
        }}>
          <LanguageIcon />
          <Box sx={{ ml: 1, textAlign: getTextAlign() }}>
            {isRTL ? 'English (LTR)' : 'العربية (RTL)'}
          </Box>
        </MenuItem>
        <MenuItem onClick={() => {
          toggleMode();
          handleAccessibilityMenuClose();
        }}>
          <PaletteIcon />
          <Box sx={{ ml: 1, textAlign: getTextAlign() }}>
            {mode === 'light' ? 'الوضع الداكن' : 'الوضع الفاتح'}
          </Box>
        </MenuItem>
        {onAccessibilitySettingsClick && (
          <MenuItem onClick={() => {
            onAccessibilitySettingsClick();
            handleAccessibilityMenuClose();
          }}>
            <AccessibilityIcon />
            <Box sx={{ ml: 1, textAlign: getTextAlign() }}>
              إعدادات إمكانية الوصول
            </Box>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default AccessibleNavigation;
