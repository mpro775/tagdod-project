import React from 'react';
import { Box, Theme, useMediaQuery } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const DRAWER_WIDTH = 280;
const COLLAPSED_DRAWER_WIDTH = 88;
const SIDEBAR_STATE_KEY = 'tagadod_admin_sidebar_state';

export const MainLayout: React.FC = () => {
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const [desktopSidebarExpanded, setDesktopSidebarExpanded] = React.useState(() => {
    if (typeof window === 'undefined') return true;
    return window.localStorage.getItem(SIDEBAR_STATE_KEY) !== 'collapsed';
  });

  const sidebarCollapsed = !isMobile && !desktopSidebarExpanded;
  const effectiveDrawerWidth = sidebarCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH;

  const handleSidebarClose = React.useCallback(() => {
    setMobileSidebarOpen(false);
  }, []);

  const handleToggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setMobileSidebarOpen((prev) => !prev);
      return;
    }

    setDesktopSidebarExpanded((prev) => {
      const next = !prev;
      window.localStorage.setItem(SIDEBAR_STATE_KEY, next ? 'expanded' : 'collapsed');
      return next;
    });
  }, [isMobile]);

  const handleDesktopExpandRequest = React.useCallback(() => {
    if (!isMobile) {
      setDesktopSidebarExpanded(true);
      window.localStorage.setItem(SIDEBAR_STATE_KEY, 'expanded');
    }
  }, [isMobile]);

  React.useEffect(() => {
    if (!isMobile) {
      setMobileSidebarOpen(false);
    }
  }, [isMobile]);

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}
    >
      <Sidebar
        width={isMobile ? DRAWER_WIDTH : effectiveDrawerWidth}
        expandedWidth={DRAWER_WIDTH}
        collapsedWidth={COLLAPSED_DRAWER_WIDTH}
        collapsed={sidebarCollapsed}
        open={isMobile ? mobileSidebarOpen : true}
        onClose={handleSidebarClose}
        onExpandRequest={handleDesktopExpandRequest}
        variant={isMobile ? 'temporary' : 'permanent'}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          maxWidth: '100%',
          overflowX: 'hidden',
          width: {
            xs: '100%',
            md: `calc(100% - ${effectiveDrawerWidth}px)`,
          },
          transition: (theme) =>
            theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.easeInOut,
              duration: theme.transitions.duration.standard,
            }),
        }}
      >
        <Header onMenuClick={handleToggleSidebar} sidebarCollapsed={sidebarCollapsed} />

        <Box
          sx={{
            p: { xs: 1.5, sm: 2, md: 3 },
            minHeight: 'calc(100vh - 72px)',
            overflowX: 'hidden',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};