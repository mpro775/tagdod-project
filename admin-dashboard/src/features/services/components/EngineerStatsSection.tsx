import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
} from '@mui/material';
import { Sync, TrendingUp, Star, CheckCircle, AccountBalance } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { formatNumber, formatCurrency } from '@/shared/utils/formatters';
import { useSyncEngineerStats } from '@/features/users/hooks/useEngineerProfileAdmin';
import type { EngineerProfileAdmin } from '@/features/users/types/user.types';

interface EngineerStatsSectionProps {
  profile: EngineerProfileAdmin;
  userId: string;
}

export const EngineerStatsSection: React.FC<EngineerStatsSectionProps> = ({ profile, userId }) => {
  const { t } = useTranslation(['services', 'common']);
  const syncStatsMutation = useSyncEngineerStats();

  const handleSyncStats = async () => {
    await syncStatsMutation.mutateAsync({
      userId,
      dto: {
        syncRatings: true,
        syncStatistics: true,
      },
    });
  };

  return (
    <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            {t('services:engineers.statistics', 'الإحصائيات')}
          </Typography>
          <Button
            variant="outlined"
            startIcon={syncStatsMutation.isPending ? <CircularProgress size={16} /> : <Sync />}
            onClick={handleSyncStats}
            disabled={syncStatsMutation.isPending}
            size="small"
          >
            {t('services:engineers.syncStats', 'مزامنة الإحصائيات')}
          </Button>
        </Box>

        <Grid container spacing={2}>
          {/* Total Completed Services */}
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box
              sx={{
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 1,
                textAlign: 'center',
              }}
            >
              <CheckCircle sx={{ fontSize: '2rem', color: 'success.main', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                {formatNumber(profile.totalCompletedServices || 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('services:engineers.completedServices', 'خدمات مكتملة')}
              </Typography>
            </Box>
          </Grid>

          {/* Total Earnings */}
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box
              sx={{
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 1,
                textAlign: 'center',
              }}
            >
              <TrendingUp sx={{ fontSize: '2rem', color: 'info.main', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold" color="success.main">
                {formatCurrency(profile.totalEarnings || 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('services:engineers.totalEarnings', 'إجمالي الأرباح')}
              </Typography>
            </Box>
          </Grid>

          {/* Average Rating */}
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box
              sx={{
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 1,
                textAlign: 'center',
              }}
            >
              <Star sx={{ fontSize: '2rem', color: 'warning.main', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                {profile.averageRating.toFixed(1)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('services:engineers.averageRating', 'متوسط التقييم')}
              </Typography>
            </Box>
          </Grid>

          {/* Total Ratings */}
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box
              sx={{
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 1,
                textAlign: 'center',
              }}
            >
              <AccountBalance sx={{ fontSize: '2rem', color: 'primary.main', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                {formatNumber(profile.totalRatings || 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('services:engineers.totalRatings', 'إجمالي التقييمات')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

