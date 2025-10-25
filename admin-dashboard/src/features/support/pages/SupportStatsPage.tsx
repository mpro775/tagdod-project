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
import { useSupportStats } from '../hooks/useSupport';
import { SupportStatsCards } from '../components';

export const SupportStatsPage: React.FC = () => {
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
            إحصائيات الدعم الفني
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            تحديث
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
            إحصائيات الدعم الفني
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/support')}
            >
              العودة للتذاكر
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
            >
              تحديث
            </Button>
          </Stack>
        </Stack>
        
        <Alert severity="error">
          حدث خطأ في تحميل الإحصائيات. يرجى المحاولة مرة أخرى.
        </Alert>
      </Box>
    );
  }

  if (!stats?.data) {
    return (
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold">
            إحصائيات الدعم الفني
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/support')}
          >
            العودة للتذاكر
          </Button>
        </Stack>
        
        <Alert severity="info">
          لا توجد بيانات متاحة للإحصائيات.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          إحصائيات الدعم الفني
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/support')}
          >
            العودة للتذاكر
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            تحديث
          </Button>
        </Stack>
      </Stack>

      <SupportStatsCards stats={stats.data} isLoading={isLoading} />
    </Box>
  );
};