import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  useTheme,
  useMediaQuery,
  Box,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { User } from '../types/user.types';

interface DeleteUserDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  open,
  user,
  onClose,
  onConfirm,
  loading = false,
}) => {
  const { t } = useTranslation(['users', 'common']);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const userName =
    user?.firstName || user?.lastName
      ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
      : user?.phone || t('users:dialog.delete.unknownUser', 'مستخدم غير معروف');

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: isMobile ? 0 : 2,
          bgcolor: 'background.paper',
          backgroundImage: 'none',
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 1,
          fontSize: { xs: '1.1rem', sm: '1.25rem' },
          fontWeight: 'bold',
          color: 'error.main',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Box
          component="span"
          sx={{
            fontSize: { xs: '1.5rem', sm: '1.75rem' },
          }}
        >
          🗑️
        </Box>
        {t('users:dialog.delete.title', 'حذف المستخدم')}
      </DialogTitle>

      <DialogContent>
        <DialogContentText
          sx={{
            mb: 2,
            fontSize: { xs: '0.875rem', sm: '0.95rem' },
            color: 'text.primary',
            lineHeight: 1.6,
          }}
        >
          {t(
            'users:dialog.delete.message',
            'هل أنت متأكد من حذف المستخدم {{name}}؟',
            { name: userName }
          )}
          <br />
          <Box
            component="span"
            sx={{
              mt: 1,
              display: 'block',
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              color: 'text.secondary',
            }}
          >
            {t(
              'users:dialog.delete.note',
              'يمكنك استعادة المستخدم لاحقاً من المستخدمين المحذوفين.'
            )}
          </Box>
        </DialogContentText>
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          pb: { xs: 2, sm: 2 },
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          gap: { xs: 1, sm: 0 },
        }}
      >
        <Button
          onClick={onClose}
          color="inherit"
          variant={isMobile ? 'outlined' : 'outlined'}
          disabled={loading}
          fullWidth={isMobile}
          sx={{
            minWidth: { xs: '100%', sm: 100 },
          }}
        >
          {t('common:actions.cancel', 'إلغاء')}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={loading}
          fullWidth={isMobile}
          sx={{
            minWidth: { xs: '100%', sm: 100 },
            bgcolor: 'error.main',
            '&:hover': {
              bgcolor: 'error.dark',
            },
            '&:disabled': {
              bgcolor: theme.palette.mode === 'dark'
                ? 'rgba(211, 47, 47, 0.3)'
                : 'rgba(211, 47, 47, 0.5)',
            },
          }}
        >
          {loading
            ? t('common:loading', 'جاري التنفيذ...')
            : t('users:actions.delete', 'حذف')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
