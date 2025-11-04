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
  useTheme,
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
  const theme = useTheme();

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
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>
        {t('messages.deleteConfirmTitle')}
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.message || t('messages.unknownError')}
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" color="text.primary" gutterBottom>
            {t('messages.deleteConfirmMessage')}
          </Typography>
        </Box>

        {brand && (
          <Box
            sx={{
              p: 2,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'grey.50',
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
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'white',
                  }}
                />
              )}
              <Box>
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  {brand.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {brand.nameEn}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('fields.slug')}: {brand.slug}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.primary">
            {t('messages.deleteWarning')}
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
          {t('dialogs.cancel')}
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={loading ? <CircularProgress size={20} /> : <Delete />}
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? t('dialogs.deleting') : t('dialogs.delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
