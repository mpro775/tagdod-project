import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import WbSunnyIcon from '@mui/icons-material/WbSunny';

const Navbar: React.FC = () => {
  const theme = useTheme();

  return (
    <AppBar position="sticky" color="default" elevation={1} sx={{ bgcolor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {/* Logo */}
          <Box display="flex" alignItems="center" component={RouterLink} to="/" sx={{ textDecoration: 'none', color: 'primary.main', flexGrow: 1 }}>
            <WbSunnyIcon sx={{ mr: 1, fontSize: 32 }} />
            <Typography variant="h5" fontWeight="bold" fontFamily="Cairo">
              تجدد
            </Typography>
          </Box>

          {/* Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            <Button component={RouterLink} to="/" color="inherit">
              الرئيسية
            </Button>
            <Button component={RouterLink} to="/terms" color="inherit">
              الأحكام والشروط
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              href="#download"
              sx={{ borderRadius: 50, px: 3 }}
            >
              حمل التطبيق
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
