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
  userInfo?: {
    phone?: string;
    firstName?: string;
    lastName?: string;
  };
  name?: string;
  email?: string;
  totalSpent: number;
  orderCount?: number;
  totalOrders?: number;
  averageOrderValue?: number;
  lastOrderDate?: string | Date;
  rank: number;
  tier?: string;
  score?: number;
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
          {rankings.map((customer, index) => {
            // حساب القيم المفقودة
            const orderCount = customer.orderCount || customer.totalOrders || 0;
            const averageOrderValue = customer.averageOrderValue ?? (orderCount > 0 ? customer.totalSpent / orderCount : 0);
            
            // بناء الاسم من userInfo إذا لم يكن موجوداً
            const name = customer.name || 
              (customer.userInfo?.firstName && customer.userInfo?.lastName
                ? `${customer.userInfo.firstName} ${customer.userInfo.lastName}`
                : customer.userInfo?.firstName || customer.userInfo?.phone || t('users:analytics.unknown', 'غير معروف'));
            
            // حساب الفئة بناءً على totalSpent
            const getTier = (spent: number): string => {
              if (spent >= 5000) return 'vip';
              if (spent >= 2000) return 'premium';
              if (spent >= 500) return 'regular';
              return 'new';
            };
            const tier = customer.tier || getTier(customer.totalSpent);
            
            return (
              <TableRow key={customer.userId || index} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {index < 3 && <Star sx={{ color: 'gold', fontSize: { xs: 16, sm: 20 } }} />}
                    <span>#{customer.rank || index + 1}</span>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: index < 3 ? 'bold' : 'normal' }}>
                  {name}
                </TableCell>
                {!isMobile && (
                  <TableCell sx={{ color: 'text.secondary', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    {customer.email || customer.userInfo?.phone || '-'}
                  </TableCell>
                )}
                <TableCell align="center">
                  <Chip
                    label={t(`users:analytics.tiers.${tier.toLowerCase()}`, tier)}
                    size="small"
                    color={getTierColor(tier)}
                    sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                  />
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  {customer.totalSpent?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'} $
                </TableCell>
                <TableCell align="center">{orderCount}</TableCell>
                {!isMobile && (
                  <TableCell align="right" sx={{ color: 'text.secondary' }}>
                    {averageOrderValue?.toFixed(2) || '0.00'} $
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

