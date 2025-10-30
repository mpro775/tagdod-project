import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Delete, Cancel } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { Brand } from '../types/brand.types';

interface BrandDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  brand: Brand | null;
  loading?: boolean;
  error?: Error | null;
}

export const BrandDeleteDialog: React.FC<BrandDeleteDialogProps> = ({
  open,
  onClose,
  onConfirm,
  brand,
  loading = false,
  error,
}) => {
  const { t } = useTranslation('brands');

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold" color="error">
          {t('messages.deleteConfirmTitle', { defaultValue: 'تأكيد حذف العلامة التجارية' })}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.message || t('messages.unknownError', { defaultValue: 'حدث خطأ غير معروف' })}
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            {t('messages.deleteConfirmMessage', { defaultValue: 'هل أنت متأكد من حذف هذه العلامة؟ لا يمكن التراجع.' })}
          </Typography>
        </Box>

        {brand && (
          <Box
            sx={{
              p: 2,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              backgroundColor: 'grey.50',
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              {brand.image && (
                <Box
                  component="img"
                  src={brand.image}
                  alt={brand.name}
                  sx={{
                    width: 60,
                    height: 60,
                    objectFit: 'contain',
                    borderRadius: 1,
                  }}
                />
              )}
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {brand.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {brand.nameEn}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('messages.slug', { defaultValue: 'المعرف (Slug)' })}: {brand.slug}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            {t('messages.deleteWarning', { defaultValue: 'سيتم حذف جميع البيانات المرتبطة بهذه العلامة بشكل دائم.' })}
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="outlined"
          startIcon={<Cancel />}
          onClick={handleClose}
          disabled={loading}
        >
          {t('dialogs.cancel', { defaultValue: 'إلغاء' })}
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={loading ? <CircularProgress size={20} /> : <Delete />}
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? t('dialogs.deleting', { defaultValue: 'جارٍ الحذف...' }) : t('dialogs.delete', { defaultValue: 'حذف' })}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
