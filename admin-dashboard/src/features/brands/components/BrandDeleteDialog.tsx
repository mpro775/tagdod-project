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
          تأكيد الحذف
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.message || 'حدث خطأ أثناء العملية'}
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            هل أنت متأكد من أنك تريد حذف العلامة التجارية التالية؟
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
                  Slug: {brand.slug}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>تحذير:</strong> هذا الإجراء لا يمكن التراجع عنه. سيتم حذف العلامة التجارية نهائياً.
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
          إلغاء
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={loading ? <CircularProgress size={20} /> : <Delete />}
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? 'جاري الحذف...' : 'حذف نهائياً'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
