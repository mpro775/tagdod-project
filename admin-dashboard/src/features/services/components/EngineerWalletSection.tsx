import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
} from '@mui/material';
import { Add, AccountBalance } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatDate } from '@/shared/utils/formatters';
import {
  useEngineerTransactions,
  useManageEngineerWallet,
} from '@/features/users/hooks/useEngineerProfileAdmin';
import type { EngineerProfileAdmin } from '@/features/users/types/user.types';

interface EngineerWalletSectionProps {
  profile: EngineerProfileAdmin;
  userId: string;
}

export const EngineerWalletSection: React.FC<EngineerWalletSectionProps> = ({
  profile,
  userId,
}) => {
  const { t } = useTranslation(['services', 'common']);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [transactionPage, setTransactionPage] = useState(1);
  const [walletType, setWalletType] = useState<'add' | 'deduct' | 'withdraw'>('add');
  const [walletAmount, setWalletAmount] = useState('');
  const [walletReason, setWalletReason] = useState('');

  const { data: transactionsData, isLoading: transactionsLoading } = useEngineerTransactions(
    userId,
    transactionPage,
    10
  );

  const manageWalletMutation = useManageEngineerWallet();

  // حساب القيم المطلوبة للـ disabled button
  const isFormValid = useMemo(() => {
    const amount = parseFloat(walletAmount);
    const trimmedReason = walletReason.trim();
    return walletAmount && !isNaN(amount) && amount > 0 && trimmedReason.length > 0;
  }, [walletAmount, walletReason]);

  const handleWalletSubmit = async () => {
    const amount = parseFloat(walletAmount);
    const trimmedReason = walletReason.trim();

    if (!walletAmount || isNaN(amount) || amount <= 0 || !trimmedReason) {
      return;
    }

    await manageWalletMutation.mutateAsync({
      userId,
      dto: {
        type: walletType,
        amount,
        reason: trimmedReason,
      },
    });

    setWalletDialogOpen(false);
    setWalletAmount('');
    setWalletReason('');
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'commission':
        return t('services:engineers.commission', 'عمولة');
      case 'withdrawal':
        return t('services:engineers.withdrawal', 'سحب');
      case 'refund':
        return t('services:engineers.refund', 'استرداد');
      default:
        return type;
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

  return (
    <>
      <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">{t('services:engineers.wallet', 'المحفظة')}</Typography>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => {
                setWalletType('add');
                setWalletAmount('');
                setWalletReason('');
                setWalletDialogOpen(true);
              }}
            >
              {t('services:engineers.manageWallet', 'إدارة الرصيد')}
            </Button>
          </Box>

          {/* Current Balance */}
          <Box
            sx={{
              p: 3,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              borderRadius: 2,
              mb: 3,
              textAlign: 'center',
            }}
          >
            <AccountBalance sx={{ fontSize: '3rem', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {formatCurrency(profile.walletBalance || 0)}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {t('services:engineers.currentBalance', 'الرصيد الحالي')}
            </Typography>
          </Box>

          {/* Transactions */}
          <Typography variant="subtitle1" gutterBottom>
            {t('services:engineers.transactions', 'سجل المعاملات')}
          </Typography>

          {transactionsLoading ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress size={24} />
            </Box>
          ) : transactionsData && transactionsData.transactions.length > 0 ? (
            <>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('common:date', 'التاريخ')}</TableCell>
                      <TableCell>{t('services:engineers.type', 'النوع')}</TableCell>
                      <TableCell>{t('services:engineers.amount', 'المبلغ')}</TableCell>
                      <TableCell>{t('services:engineers.description', 'الوصف')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactionsData.transactions.map((transaction, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                        <TableCell>
                          <Chip
                            label={getTransactionTypeLabel(transaction.type)}
                            color={getTransactionTypeColor(transaction.type) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            color={transaction.amount > 0 ? 'success.main' : 'error.main'}
                            fontWeight="medium"
                          >
                            {transaction.amount > 0 ? '+' : ''}
                            {formatCurrency(Math.abs(transaction.amount))}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {transaction.description || '-'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {transactionsData.total > transactionsData.limit && (
                <Box display="flex" justifyContent="center" mt={2}>
                  <Pagination
                    count={Math.ceil(transactionsData.total / transactionsData.limit)}
                    page={transactionPage}
                    onChange={(_, value) => setTransactionPage(value)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          ) : (
            <Alert severity="info">
              {t('services:engineers.noTransactions', 'لا توجد معاملات')}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Wallet Management Dialog */}
      <Dialog
        open={walletDialogOpen}
        onClose={() => {
          setWalletDialogOpen(false);
          setWalletAmount('');
          setWalletReason('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('services:engineers.manageWallet', 'إدارة الرصيد')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>{t('services:engineers.operationType', 'نوع العملية')}</InputLabel>
              <Select
                value={walletType}
                label={t('services:engineers.operationType', 'نوع العملية')}
                onChange={(e) => setWalletType(e.target.value as 'add' | 'deduct' | 'withdraw')}
              >
                <MenuItem value="add">{t('services:engineers.add', 'إضافة')}</MenuItem>
                <MenuItem value="deduct">{t('services:engineers.deduct', 'خصم')}</MenuItem>
                <MenuItem value="withdraw">{t('services:engineers.withdraw', 'سحب')}</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label={t('services:engineers.amount', 'المبلغ')}
              type="number"
              value={walletAmount}
              onChange={(e) => setWalletAmount(e.target.value)}
              fullWidth
              inputProps={{ min: 0.01, step: 0.01 }}
            />

            <TextField
              label={t('services:engineers.reason', 'السبب')}
              value={walletReason}
              onChange={(e) => setWalletReason(e.target.value)}
              fullWidth
              multiline
              rows={3}
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setWalletDialogOpen(false);
              setWalletAmount('');
              setWalletReason('');
            }}
          >
            {t('common:actions.cancel', 'إلغاء')}
          </Button>
          <Button
            onClick={handleWalletSubmit}
            variant="contained"
            disabled={!isFormValid || manageWalletMutation.isPending}
          >
            {manageWalletMutation.isPending ? (
              <CircularProgress size={20} />
            ) : (
              t('common:actions.confirm', 'تأكيد')
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
