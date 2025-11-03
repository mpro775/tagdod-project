import React from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Chip,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Star } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface CustomerRanking {
  userId: string;
  name: string;
  email: string;
  totalSpent: number;
  orderCount: number;
  averageOrderValue: number;
  lastOrderDate: string;
  rank: number;
  tier: string;
}

interface CustomerRankingsTableProps {
  rankings: CustomerRanking[];
  loading?: boolean;
}

const getTierColor = (tier: string): 'error' | 'warning' | 'info' | 'default' => {
  switch (tier?.toLowerCase()) {
    case 'vip':
      return 'error';
    case 'premium':
      return 'warning';
    case 'regular':
      return 'info';
    default:
      return 'default';
  }
};

export const CustomerRankingsTable: React.FC<CustomerRankingsTableProps> = ({
  rankings,
  loading = false,
}) => {
  const { t } = useTranslation(['users', 'common']);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (loading || rankings.length === 0) {
    return null;
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        bgcolor: 'background.paper',
        backgroundImage: 'none',
        boxShadow: theme.palette.mode === 'dark' ? 2 : 1,
        overflowX: 'auto',
      }}
    >
      <Table size={isMobile ? 'small' : 'medium'}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              {t('users:analytics.table.rank', 'الترتيب')}
            </TableCell>
            <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              {t('users:analytics.table.customer', 'العميل')}
            </TableCell>
            {!isMobile && (
              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                {t('users:analytics.table.email', 'البريد الإلكتروني')}
              </TableCell>
            )}
            <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              {t('users:analytics.table.tier', 'الفئة')}
            </TableCell>
            <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              {t('users:analytics.table.totalSpent', 'إجمالي الإنفاق')}
            </TableCell>
            <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              {t('users:analytics.table.orderCount', 'عدد الطلبات')}
            </TableCell>
            {!isMobile && (
              <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                {t('users:analytics.table.averageOrder', 'متوسط الطلب')}
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {rankings.map((customer, index) => (
            <TableRow key={customer.userId} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {index < 3 && <Star sx={{ color: 'gold', fontSize: { xs: 16, sm: 20 } }} />}
                  <span>#{index + 1}</span>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: index < 3 ? 'bold' : 'normal' }}>
                {customer.name || t('users:analytics.unknown', 'غير معروف')}
              </TableCell>
              {!isMobile && (
                <TableCell sx={{ color: 'text.secondary', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  {customer.email}
                </TableCell>
              )}
              <TableCell align="center">
                <Chip
                  label={
                    customer.tier
                      ? t(`users:analytics.tiers.${customer.tier.toLowerCase()}`, customer.tier)
                      : t('users:analytics.tiers.regular', 'عادي')
                  }
                  size="small"
                  color={getTierColor(customer.tier)}
                  sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                />
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {customer.totalSpent.toLocaleString('en-US')} $
              </TableCell>
              <TableCell align="center">{customer.orderCount}</TableCell>
              {!isMobile && (
                <TableCell align="right" sx={{ color: 'text.secondary' }}>
                  {customer.averageOrderValue.toFixed(2)} $
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

