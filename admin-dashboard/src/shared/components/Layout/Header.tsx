import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  AccountCircle,
  Logout,
  Settings,
  Brightness4,
  Brightness7,
  Language,
  Refresh,
} from '@mui/icons-material';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, logout, refreshProfile } = useAuthStore();
  const { mode, toggleMode } = useThemeStore();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleToggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    const newDir = newLang === 'ar' ? 'rtl' : 'ltr';
    useThemeStore.getState().setDirection(newDir);
    localStorage.setItem('language', newLang);
    handleMenuClose();
  };

  const handleRefreshProfile = async () => {
    try {
      await refreshProfile();
      toast.success(t('common.profile_updated', 'تم تحديث البيانات بنجاح'));
    } catch (error) {
      toast.error(t('common.profile_update_failed', 'فشل في تحديث البيانات'));
    }
  };

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Toolbar>
        {/* Menu Button */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        {/* Title */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {t('navigation.dashboard')}
        </Typography>

        {/* Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Theme Toggle */}
          <IconButton color="inherit" onClick={toggleMode}>
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          {/* Language Toggle */}
          <IconButton 
            color="inherit" 
            onClick={handleToggleLanguage}
            title={i18n.language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
          >
            <Language />
          </IconButton>

          {/* Refresh Profile */}
          <IconButton
            color="inherit"
            onClick={handleRefreshProfile}
            title={t('common.refresh_profile', 'تحديث البيانات')}
          >
            <Refresh />
          </IconButton>

          {/* Notifications */}
          <IconButton color="inherit">
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          {/* User Menu */}
          <IconButton edge="end" color="inherit" onClick={handleMenuOpen} sx={{ ml: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              {user?.firstName?.[0] || 'A'}
            </Avatar>
          </IconButton>
        </Box>

        {/* User Menu Dropdown */}
        <Menu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {/* User Info */}
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {user?.firstName || t('common.user', 'المستخدم')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.phone}
            </Typography>
          </Box>

          <Divider />

          {/* Menu Items */}
          <MenuItem onClick={() => navigate('/profile')}>
            <ListItemIcon>
              <AccountCircle fontSize="small" />
            </ListItemIcon>
            {t('common.profile', 'الملف الشخصي')}
          </MenuItem>

          <MenuItem onClick={() => navigate('/settings')}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            {t('navigation.settings')}
          </MenuItem>

          <Divider />

          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            {t('common.logout', 'تسجيل الخروج')}
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};
