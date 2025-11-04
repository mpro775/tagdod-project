import React from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  Skeleton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Refresh,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSupportStats } from '../hooks/useSupport';
import { SupportStatsCards } from '../components';

export const SupportStatsPage: React.FC = () => {
  const { t } = useTranslation('support');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { data: stats, isLoading, error, refetch } = useSupportStats();

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, py: { xs: 2, sm: 3 } }}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={{ xs: 2, sm: 0 }}
          mb={{ xs: 2, sm: 3 }}
        >
          <Typography 
            variant={isMobile ? 'h5' : 'h4'} 
            fontWeight="bold"
            sx={{ color: 'text.primary' }}
          >
            {t('titles.supportStats')}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={isLoading}
            fullWidth={isMobile}
            size={isMobile ? 'small' : 'medium'}
            sx={{ 
              color: 'text.primary',
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover',
              },
            }}
          >
            {t('labels.refresh')}
          </Button>
        </Stack>
        
        <Box>
          <Skeleton 
            variant="rectangular" 
            height={isMobile ? 150 : 200} 
            sx={{ mb: { xs: 2, sm: 3 }, borderRadius: 2 }} 
          />
          <Skeleton 
            variant="rectangular" 
            height={isMobile ? 300 : 400}
            sx={{ borderRadius: 2 }}
          />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, py: { xs: 2, sm: 3 } }}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={{ xs: 2, sm: 0 }}
          mb={{ xs: 2, sm: 3 }}
        >
          <Typography 
            variant={isMobile ? 'h5' : 'h4'} 
            fontWeight="bold"
            sx={{ color: 'text.primary' }}
          >
            {t('titles.supportStats')}
          </Typography>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={1.5}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/support')}
              fullWidth={isMobile}
              size={isMobile ? 'small' : 'medium'}
              sx={{ 
                color: 'text.primary',
                borderColor: 'divider',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover',
                },
              }}
            >
              {t('messages.backToTickets')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              fullWidth={isMobile}
              size={isMobile ? 'small' : 'medium'}
              sx={{ 
                color: 'text.primary',
                borderColor: 'divider',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover',
                },
              }}
            >
              {t('labels.refresh')}
            </Button>
          </Stack>
        </Stack>
        
        <Alert 
          severity="error"
          sx={{
            backgroundColor: 'error.light',
            color: 'error.contrastText',
          }}
        >
          {t('messages.errorLoadingStats')}
        </Alert>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, py: { xs: 2, sm: 3 } }}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={{ xs: 2, sm: 0 }}
          mb={{ xs: 2, sm: 3 }}
        >
          <Typography 
            variant={isMobile ? 'h5' : 'h4'} 
            fontWeight="bold"
            sx={{ color: 'text.primary' }}
          >
            {t('titles.supportStats')}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/support')}
            fullWidth={isMobile}
            size={isMobile ? 'small' : 'medium'}
            sx={{ 
              color: 'text.primary',
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover',
              },
            }}
          >
            {t('messages.backToTickets')}
          </Button>
        </Stack>

        <Alert 
          severity="info"
          sx={{
            backgroundColor: 'info.light',
            color: 'info.contrastText',
          }}
        >
          {t('messages.noStatsData')}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, py: { xs: 2, sm: 3 } }}>
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={{ xs: 2, sm: 0 }}
        mb={{ xs: 2, sm: 3 }}
      >
        <Typography 
          variant={isMobile ? 'h5' : 'h4'} 
          fontWeight="bold"
          sx={{ color: 'text.primary' }}
        >
          {t('titles.supportStats')}
        </Typography>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={1.5}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/support')}
            fullWidth={isMobile}
            size={isMobile ? 'small' : 'medium'}
            sx={{ 
              color: 'text.primary',
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover',
              },
            }}
          >
            {t('messages.backToTickets')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={isLoading}
            fullWidth={isMobile}
            size={isMobile ? 'small' : 'medium'}
            sx={{ 
              color: 'text.primary',
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover',
              },
            }}
          >
            {t('labels.refresh')}
          </Button>
        </Stack>
      </Stack>

      <SupportStatsCards stats={stats} isLoading={isLoading} />
    </Box>
  );
};