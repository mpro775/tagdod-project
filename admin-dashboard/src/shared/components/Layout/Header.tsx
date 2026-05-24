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
  useMediaQuery,
  Theme,
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
  MoreVert,
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
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [moreAnchorEl, setMoreAnchorEl] = React.useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);
  const isMoreOpen = Boolean(moreAnchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMoreOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMoreAnchorEl(event.currentTarget);
  };

  const handleMoreClose = () => {
    setMoreAnchorEl(null);
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
    handleMoreClose();
  };

  const handleToggleTheme = () => {
    toggleMode();
    handleMoreClose();
  };

  const handleRefreshPage = () => {
    window.location.reload();
    handleMoreClose();
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
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64, md: 68 }, gap: { xs: 0.5, sm: 1 } }}>
        <IconButton edge="start" color="inherit" aria-label="فتح القائمة" onClick={onMenuClick}>
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1, minWidth: 0, overflow: 'hidden' }}>
          <Typography
            variant={isMobile ? 'body2' : 'subtitle1'}
            component="div"
            sx={{ fontWeight: 800, lineHeight: 1.3 }}
            noWrap
          >
            {title || t('app.name', 'لوحة تحكم تجدد')}
          </Typography>
          {!isMobile && subtitle && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {subtitle}
            </Typography>
          )}
        </Box>

        {isMobile ? (
          <>
            <NotificationBell />
            <IconButton edge="end" color="inherit" onClick={handleMenuOpen} aria-label="الملف الشخصي">
              <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.main', fontWeight: 800, fontSize: '0.875rem' }}>
                {user?.firstName?.[0] || 'A'}
              </Avatar>
            </IconButton>
            <IconButton color="inherit" onClick={handleMoreOpen} aria-label="المزيد">
              <MoreVert />
            </IconButton>
            <Menu
              anchorEl={moreAnchorEl}
              open={isMoreOpen}
              onClose={handleMoreClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleToggleTheme}>
                <ListItemIcon>
                  {mode === 'dark' ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
                </ListItemIcon>
                {mode === 'dark'
                  ? t('common.lightMode', 'الوضع الفاتح')
                  : t('common.darkMode', 'الوضع الداكن')}
              </MenuItem>
              <MenuItem onClick={handleToggleLanguage}>
                <ListItemIcon>
                  <Language fontSize="small" />
                </ListItemIcon>
                {i18n.language === 'ar' ? 'English' : 'العربية'}
              </MenuItem>
              <MenuItem onClick={handleRefreshPage}>
                <ListItemIcon>
                  <Refresh fontSize="small" />
                </ListItemIcon>
                {t('common.refresh_page', 'تحديث الصفحة')}
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip
              title={
                mode === 'dark'
                  ? t('common.lightMode', 'الوضع الفاتح')
                  : t('common.darkMode', 'الوضع الداكن')
              }
            >
              <IconButton color="inherit" onClick={handleToggleTheme} aria-label="تبديل المظهر">
                {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Tooltip>

            <Tooltip title={i18n.language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}>
              <IconButton color="inherit" onClick={handleToggleLanguage} aria-label="تبديل اللغة">
                <Language />
              </IconButton>
            </Tooltip>

            <Tooltip title={t('common.refresh_page', 'تحديث الصفحة')}>
              <IconButton color="inherit" onClick={handleRefreshPage} aria-label="تحديث">
                <Refresh />
              </IconButton>
            </Tooltip>

            <NotificationBell />

            <IconButton edge="end" color="inherit" onClick={handleMenuOpen} aria-label="الملف الشخصي">
              <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontWeight: 800 }}>
                {user?.firstName?.[0] || 'A'}
              </Avatar>
            </IconButton>
          </Box>
        )}

        <Menu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          slotProps={{ paper: { sx: { minWidth: 220 } } }}
        >
          <Box sx={{ px: 2, py: 1.25 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {user?.firstName || t('common.user', 'المستخدم')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.phone}
            </Typography>
          </Box>

          <Divider />

          <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
            <ListItemIcon>
              <AccountCircle fontSize="small" />
            </ListItemIcon>
            {t('common.profile', 'الملف الشخصي')}
          </MenuItem>

          <MenuItem onClick={() => { navigate('/system/settings'); handleMenuClose(); }}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            {t('navigation.settings')}
          </MenuItem>

          {isMobile && (
            <>
              <Divider />
              <MenuItem onClick={handleToggleTheme}>
                <ListItemIcon>
                  {mode === 'dark' ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
                </ListItemIcon>
                {mode === 'dark'
                  ? t('common.lightMode', 'الوضع الفاتح')
                  : t('common.darkMode', 'الوضع الداكن')}
              </MenuItem>
              <MenuItem onClick={handleToggleLanguage}>
                <ListItemIcon>
                  <Language fontSize="small" />
                </ListItemIcon>
                {i18n.language === 'ar' ? 'English' : 'العربية'}
              </MenuItem>
            </>
          )}

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