import React from 'react';
import { alpha, Box, Chip, Stack, Typography, useTheme } from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { EmptyState, LoadingState, designRadius } from '@/shared/design-system';
import type { CustomerRanking } from '../hooks/useUserAnalytics';

interface TopCustomersCardsProps {
  customers: CustomerRanking[];
  limit?: number;
  loading?: boolean;
}

const formatMoney = (value: number) =>
  `${value.toLocaleString('en-US', { maximumFractionDigits: 0 })} $`;

const getTierColor = (tier: string): 'error' | 'warning' | 'info' | 'success' | 'default' => {
  switch (tier?.toLowerCase()) {
    case 'vip':
      return 'error';
    case 'premium':
      return 'warning';
    case 'regular':
      return 'info';
    case 'new':
      return 'success';
    default:
      return 'default';
  }
};

export const TopCustomersCards: React.FC<TopCustomersCardsProps> = ({
  customers,
  limit = 10,
  loading = false,
}) => {
  const { t } = useTranslation(['users', 'common']);
  const theme = useTheme();

  if (loading && customers.length === 0) {
    return <LoadingState variant="skeleton" rows={5} title={t('common:loading', 'جاري التحميل...')} />;
  }

  if (customers.length === 0) {
    return (
      <EmptyState
        title={t('users:analytics.topCustomers.emptyTitle', 'لا توجد بيانات لأفضل العملاء')}
        description={t(
          'users:analytics.topCustomers.emptyDescription',
          'ستظهر القائمة بعد توفر طلبات وإنفاق كافيين للتحليل.'
        )}
        icon={<EmojiEvents />}
      />
    );
  }

  const visibleCustomers = customers.slice(0, limit);
  const podiumCustomers = visibleCustomers.slice(0, 3);
  const restCustomers = visibleCustomers.slice(3);

  return (
    <Stack spacing={1.25}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(3, minmax(0, 1fr))',
          },
          gap: 1,
        }}
      >
        {podiumCustomers.map((customer) => {
          const isFirst = customer.rank === 1;

          return (
            <Box
              key={customer.userId}
              sx={{
                p: 1.25,
                minHeight: 104,
                border: '1px solid',
                borderColor: isFirst
                  ? alpha(theme.palette.warning.main, 0.42)
                  : alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.16 : 0.9),
                borderRadius: `${designRadius.md}px`,
                bgcolor: alpha(
                  isFirst ? theme.palette.warning.main : theme.palette.primary.main,
                  theme.palette.mode === 'dark' ? 0.08 : 0.04
                ),
              }}
            >
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                  <Chip
                    label={`#${customer.rank}`}
                    size="small"
                    color={isFirst ? 'warning' : 'primary'}
                    sx={{ fontWeight: 800, minWidth: 44 }}
                  />
                  <Chip
                    label={t(`users:analytics.tiers.${customer.tier.toLowerCase()}`, customer.tier)}
                    size="small"
                    color={getTierColor(customer.tier)}
                    variant="outlined"
                  />
                </Stack>
                <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>
                    {customer.name || t('users:analytics.unknown', 'غير معروف')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {customer.contact || customer.userInfo?.phone || customer.email || '-'}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }}>
                    {formatMoney(customer.totalSpent)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('users:analytics.topCustomers.orderCount', '{{count}} طلب', {
                      count: customer.orderCount,
                    })}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          );
        })}
      </Box>

      {restCustomers.length > 0 && (
        <Stack spacing={0.75}>
          {restCustomers.map((customer) => (
            <Box
              key={customer.userId}
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '52px minmax(0, 1fr)',
                  md: '64px minmax(0, 1.5fr) 132px 96px 112px',
                },
                alignItems: 'center',
                gap: { xs: 0.75, md: 1.25 },
                p: 1,
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.14 : 0.9),
                borderRadius: `${designRadius.md}px`,
                bgcolor: alpha(theme.palette.background.paper, 0.7),
              }}
            >
              <Chip label={`#${customer.rank}`} size="small" variant="outlined" sx={{ fontWeight: 800 }} />
              <Stack spacing={0.1} sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                  {customer.name || t('users:analytics.unknown', 'غير معروف')}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {customer.contact || customer.userInfo?.phone || customer.email || '-'}
                </Typography>
              </Stack>
              <Typography
                variant="body2"
                sx={{ fontWeight: 800, color: 'success.main', display: { xs: 'none', md: 'block' } }}
              >
                {formatMoney(customer.totalSpent)}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: { xs: 'none', md: 'block' } }}
              >
                {customer.orderCount.toLocaleString('en-US')} طلب
              </Typography>
              <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end' }}>
                <Chip
                  label={t(`users:analytics.tiers.${customer.tier.toLowerCase()}`, customer.tier)}
                  size="small"
                  color={getTierColor(customer.tier)}
                  variant="outlined"
                />
              </Box>
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
};
