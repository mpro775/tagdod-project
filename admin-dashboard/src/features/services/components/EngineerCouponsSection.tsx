import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import { LocalOffer, Add, CheckCircle, ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatNumber, formatCurrency } from '@/shared/utils/formatters';
import {
  useEngineerCoupons,
  useEngineerCouponStats,
} from '@/features/marketing/hooks/useMarketing';

interface EngineerCouponsSectionProps {
  engineerId: string;
}

export const EngineerCouponsSection: React.FC<EngineerCouponsSectionProps> = ({ engineerId }) => {
  const { t } = useTranslation(['services', 'common']);
  const navigate = useNavigate();

  const { data: coupons, isLoading: couponsLoading } = useEngineerCoupons(engineerId);
  const { data: stats, isLoading: statsLoading } = useEngineerCouponStats(engineerId);

  const handleCreateCoupon = () => {
    navigate(`/coupons/new?engineerId=${engineerId}`);
  };

  const handleViewAll = () => {
    navigate(`/services/engineers/${engineerId}/coupons`);
  };

  if (couponsLoading || statsLoading) {
    return (
      <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress size={24} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            {t('services:engineers.coupons', 'كوبونات المهندس')}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Add />}
              onClick={handleCreateCoupon}
            >
              {t('services:engineers.createCoupon', 'إنشاء كوبون')}
            </Button>
            <Button
              variant="text"
              size="small"
              endIcon={<ArrowForward />}
              onClick={handleViewAll}
            >
              {t('common:actions.viewAll', 'عرض الكل')}
            </Button>
          </Stack>
        </Box>

        {/* Statistics */}
        {stats && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Box textAlign="center">
                <Typography variant="h5" color="primary">
                  {formatNumber(stats.totalCoupons || 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('services:engineers.totalCoupons', 'إجمالي الكوبونات')}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Box textAlign="center">
                <Typography variant="h5" color="success.main">
                  {formatNumber(stats.activeCoupons || 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('services:engineers.activeCoupons', 'كوبونات نشطة')}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Box textAlign="center">
                <Typography variant="h5" color="info.main">
                  {formatNumber(stats.totalUses || 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('services:engineers.totalUses', 'إجمالي الاستخدامات')}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Box textAlign="center">
                <Typography variant="h5" color="warning.main">
                  {formatCurrency(stats.totalCommissionEarned || 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('services:engineers.totalCommission', 'إجمالي العمولات')}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        )}

        {/* Coupons List */}
        {coupons && coupons.length > 0 ? (
          <Stack spacing={1}>
            {coupons.slice(0, 5).map((coupon: any) => (
              <Box
                key={coupon._id}
                sx={{
                  p: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <LocalOffer fontSize="small" color="primary" />
                    <Typography variant="body2" fontWeight="medium">
                      {coupon.code}
                    </Typography>
                    {coupon.status === 'active' && (
                      <Chip
                        label={t('common:status.active', 'نشط')}
                        color="success"
                        size="small"
                        icon={<CheckCircle />}
                      />
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {coupon.name}
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant="body2" fontWeight="medium" color="success.main">
                    {formatNumber(coupon.usedCount || 0)}{' '}
                    {t('services:engineers.uses', 'استخدام')}
                  </Typography>
                  {coupon.commissionRate && (
                    <Typography variant="caption" color="text.secondary">
                      {coupon.commissionRate}% {t('services:engineers.commission', 'عمولة')}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
            {coupons.length > 5 && (
              <Button
                size="small"
                onClick={handleViewAll}
                endIcon={<ArrowForward />}
                fullWidth
              >
                {t('common:actions.viewAll', 'عرض الكل')} ({coupons.length})
              </Button>
            )}
          </Stack>
        ) : (
          <Alert severity="info" sx={{ mt: 2 }}>
            {t('services:engineers.noCoupons', 'لا توجد كوبونات لهذا المهندس')}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

