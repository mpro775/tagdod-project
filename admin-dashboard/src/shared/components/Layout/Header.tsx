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
  MenuOpen as MenuOpenIcon,
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
  sidebarCollapsed?: boolean;
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  sidebarCollapsed = false,
  title,
  subtitle,
}) => {
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
        borderBottom: '1px solid',
        borderColor: (theme) => alpha(theme.palette.divider, 0.75),
        bgcolor: (theme) =>
          theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.96)
            : alpha(theme.palette.background.paper, 0.98),
        backgroundImage: (theme) =>
          theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, transparent 42%)`
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.035)}, transparent 46%)`,
        backdropFilter: 'blur(16px)',
        boxShadow: 'none',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 56, sm: 64, md: 72 },
          gap: { xs: 0.5, sm: 1 },
          px: { xs: 1.25, sm: 2, md: 2.5 },
        }}
      >
        <Tooltip title={sidebarCollapsed ? 'فتح القائمة الجانبية' : 'طي القائمة الجانبية'}>
          <IconButton
            edge="start"
            aria-label={sidebarCollapsed ? 'فتح القائمة الجانبية' : 'طي القائمة الجانبية'}
            onClick={onMenuClick}
            sx={{
              width: { xs: 40, md: 44 },
              height: { xs: 40, md: 44 },
              borderRadius: 3,
              border: '1px solid',
              borderColor: (theme) =>
                alpha(theme.palette.primary.main, sidebarCollapsed ? 0.45 : 0.22),
              bgcolor: (theme) => alpha(theme.palette.primary.main, sidebarCollapsed ? 0.14 : 0.06),
              color: 'primary.main',
              transition: (theme) =>
                theme.transitions.create(['background-color', 'border-color', 'transform'], {
                  duration: theme.transitions.duration.shorter,
                }),
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.18),
                borderColor: 'primary.main',
                transform: 'translateY(-1px)',
              },
            }}
          >
            {sidebarCollapsed ? <MenuIcon /> : <MenuOpenIcon />}
          </IconButton>
        </Tooltip>

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
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleMenuOpen}
              aria-label="الملف الشخصي"
            >
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  bgcolor: 'primary.main',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                }}
              >
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
                  {mode === 'dark' ? (
                    <Brightness7 fontSize="small" />
                  ) : (
                    <Brightness4 fontSize="small" />
                  )}
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

            <IconButton
              edge="end"
              color="inherit"
              onClick={handleMenuOpen}
              aria-label="الملف الشخصي"
            >
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

          <MenuItem
            onClick={() => {
              navigate('/profile');
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <AccountCircle fontSize="small" />
            </ListItemIcon>
            {t('common.profile', 'الملف الشخصي')}
          </MenuItem>

          <MenuItem
            onClick={() => {
              navigate('/system/settings');
              handleMenuClose();
            }}
          >
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
                  {mode === 'dark' ? (
                    <Brightness7 fontSize="small" />
                  ) : (
                    <Brightness4 fontSize="small" />
                  )}
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