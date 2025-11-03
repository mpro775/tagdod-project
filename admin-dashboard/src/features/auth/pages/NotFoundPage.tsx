import React from 'react';
import { Box, Button, Typography, Container, useMediaQuery, useTheme } from '@mui/material';
import { SearchOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const NotFoundPage: React.FC = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          p: { xs: 2, sm: 3 },
        }}
      >
        <SearchOff 
          sx={{ 
            fontSize: { xs: 60, sm: 80, md: 100 }, 
            color: 'text.secondary', 
            mb: { xs: 2, sm: 3 } 
          }} 
        />

        <Typography 
          variant="h3" 
          fontWeight="bold" 
          gutterBottom
          sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}
        >
          {t('notFound.title')}
        </Typography>

        <Typography 
          variant="h5" 
          color="text.secondary" 
          gutterBottom
          sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, mb: 1 }}
        >
          {t('notFound.heading')}
        </Typography>

        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ mb: { xs: 3, sm: 4 }, fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          {t('notFound.description')}
        </Typography>

        <Box 
          sx={{ 
            display: 'flex', 
            gap: { xs: 1, sm: 2 },
            flexDirection: { xs: 'column', sm: 'row' },
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          <Button 
            variant="contained" 
            onClick={() => navigate('/dashboard')}
            fullWidth={isMobile}
            size={isMobile ? 'medium' : 'large'}
          >
            {t('notFound.goHome')}
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate(-1)}
            fullWidth={isMobile}
            size={isMobile ? 'medium' : 'large'}
          >
            {t('notFound.goBack')}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};
