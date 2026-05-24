import React from 'react';
import { Box, useMediaQuery, Theme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const DRAWER_WIDTH = 280;

export const MainLayout: React.FC = () => {
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleSidebarOpen = React.useCallback(() => {
    setSidebarOpen(true);
  }, []);

  const handleSidebarClose = React.useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleToggleSidebar = React.useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  React.useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', overflow: 'hidden' }}>
      <Sidebar
        width={DRAWER_WIDTH}
        open={isMobile ? sidebarOpen : true}
        onClose={handleSidebarClose}
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
            md: `calc(100% - ${DRAWER_WIDTH}px)`,
          },
          transition: (theme) =>
            theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Header onMenuClick={isMobile ? handleSidebarOpen : handleToggleSidebar} />

        <Box
          sx={{
            p: { xs: 1.5, sm: 2, md: 3 },
            minHeight: 'calc(100vh - 64px)',
            overflowX: 'hidden',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};