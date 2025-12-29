import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Skeleton,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  Download,
  Refresh,
  AccountBalance,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ar } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { commissionsApi } from '../api/commissionsApi';
import { AccountStatementParams } from '../types/commissions.types';
import { formatNumber, formatCurrency } from '@/shared/utils/formatters';
import { exportAccountStatementToExcel } from '../utils/exportUtils';

export const EngineerAccountStatementPage: React.FC = () => {
  const { engineerId } = useParams<{ engineerId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(['commissions', 'common']);

  const [params, setParams] = useState<AccountStatementParams>({
    dateFrom: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
  });

  const {
    data: statement,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['account-statement', engineerId, params],
    queryFn: () => commissionsApi.getAccountStatement(engineerId!, params),
    enabled: !!engineerId,
  });

  const handleDateFromChange = (date: Date | null) => {
    if (date) {
      setParams((prev) => ({
        ...prev,
        dateFrom: date.toISOString().split('T')[0],
      }));
    }
  };

  const handleDateToChange = (date: Date | null) => {
    if (date) {
      setParams((prev) => ({
        ...prev,
        dateTo: date.toISOString().split('T')[0],
      }));
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'commission':
        return 'success';
      case 'withdrawal':
        return 'error';
      case 'refund':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'commission':
        return t('commissions:statement.transactionTypes.commission', 'عمولة');
      case 'withdrawal':
        return t('commissions:statement.transactionTypes.withdrawal', 'سحب');
      case 'refund':
        return t('commissions:statement.transactionTypes.refund', 'استرداد');
      default:
        return type;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ar}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/admin/commissions/reports')}
          >
            {t('common:actions.back', 'رجوع')}
          </Button>
          <Typography variant="h4" fontWeight="bold">
            {t('commissions:statement.title', 'كشف حساب المهندس')}
          </Typography>
        </Box>

        {/* Date Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <DatePicker
                  label={t('commissions:statement.dateFrom', 'من تاريخ')}
                  value={params.dateFrom ? new Date(params.dateFrom) : null}
                  onChange={handleDateFromChange}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <DatePicker
                  label={t('commissions:statement.dateTo', 'إلى تاريخ')}
                  value={params.dateTo ? new Date(params.dateTo) : null}
                  onChange={handleDateToChange}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={() => refetch()}
                  disabled={isLoading}
                  fullWidth
                >
                  {t('common:actions.refresh', 'تحديث')}
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  disabled={!statement || isLoading}
                  fullWidth
                  onClick={() => statement && exportAccountStatementToExcel(statement)}
                >
                  {t('common:actions.export', 'تصدير')}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {t('commissions:statement.error', 'حدث خطأ أثناء جلب كشف الحساب')}
          </Alert>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Statement Content */}
        {statement && !isLoading && (
          <>
            {/* Engineer Info */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('commissions:statement.engineerInfo', 'معلومات المهندس')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('commissions:statement.engineerName', 'اسم المهندس')}
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {statement.engineerName}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('commissions:statement.engineerPhone', 'رقم الهاتف')}
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {statement.engineerPhone}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <AccountBalance color="primary" />
                      <Typography variant="body2" color="text.secondary">
                        {t('commissions:statement.openingBalance', 'الرصيد الافتتاحي')}
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight="bold">
                      {formatCurrency(statement.openingBalance)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <AccountBalance color="success" />
                      <Typography variant="body2" color="text.secondary">
                        {t('commissions:statement.closingBalance', 'الرصيد الختامي')}
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      {formatCurrency(statement.closingBalance)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <TrendingUp color="success" />
                      <Typography variant="body2" color="text.secondary">
                        {t('commissions:statement.totalCommissions', 'إجمالي العمولات')}
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      {formatCurrency(statement.summary.totalCommissions)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <TrendingDown color="error" />
                      <Typography variant="body2" color="text.secondary">
                        {t('commissions:statement.totalWithdrawals', 'إجمالي السحوبات')}
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight="bold" color="error.main">
                      {formatCurrency(statement.summary.totalWithdrawals)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Transactions Table */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('commissions:statement.transactions', 'المعاملات')}
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          {t('commissions:statement.transactionId', 'رقم المعاملة')}
                        </TableCell>
                        <TableCell>
                          {t('commissions:statement.type', 'النوع')}
                        </TableCell>
                        <TableCell align="right">
                          {t('commissions:statement.amount', 'المبلغ')}
                        </TableCell>
                        <TableCell>
                          {t('commissions:statement.orderId', 'رقم الطلب')}
                        </TableCell>
                        <TableCell>
                          {t('commissions:statement.couponCode', 'كود الكوبون')}
                        </TableCell>
                        <TableCell>
                          {t('commissions:statement.description', 'الوصف')}
                        </TableCell>
                        <TableCell>
                          {t('commissions:statement.date', 'التاريخ')}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {statement.transactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            <Typography variant="body2" color="text.secondary">
                              {t('commissions:statement.noTransactions', 'لا توجد معاملات')}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        statement.transactions.map((transaction) => (
                          <TableRow key={transaction.transactionId}>
                            <TableCell>{transaction.transactionId}</TableCell>
                            <TableCell>
                              <Chip
                                label={getTransactionTypeLabel(transaction.type)}
                                color={getTransactionTypeColor(transaction.type) as any}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body2"
                                color={
                                  transaction.type === 'commission'
                                    ? 'success.main'
                                    : transaction.type === 'withdrawal'
                                    ? 'error.main'
                                    : 'warning.main'
                                }
                                fontWeight="medium"
                              >
                                {transaction.type === 'commission' ? '+' : '-'}
                                {formatCurrency(Math.abs(transaction.amount))}
                              </Typography>
                            </TableCell>
                            <TableCell>{transaction.orderId || '-'}</TableCell>
                            <TableCell>
                              {transaction.couponCode ? (
                                <Chip label={transaction.couponCode} size="small" />
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell>{transaction.description || '-'}</TableCell>
                            <TableCell>
                              {new Date(transaction.createdAt).toLocaleDateString('ar-EG')}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            {/* Coupon Breakdown */}
            {statement.couponBreakdown.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('commissions:statement.couponBreakdown', 'تفصيل حسب الكوبون')}
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            {t('commissions:statement.couponCode', 'كود الكوبون')}
                          </TableCell>
                          <TableCell>
                            {t('commissions:statement.couponName', 'اسم الكوبون')}
                          </TableCell>
                          <TableCell align="right">
                            {t('commissions:statement.commissionRate', 'نسبة العمولة')}
                          </TableCell>
                          <TableCell align="right">
                            {t('commissions:statement.totalCommission', 'إجمالي العمولة')}
                          </TableCell>
                          <TableCell align="right">
                            {t('commissions:statement.transactionCount', 'عدد المعاملات')}
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {statement.couponBreakdown.map((coupon) => (
                          <TableRow key={coupon.couponCode}>
                            <TableCell>
                              <Chip label={coupon.couponCode} size="small" />
                            </TableCell>
                            <TableCell>{coupon.couponName}</TableCell>
                            <TableCell align="right">{coupon.commissionRate}%</TableCell>
                            <TableCell align="right">
                              {formatCurrency(coupon.totalCommission)}
                            </TableCell>
                            <TableCell align="right">
                              {formatNumber(coupon.transactionCount)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </Box>
    </LocalizationProvider>
  );
};

