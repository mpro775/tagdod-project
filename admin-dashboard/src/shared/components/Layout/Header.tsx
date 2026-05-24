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
  Tooltip,
  alpha,
} from '@mui/material';
import {
  Menu as MenuIcon,
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
import { NotificationBell } from '@/shared/components/NotificationBell';

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, title, subtitle }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuthStore();
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

  const handleToggleLanguage = async () => {
    const newLang = (i18n.language === 'ar' ? 'en' : 'ar') as 'ar' | 'en';
    await i18n.changeLanguage(newLang);
    useThemeStore.getState().setLanguage(newLang);
    handleMenuClose();
  };

  const handleRefreshPage = () => {
    window.location.reload();
  };

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: (theme) =>
          theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.94)
            : alpha(theme.palette.background.paper, 0.98),
        backdropFilter: 'blur(10px)',
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 64, md: 68 }, gap: 1 }}>
        <IconButton edge="start" color="inherit" aria-label="menu" onClick={onMenuClick}>
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" component="div" sx={{ fontWeight: 800 }} noWrap>
            {title || t('app.name', 'لوحة تحكم تجدد')}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {subtitle}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip
            title={
              mode === 'dark'
                ? t('common.lightMode', 'الوضع الفاتح')
                : t('common.darkMode', 'الوضع الداكن')
            }
          >
            <IconButton color="inherit" onClick={toggleMode}>
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>

          <Tooltip title={i18n.language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}>
            <IconButton color="inherit" onClick={handleToggleLanguage}>
              <Language />
            </IconButton>
          </Tooltip>

          <Tooltip title={t('common.refresh_page', 'تحديث الصفحة')}>
            <IconButton color="inherit" onClick={handleRefreshPage}>
              <Refresh />
            </IconButton>
          </Tooltip>

          <NotificationBell />

          <IconButton edge="end" color="inherit" onClick={handleMenuOpen} sx={{ ml: 0.5 }}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontWeight: 800 }}>
              {user?.firstName?.[0] || 'A'}
            </Avatar>
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1.25, minWidth: 220 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {user?.firstName || t('common.user', 'المستخدم')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.phone}
            </Typography>
          </Box>

          <Divider />

          <MenuItem onClick={() => navigate('/profile')}>
            <ListItemIcon>
              <AccountCircle fontSize="small" />
            </ListItemIcon>
            {t('common.profile', 'الملف الشخصي')}
          </MenuItem>

          <MenuItem onClick={() => navigate('/system/settings')}>
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
