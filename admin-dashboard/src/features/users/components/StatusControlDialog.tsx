import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
  Typography,
  CircularProgress,
  TextField,
  Chip,
} from '@mui/material';
import { VerifiedUser, Store } from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/usersApi';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { CapabilityStatus } from '../types/user.types';

interface StatusControlDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  userName?: string;
  type: 'engineer' | 'merchant';
  currentStatus: string;
  currentDiscountPercent?: number;
}

export const StatusControlDialog: React.FC<StatusControlDialogProps> = ({
  open,
  onClose,
  userId,
  userName,
  type,
  currentStatus,
  currentDiscountPercent = 0,
}) => {
  const { t } = useTranslation(['users', 'common']);
  const queryClient = useQueryClient();
  const [newStatus, setNewStatus] = useState<CapabilityStatus>(currentStatus as CapabilityStatus);
  const [discountPercent, setDiscountPercent] = useState<number>(currentDiscountPercent);

  const { mutate: updateEngineerStatus, isPending: isUpdatingEngineer } = useMutation({
    mutationFn: (status: string) => usersApi.updateEngineerStatus(userId, status),
    onSuccess: () => {
      toast.success(t('users:actions.statusUpdateSuccess', 'تم تحديث الحالة بنجاح'));
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || t('users:actions.statusUpdateError', 'فشل تحديث الحالة'));
    },
  });

  const { mutate: updateMerchantStatus, isPending: isUpdatingMerchant } = useMutation({
    mutationFn: ({ status, discount }: { status: string; discount?: number }) => 
      usersApi.updateMerchantStatus(userId, status, discount),
    onSuccess: () => {
      toast.success(t('users:actions.statusUpdateSuccess', 'تم تحديث الحالة بنجاح'));
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || t('users:actions.statusUpdateError', 'فشل تحديث الحالة'));
    },
  });

  const isPending = isUpdatingEngineer || isUpdatingMerchant;

  const handleClose = () => {
    setNewStatus(currentStatus as CapabilityStatus);
    setDiscountPercent(currentDiscountPercent);
    onClose();
  };

  const handleSubmit = () => {
    if (type === 'engineer') {
      updateEngineerStatus(newStatus);
    } else {
      updateMerchantStatus({ 
        status: newStatus, 
        discount: newStatus === CapabilityStatus.APPROVED ? discountPercent : undefined,
      });
    }
  };

  const getStatusColor = (status: CapabilityStatus) => {
    switch (status) {
      case CapabilityStatus.APPROVED:
        return 'success';
      case CapabilityStatus.PENDING:
        return 'warning';
      case CapabilityStatus.REJECTED:
        return 'error';
      case CapabilityStatus.UNVERIFIED:
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: CapabilityStatus) => {
    switch (status) {
      case CapabilityStatus.APPROVED:
        return t('users:status.approved', 'موافق عليه');
      case CapabilityStatus.PENDING:
        return t('users:status.pending', 'قيد المراجعة');
      case CapabilityStatus.REJECTED:
        return t('users:status.rejected', 'مرفوض');
      case CapabilityStatus.UNVERIFIED:
        return t('users:status.unverified', 'لم يتم التحقق');
      case CapabilityStatus.NONE:
        return t('users:status.none', 'غير مفعل');
      default:
        return status;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          {type === 'engineer' ? <VerifiedUser color="primary" /> : <Store color="primary" />}
          <Typography variant="h6">
            {type === 'engineer' 
              ? t('users:actions.updateEngineerStatus', 'تحديث حالة المهندس')
              : t('users:actions.updateMerchantStatus', 'تحديث حالة التاجر')
            }
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* User Info */}
          <Alert severity="info">
            <Typography variant="body2" fontWeight="bold">
              {t('users:labels.user', 'المستخدم')}: {userName}
            </Typography>
            <Box display="flex" alignItems="center" gap={1} sx={{ mt: 1 }}>
              <Typography variant="caption">
                {t('users:labels.currentStatus', 'الحالة الحالية')}:
              </Typography>
              <Chip 
                label={getStatusLabel(currentStatus as CapabilityStatus)}
                color={getStatusColor(currentStatus as CapabilityStatus)}
                size="small"
              />
            </Box>
          </Alert>

          {/* Status Selection */}
          <FormControl fullWidth>
            <InputLabel>{t('users:labels.newStatus', 'الحالة الجديدة')}</InputLabel>
            <Select
              value={newStatus}
              label={t('users:labels.newStatus', 'الحالة الجديدة')}
              onChange={(e) => setNewStatus(e.target.value as CapabilityStatus)}
              disabled={isPending}
            >
              <MenuItem value={CapabilityStatus.NONE}>
                <Chip label={getStatusLabel(CapabilityStatus.NONE)} color="default" size="small" sx={{ mr: 1 }} />
                {t('users:statusDescription.none', 'إلغاء الصلاحية')}
              </MenuItem>
              <MenuItem value={CapabilityStatus.UNVERIFIED}>
                <Chip label={getStatusLabel(CapabilityStatus.UNVERIFIED)} color="info" size="small" sx={{ mr: 1 }} />
                {t('users:statusDescription.unverified', 'لم يتم رفع الوثائق')}
              </MenuItem>
              <MenuItem value={CapabilityStatus.PENDING}>
                <Chip label={getStatusLabel(CapabilityStatus.PENDING)} color="warning" size="small" sx={{ mr: 1 }} />
                {t('users:statusDescription.pending', 'في انتظار المراجعة')}
              </MenuItem>
              <MenuItem value={CapabilityStatus.APPROVED}>
                <Chip label={getStatusLabel(CapabilityStatus.APPROVED)} color="success" size="small" sx={{ mr: 1 }} />
                {t('users:statusDescription.approved', 'موافق عليه ونشط')}
              </MenuItem>
              <MenuItem value={CapabilityStatus.REJECTED}>
                <Chip label={getStatusLabel(CapabilityStatus.REJECTED)} color="error" size="small" sx={{ mr: 1 }} />
                {t('users:statusDescription.rejected', 'مرفوض')}
              </MenuItem>
            </Select>
          </FormControl>

          {/* Discount for Merchants */}
          {type === 'merchant' && newStatus === CapabilityStatus.APPROVED && (
            <TextField
              fullWidth
              type="number"
              label={t('users:form.merchantDiscountPercent', 'نسبة الخصم (%)')}
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              disabled={isPending}
              InputProps={{
                inputProps: { 
                  min: 0, 
                  max: 100,
                  step: 1,
                }
              }}
              helperText={t('users:form.discountHelp', 'نسبة الخصم من 0 إلى 100')}
            />
          )}

          {/* Warning for rejected status */}
          {newStatus === CapabilityStatus.REJECTED && (
            <Alert severity="warning">
              {t('users:messages.rejectWarning', 'سيتم حذف الملفات المرفوعة عند الرفض')}
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={handleClose} 
          disabled={isPending}
        >
          {t('common:actions.cancel', 'إلغاء')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isPending || newStatus === currentStatus}
          startIcon={isPending ? <CircularProgress size={20} /> : null}
        >
          {isPending 
            ? t('common:loading', 'جاري التنفيذ...') 
            : t('common:actions.save', 'حفظ')
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

