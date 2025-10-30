import React from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  Skeleton,
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
  const { data: stats, isLoading, error, refetch } = useSupportStats();

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold">
            {t('titles.supportStats', { defaultValue: 'إحصائيات التذاكر' })}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {t('labels.refresh', { defaultValue: 'تحديث' }  )}
          </Button>
        </Stack>
        
        <Box>
          <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
          <Skeleton variant="rectangular" height={400} />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold">
            {t('titles.supportStats', { defaultValue: 'إحصائيات التذاكر' })}
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/support')}
            >
              {t('messages.backToTickets', { defaultValue: 'العودة للتذاكر' })}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
            >
              {t('labels.refresh', { defaultValue: 'تحديث' })}
            </Button>
          </Stack>
        </Stack>
        
        <Alert severity="error">
          {t('messages.errorLoadingStats', { defaultValue: 'حدث خطأ أثناء تحميل الإحصائيات' })}
        </Alert>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold">
            {t('titles.supportStats', { defaultValue: 'إحصائيات التذاكر' })}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/support')}
          >
            {t('messages.backToTickets', { defaultValue: 'العودة للتذاكر' })}
          </Button>
        </Stack>

        <Alert severity="info">
          {t('messages.noStatsData', { defaultValue: 'لا توجد بيانات إحصائية متاحة' })}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          {t('titles.supportStats', { defaultValue: 'إحصائيات التذاكر' })}
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/support')}
          >
            {t('messages.backToTickets', { defaultValue: 'العودة للتذاكر' })}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {t('labels.refresh', { defaultValue: 'تحديث' }    )}
          </Button>
        </Stack>
      </Stack>

      <SupportStatsCards stats={stats} isLoading={isLoading} />
    </Box>
  );
};